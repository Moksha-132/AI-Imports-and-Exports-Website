import logging, datetime, os
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import get_database_session
import models
from hsn_engine import get_hsn, lookup_hsn
from trade_constants import COUNTRY_RISK, DUTY_TABLE
from dotenv import load_dotenv
from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType
from pydantic_models import ContactForm, ForgotPasswordRequest, UserLogin, UserCreate, ResetPasswordRequest, HSNRequest, DutyRequest

load_dotenv()
app = FastAPI(title="Shnoor Trade Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("TradeIntelligence")

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)
def calc_ts(o, d, ov, pd, tot):
    o_r = COUNTRY_RISK.get(o.lower().strip(), 15)
    d_r = COUNTRY_RISK.get(d.lower().strip(), 10)
    rt = 10 if (o_r >= 20 and d_r >= 15) else 0
    sc = 100.0 - o_r - (d_r * 0.5) - rt - (ov * 15) - ((tot - pd - ov) * 2) + min(pd * 3, 20)
    return round(max(0.0, min(100.0, sc)), 1)

@app.post("/documents", status_code=201)
async def upload_document(file: UploadFile = File(...), user_id: int = 1, db=Depends(get_database_session)):
    from ocr_engine import process
    f_b = await file.read()
    ext = process(f_b, file.filename)
    doc = models.Document(
        filename=file.filename, file_type=file.content_type or "unknown",
        extracted_data=ext, humanized_summary=ext.get("humanized_summary"),
        client_name=ext.get("client_name", "Primary Client"), status="processed", user_id=user_id
    )
    db.add(doc); db.commit(); db.refresh(doc)
    return {"id": doc.id, "filename": doc.filename, "status": doc.status, "extracted_data": ext}

@app.get("/documents")
async def list_documents(user_id: int = 1, db=Depends(get_database_session)):
    return db.query(models.Document).filter(models.Document.user_id == user_id).order_by(models.Document.created_at.desc()).all()

@app.post("/documents/{doc_id}/approve")
async def approve_document(doc_id: int, user_id: int = 1, db=Depends(get_database_session)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id, models.Document.user_id == user_id).first()
    if not doc: raise HTTPException(status_code=404)
    ext = doc.extracted_data or {}
    try:
        v_n = ext.get("vendor", "Unknown")
        vd = [d for d in db.query(models.Document).filter(models.Document.user_id == user_id).all() if d.extracted_data and d.extracted_data.get("vendor") == v_n]
        ov, pd, tot = len([d for d in vd if d.payment_status == "overdue"]), len([d for d in vd if d.payment_status == "paid"]), len(vd)
        o, d = ext.get("origin", "India"), ext.get("destination", "Germany")
        sc = calc_ts(o, d, ov, pd, tot)
        lvl = "Low" if sc > 80 else ("Medium" if sc > 50 else "High")
        msg = f"Cleared. Route: {o} → {d}." if sc > 70 else f"Route {o} → {d} carries risk. Score: {sc}"
        alt = db.query(models.RiskAlert).filter(models.RiskAlert.entity_name == v_n).first()
        if alt: alt.trust_score, alt.risk_level, alt.message = sc, lvl, msg
        else: db.add(models.RiskAlert(entity_name=v_n, risk_level=lvl, trust_score=sc, message=msg))
        sid = f"SHP-{ext.get('invoice_no', 'UNK')}-{doc.id}"
        shp = models.Shipment(shipment_id=sid, origin=v_n, destination=d, type=ext.get("transport_mode", "Sea"), status="Pending", eta=datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=7), user_id=user_id)
        db.add(shp); db.commit(); doc.shipment_id = shp.id; db.commit()
        return {"status": "success", "tracking_id": sid}
    except Exception as e:
        db.rollback(); log.error(f"Approve Error: {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.patch("/documents/{doc_id}/payment")
async def update_payment(doc_id: int, payload: dict, user_id: int = 1, db=Depends(get_database_session)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id, models.Document.user_id == user_id).first()
    if not doc: raise HTTPException(status_code=404)
    stat = payload.get("status", "unpaid")
    doc.payment_status = stat
    if stat == "paid":
        doc.paid_at = datetime.datetime.now(datetime.timezone.utc)
        if doc.shipment: doc.shipment.status = "Processed"
    elif doc.shipment: doc.shipment.status = "Pending"
    db.commit()
    return {"status": "ok", "payment_status": doc.payment_status}

@app.post("/hsn")
async def classify_hsn(data: HSNRequest, user_id: int = 1, db=Depends(get_database_session)):
    res = get_hsn(data.description)
    db.add(models.HSNResult(product_desc=res["product_desc"], hsn_code=res["hsn_code"], confidence=res["confidence"], ai_logic=res["ai_logic"], explanation=res.get("explanation", ""), user_id=user_id))
    db.commit(); return res

@app.post("/duty")
async def calculate_duty(data: DutyRequest, user_id: int = 1, db=Depends(get_database_session)):
    dest, val, code = data.destination.lower().strip(), float(data.value), data.hsn_code
    rts = DUTY_TABLE.get(dest, [0.12, 0.15])
    d_rt, v_rt = rts[0] + (0.05 if code.startswith(("61", "62")) else 0), rts[1]
    b_d, a_t = val * d_rt, (val + (val * d_rt)) * v_rt
    res = {"country": dest.title(), "hsn_code": code, "currency": "USD", "basic_duty": b_d, "additional_tax": a_t, "total_tax": b_d + a_t, "user_id": user_id}
    try: db.add(models.Duty(**res)); db.commit()
    except Exception: db.rollback()
    return res

@app.get("/analytics")
async def get_analytics(user_id: int = 1, db=Depends(get_database_session)):
    docs = db.query(models.Document).filter(models.Document.user_id == user_id).all()
    vol, h_m, m_t = 0.0, {}, [0.0] * 12
    for d in docs:
        if not d.extracted_data: continue
        amt = float(d.extracted_data.get("amount") or 0.0)
        vol += amt; m_t[d.created_at.month - 1] += amt
        for c in (d.extracted_data.get("hsn_codes") or []):
            if c not in h_m: h_m[c] = {"count": 0, "volume": 0.0}
            h_m[c]["count"] += 1; h_m[c]["volume"] += amt
    top = []
    for c, s in sorted(h_m.items(), key=lambda x: x[1]["volume"], reverse=True)[:5]:
        dt = lookup_hsn(c)
        top.append({"code": c, "category": dt.get("description", "Item") if dt else "Item", "vol": f"${s['volume']:,.0f}", "count": s["count"], "duty": "Var"})
    return {"total_trade_volume": f"${vol:,.2f}", "duty_saved": f"${vol * 0.08:,.2f}", "docs_processed": str(len(docs)), "top_hsn_categories": top, "monthly_breakdown": m_t}

@app.get("/risk")
async def get_risk_alerts(search: Optional[str] = None, user_id: int = 1, db=Depends(get_database_session)):
    q = db.query(models.RiskAlert)
    if search: q = q.filter(models.RiskAlert.entity_name.ilike(f"%{search}%"))
    return q.all()

@app.get("/shipments")
async def get_shipments(user_id: int = 1, db=Depends(get_database_session)):
    res = []
    for s in db.query(models.Shipment).filter(models.Shipment.user_id == user_id).all():
        d = db.query(models.Document).filter(models.Document.shipment_id == s.id).first()
        sd = {c.name: getattr(s, c.name) for c in s.__table__.columns}; sd["payment_status"] = d.payment_status if d else "unpaid"
        res.append(sd)
    return res

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.now(datetime.timezone.utc)}

