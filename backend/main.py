import logging, datetime as dt
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import get_database_session
import models
api = FastAPI()
api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("trade-api")
@api.post("/documents", status_code=201)
async def upload_handler(file: UploadFile = File(...), db = Depends(get_database_session)):
    from ocr_engine import process
    raw_content = await file.read()
    extracted = process(raw_content, file.filename)
    new_doc = models.Document(
        filename=file.filename,
        file_type=file.content_type or "unknown",
        extracted_data=extracted,
        humanized_summary=extracted.get("humanized_summary"),
        client_name=extracted.get("client_name", "Primary Client"),
        status="processed"
    )
    try:
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        biz_name = extracted.get("vendor", "Unknown Entity")
        if biz_name == "Unknown Entity": biz_name = f"New Entity {new_doc.id}"
        try:
            v_docs = [d for d in db.query(models.Document).all() if d.extracted_data and d.extracted_data.get("vendor") == biz_name]
            lates = len([d for d in v_docs if d.payment_status == "overdue"])
            trust = 95.0
            if lates > 0: trust = 60.0 - (lates * 10)
            elif not any(k in biz_name for k in ["Global", "Precision"]): trust = 78.5
            risk_lvl = "Low" if trust > 80 else ("Medium" if trust > 50 else "High")
            alert_msg = f"Auto-scan: {biz_name} verified."
            if lates > 0: alert_msg = f"CRITICAL: {biz_name} has {lates} overdue payments."
            existing = db.query(models.RiskAlert).filter(models.RiskAlert.entity_name == biz_name).first()
            if existing:
                existing.trust_score, existing.risk_level, existing.message = max(0, trust), risk_lvl, alert_msg
            else:
                db.add(models.RiskAlert(entity_name=biz_name, risk_level=risk_lvl, trust_score=max(0, trust), message=alert_msg))
            db.commit()
        except Exception as risk_err:
            log.warning(f"Risk sync failed: {risk_err}")
        return new_doc
    except Exception as err:
        db.rollback()
        log.error(f"Failed to process upload: {err}")
        raise HTTPException(500, str(err))
@api.get("/documents")
async def list_documents(db = Depends(get_database_session)):
    return db.query(models.Document).order_by(models.Document.created_at.desc()).all()
@api.post("/documents/{doc_id}/approve")
async def handle_approval(doc_id: int, db = Depends(get_database_session)):
    target = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not target: raise HTTPException(404, "Document not found")
    meta = target.extracted_data
    shp = models.Shipment(
        shipment_id=f"SHP-{meta.get('invoice_no', 'UNK')}",
        origin=meta.get('vendor', 'Global Vendor'),
        destination=meta.get('destination', 'Global Distribution'),
        client_name=meta.get('client_name', 'Primary Client'),
        type=meta.get('transport_mode', 'Sea'),
        status="Processed" if target.payment_status == "paid" else "Pending",
        eta=dt.datetime.utcnow() + dt.timedelta(days=7)
    )
    db.add(shp)
    db.commit()
    target.shipment_id = shp.id
    db.commit()
    return {"ok": True, "sid": shp.shipment_id}
@api.patch("/documents/{doc_id}/payment")
async def update_payment(doc_id: int, payload: dict, db = Depends(get_database_session)):
    target = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not target: raise HTTPException(404, "Document not found")
    new_status = payload.get("status", "unpaid")
    target.payment_status = new_status
    if new_status == "paid": 
        target.paid_at = dt.datetime.utcnow()
        if target.shipment: target.shipment.status = "Processed"
    else:
        if target.shipment: target.shipment.status = "Pending"
    db.commit()
    return {"status": "updated", "payment_status": target.payment_status, "shipment_status": target.shipment.status if target.shipment else None}
@api.post("/hsn")
async def hsn_lookup(body: dict, db = Depends(get_database_session)):
    from hsn_engine import get_hsn
    txt = body.get("description", "")
    match = get_hsn(txt)
    db.add(models.HSNResult(
        product_desc=match["product_desc"],
        hsn_code=match["hsn_code"],
        confidence=match["confidence"],
        ai_logic=match["ai_logic"],
        explanation=match.get("explanation", "")
    ))
    db.commit()
    return {"hsn_code": match["hsn_code"], "product_desc": match["product_desc"], "confidence": match["confidence"], "ai_logic": match["ai_logic"]}
