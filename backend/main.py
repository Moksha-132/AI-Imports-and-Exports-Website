import logging
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import get_database_session
import models
from hsn_engine import get_hsn, lookup_hsn
from trade_constants import COUNTRY_RISK, DUTY_TABLE

app = FastAPI(title="Shnoor Trade Intelligence API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger("TradeIntelligence")
def calc_ts(o_cty, d_cty, ovr_ct, pd_ct, tot_doc):
    o_rsk = COUNTRY_RISK.get(o_cty.lower().strip(), 15)
    d_rsk = COUNTRY_RISK.get(d_cty.lower().strip(), 10)    
    rt_rsk = 10 if (o_rsk >= 20 and d_rsk >= 15) else 0  
    score = 100.0
    score -= o_rsk
    score -= (d_rsk * 0.5)
    score -= rt_rsk
    score -= ovr_ct * 15
    score -= (tot_doc - pd_ct - ovr_ct) * 2
    score += min(pd_ct * 3, 20)    
    return round(max(0.0, min(100.0, score)), 1)
@app.post("/documents", status_code=201)
async def upload_document(file: UploadFile = File(...), db=Depends(get_database_session)):
    from ocr_engine import process   
    f_bytes = await file.read()
    ext_d = process(f_bytes, file.filename)   
    ext_d["invoice_no"] = ext_d.get("invoice_no") or "Not Detected"
    ext_d["vendor"] = ext_d.get("vendor") or "Not Detected"
    ext_d["amount"] = ext_d.get("amount") or 0.0
    
    doc = models.Document(
        filename=file.filename,
        file_type=file.content_type or "unknown",
        extracted_data=ext_d,
        humanized_summary=ext_d.get("humanized_summary"),
        client_name=ext_d.get("client_name", "Primary Client"),
        status="processed"
    )   
    try:
        db.add(doc)
        db.commit()
        db.refresh(doc)       
        return {
            "id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "invoice_no": ext_d.get("invoice_no"),
            "vendor": ext_d.get("vendor"),
            "amount": ext_d.get("amount"),
            "extracted_data": ext_d,
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        }
    except Exception as db_err:
        db.rollback()
        log.error(f"Document upload failed: {db_err}")
        raise HTTPException(status_code=500, detail="Failed to save document.")
@app.get("/documents")
async def list_documents(db=Depends(get_database_session)):
    return db.query(models.Document).order_by(models.Document.created_at.desc()).all()
@app.post("/documents/{doc_id}/approve")
async def approve_document(doc_id: int, db=Depends(get_database_session)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc: raise HTTPException(status_code=404)        
    ext, try_sc = doc.extracted_data or {}, 0
    try:
        v_nm = ext.get("vendor", "Unknown")
        vd = [d for d in db.query(models.Document).all() if d.extracted_data and d.extracted_data.get("vendor") == v_nm]
        ov, pd, tot = len([d for d in vd if d.payment_status == "overdue"]), len([d for d in vd if d.payment_status == "paid"]), len(vd)
        o, d = ext.get("origin", "India"), ext.get("destination", "Germany")
        sc = calc_ts(o, d, ov, pd, tot)
        lvl = "Low" if sc > 80 else ("Medium" if sc > 50 else "High")
        msg = f"Cleared. Route: {o} → {d}." if sc > 70 else f"Route {o} → {d} carries risk. Score: {sc}"
        
        alt = db.query(models.RiskAlert).filter(models.RiskAlert.entity_name == v_nm).first()
        if alt: alt.trust_score, alt.risk_level, alt.message = sc, lvl, msg
        else: db.add(models.RiskAlert(entity_name=v_nm, risk_level=lvl, trust_score=sc, message=msg))
        
        sid = f"SHP-{ext.get('invoice_no', 'UNK')}-{doc.id}"
        shp = models.Shipment(shipment_id=sid, origin=v_nm, destination=d, type=ext.get("transport_mode", "Sea"), status="Pending", eta=datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=7))
        db.add(shp); db.commit(); doc.shipment_id = shp.id; db.commit()
        return {"status": "success", "tracking_id": sid}
    except Exception as e:
        db.rollback(); log.error(f"Approve Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.patch("/documents/{doc_id}/payment")
async def update_payment(doc_id: int, payload: dict, db=Depends(get_database_session)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")       
    n_stat = payload.get("status", "unpaid")
    doc.payment_status = n_stat  
    if n_stat == "paid":
        doc.paid_at = datetime.datetime.now(datetime.timezone.utc)
        if doc.shipment:
            doc.shipment.status = "Processed"
    else:
        if doc.shipment:
            doc.shipment.status = "Pending"         
    db.commit()
    return {"status": "ok", "payment_status": doc.payment_status}
@app.post("/hsn")
async def classify_hsn(data: dict, db=Depends(get_database_session)):
    q = data.get("description", "")
    res = get_hsn(q)   
    db.add(models.HSNResult(
        product_desc=res["product_desc"],
        hsn_code=res["hsn_code"],
        confidence=res["confidence"],
        ai_logic=res["ai_logic"],
        explanation=res.get("explanation", "")
    ))
    db.commit()   
    return res
@app.post("/duty")
async def calculate_duty(data: dict, db=Depends(get_database_session)):
    dest = data.get("destination", "singapore").lower().strip()
    inv_val = float(data.get("value", 0))
    h_code = data.get("hsn_code", "")
    rts = DUTY_TABLE.get(dest, [0.12, 0.15])
    d_rt = rts[0]
    v_rt = rts[1] 
    if h_code.startswith(("61", "62")):
        d_rt += 0.05
    elif h_code.startswith("85"):
        d_rt = max(0, d_rt - 0.02)    
    b_duty = inv_val * d_rt
    a_tax = (inv_val + b_duty) * v_rt
    res = {
        "country": dest.title(),
        "hsn_code": h_code,
        "currency": "USD",
        "basic_duty": b_duty,
        "additional_tax": a_tax,
        "total_tax": b_duty + a_tax
    }
    try:
        db.add(models.Duty(**res))
        db.commit()
    except Exception:
        db.rollback()    
    return res
@app.get("/analytics")
async def get_analytics(db=Depends(get_database_session)):
    all_docs = db.query(models.Document).all()   
    t_vol = 0.0
    h_map = {}
    m_tots = [0.0] * 12 
    for doc in all_docs:
        if not doc.extracted_data:
            continue        
        raw_amt = doc.extracted_data.get("amount")
        amt = float(raw_amt) if raw_amt is not None else 0.0     
        t_vol += amt
        m_tots[doc.created_at.month - 1] += amt  
        codes = doc.extracted_data.get("hsn_codes", []) or []
        for c in codes:
            if c not in h_map:
                h_map[c] = {"count": 0, "volume": 0.0}
            h_map[c]["count"] += 1
            h_map[c]["volume"] += amt        
    top_cats = []
    top_c = sorted(h_map.items(), key=lambda x: x[1]["volume"], reverse=True)[:5]
    for c, stats in top_c:
        dtls = lookup_hsn(c)
        cat_nm = dtls.get("description", "Item") if dtls else "Item"
        top_cats.append({
            "code": c,
            "category": cat_nm,
            "vol": f"${stats['volume']:,.0f}",
            "count": stats["count"],
            "duty": "Var"
        })    
    return {
        "total_trade_volume": f"${t_vol:,.2f}",
        "duty_saved": f"${t_vol * 0.08:,.2f}",
        "docs_processed": str(len(all_docs)),
        "top_hsn_categories": top_cats,
        "monthly_breakdown": m_tots
    }
@app.get("/risk")
async def get_risk_alerts(search: Optional[str] = None, db=Depends(get_database_session)):
    q = db.query(models.RiskAlert)
    if search:
        q = q.filter(models.RiskAlert.entity_name.ilike(f"%{search}%"))
    return q.all()
@app.get("/shipments")
async def get_shipments(db=Depends(get_database_session)):
    res = []
    shps = db.query(models.Shipment).all()
    for s in shps:
        d = db.query(models.Document).filter(models.Document.shipment_id == s.id).first()
        s_data = {c.name: getattr(s, c.name) for c in s.__table__.columns}
        s_data["payment_status"] = d.payment_status if d else "unpaid"
        res.append(s_data)
    return res
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.now(datetime.timezone.utc)}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)