@app.post("/register")
async def register(u: UserCreate, db=Depends(get_database_session)):
    if db.query(models.User).filter(models.User.email == u.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(email=u.email, full_name=u.fullName, hashed_password=u.password)
    db.add(user); db.commit(); db.refresh(user)
    return {"status": "success", "user_id": user.id}

@app.post("/login")
async def login(u: UserLogin, db=Depends(get_database_session)):
    user = db.query(models.User).filter(models.User.email == u.email).first()
    if not user or user.hashed_password != u.password: # In prod, check hashed password
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"status": "success", "user_id": user.id, "full_name": user.full_name}

@app.post("/contact")
async def send_contact_email(form: ContactForm):
    try:
        body = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
            <h2 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">New Contact Request</h2>
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Subject:</strong> {form.subject}</p>
            <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p><strong>Message:</strong></p>
                <p>{form.message}</p>
            </div>
        </div>
        """
        msg = MessageSchema(subject=f"Contact: {form.subject}", recipients=["lmoksha.132@gmail.com"], body=body, subtype=MessageType.html)
        await FastMail(conf).send_message(msg)
        return {"status": "success"}
    except Exception as e:
        log.error(f"Mail failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db=Depends(get_database_session)):
    try:
        log.info(f"Password reset requested for: {req.email}")
        u = db.query(models.User).filter(models.User.email == req.email).first()
        if not u:
            log.warning(f"Reset failed: User {req.email} not found")
            return {"status": "success"}
        log.info(f"User {u.email} found, sending reset email")
        body = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello {u.full_name},</p>
            <p>We received a request to reset your password for Shnoor Trade Intelligence. Click the button below to set a new password:</p>
            <div style="margin: 30px 0;">
                <a href="http://localhost:5173/reset-password?token={u.id}" 
                   style="background-color: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                   Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        """
        msg = MessageSchema(subject="Password Reset", recipients=[req.email], body=body, subtype=MessageType.html)
        await FastMail(conf).send_message(msg)
        log.info("Reset email sent successfully")
        return {"status": "success"}
    except Exception as e:
        log.error(f"Reset failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db=Depends(get_database_session)):
    try:
        u = db.query(models.User).filter(models.User.id == int(req.token)).first()
        if not u: raise HTTPException(status_code=404, detail="Invalid or expired token")
        u.hashed_password = req.newPassword
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback(); log.error(f"Final reset failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update password")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)