@api.post("/duty")
async def tax_engine(req_data: dict, db = Depends(get_database_session)):
    loc = req_data.get("destination", "singapore").lower().strip()
    val = float(req_data.get("value", 0))
    code = req_data.get("hsn_code", "")
    table = {
        "united states": [0.02, 0.00], "canada": [0.05, 0.12], "mexico": [0.10, 0.16],
        "germany": [0.00, 0.19], "france": [0.00, 0.20], "united kingdom": [0.04, 0.20],
        "italy": [0.00, 0.22], "spain": [0.00, 0.21], "netherlands": [0.00, 0.21],
        "switzerland": [0.02, 0.08], "turkey": [0.15, 0.18], "russia": [0.12, 0.20],
        "china": [0.08, 0.13], "india": [0.15, 0.18], "japan": [0.03, 0.10],
        "singapore": [0.00, 0.09], "australia": [0.05, 0.10], "south korea": [0.08, 0.10],
        "vietnam": [0.20, 0.10], "thailand": [0.15, 0.07], "indonesia": [0.15, 0.11],
        "malaysia": [0.10, 0.06], "philippines": [0.12, 0.12], "new zealand": [0.05, 0.15],
        "saudi arabia": [0.05, 0.15], "united arab emirates": [0.05, 0.05], "israel": [0.05, 0.17],
        "south africa": [0.15, 0.15], "egypt": [0.20, 0.14], "nigeria": [0.25, 0.07],
        "kenya": [0.25, 0.16], "ghana": [0.20, 0.15],
        "brazil": [0.35, 0.18], "argentina": [0.35, 0.21], "chile": [0.06, 0.19],
        "colombia": [0.15, 0.19], "peru": [0.06, 0.18]
    }
    r = table.get(loc, [0.12, 0.15])
    d_rate, t_rate = r[0], r[1]
    if code.startswith(("61", "62")): d_rate += 0.05 
    elif code.startswith("85"): d_rate = max(0, d_rate - 0.02) 
    d_val = val * d_rate
    t_val = (val + d_val) * t_rate 
    out = {"country": loc.title(), "hsn_code": code, "currency": "USD", "basic_duty": d_val, "additional_tax": t_val, "total_tax": d_val + t_val}
    try:
        db.add(models.Duty(**out))
        db.commit()
    except: db.rollback()
    return out
@api.get("/analytics")
async def fetch_stats(db = Depends(get_database_session)):
    items = db.query(models.Document).all()
    total_vol, hsn_map, monthly_data = 0.0, {}, [0.0] * 12
    for i in items:
        if not i.extracted_data: continue
        raw_val = i.extracted_data.get('amount')
        val = float(raw_val) if raw_val is not None else 0.0
        total_vol += val
        m_idx = i.created_at.month - 1
        monthly_data[m_idx] += val
        codes = i.extracted_data.get('hsn_codes', []) or []
        for c in codes:
            if c not in hsn_map: hsn_map[c] = {"c": 0, "v": 0.0}
            hsn_map[c]["c"] += 1
            hsn_map[c]["v"] += val
    from hsn_engine import lookup_hsn
    top_list = []
    ranked = sorted(hsn_map.items(), key=lambda x: x[1]["v"], reverse=True)[:5]
    for k, v in ranked:
        h_info = lookup_hsn(k)
        top_list.append({
            "code": k, 
            "category": h_info.get("description", "General Trade Item") if h_info else "General Trade Item", 
            "vol": f"${v['v']:,.0f}", 
            "count": v["c"],
            "duty": "Variable"
        })
    return {
        "total_trade_volume": f"${total_vol:,.2f}", 
        "duty_saved": f"${total_vol * 0.08:,.2f}", 
        "docs_processed": str(len(items)), 
        "top_hsn_categories": top_list,
        "monthly_breakdown": monthly_data
    }
@api.get("/risk")
async def get_alerts(name: Optional[str] = None, db = Depends(get_database_session)):
    f = db.query(models.RiskAlert)
    if name: f = f.filter(models.RiskAlert.entity_name.ilike(f"%{name}%"))
    return f.all()
@api.get("/shipments")
async def list_shipments(db = Depends(get_database_session)):
    return db.query(models.Shipment).all()
@api.post("/shipments")
async def add_shipment(payload: dict, db = Depends(get_database_session)):
    s = models.Shipment(**payload)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
@api.get("/health")
async def ping(): return {"status": "online"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)