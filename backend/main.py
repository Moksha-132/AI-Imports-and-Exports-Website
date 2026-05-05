import logging
import datetime
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType
from database import get_database_session
import models
from hsn_engine import get_hsn, lookup_hsn
from trade_constants import COUNTRY_RISK, DUTY_TABLE, CITY_COORDINATES, COMPANY_HUBS, GLOBAL_LOGISTICS_ROUTES
from pydantic_models import (
    ContactForm, 
    ForgotPasswordRequest, 
    UserLogin, 
    UserCreate, 
    ResetPasswordRequest, 
    HSNRequest, 
    DutyRequest
)
from templates import get_contact_email_template, get_password_reset_template
load_dotenv()
app = FastAPI(
    title="Shnoor Imports and Exports",
    description="Trade Service",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("TradeIntelligence")
mail_config = ConnectionConfig(
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

def calculate_trust_score(origin: str, destination: str, overdue_count: int, paid_count: int, total_count: int) -> float:
    origin_risk = COUNTRY_RISK.get(origin.lower().strip(), 15)
    dest_risk = COUNTRY_RISK.get(destination.lower().strip(), 10)   
    route_penalty = 10 if (origin_risk >= 20 and dest_risk >= 15) else 0  
    score = 100.0 - origin_risk - (dest_risk * 0.5) - route_penalty
    score -= (overdue_count * 15)   
    pending_count = total_count - paid_count - overdue_count
    score -= (pending_count * 2)
    score += min(paid_count * 3, 20)  
    return round(max(0.0, min(100.0, score)), 1)

def interpolate_route_position(route: List[Dict[str, Any]], progress_pct: float) -> Dict[str, Any]:
    if not route:
        return {"lat": 0.0, "lng": 0.0, "location": "Unknown"}
    if progress_pct <= 0:
        return {"lat": route[0]["lat"], "lng": route[0]["lng"], "location": route[0]["name"]}
    if progress_pct >= 100:
        return {"lat": route[-1]["lat"], "lng": route[-1]["lng"], "location": route[-1]["name"]}
    n_segments = len(route) - 1
    segment_progress = (progress_pct / 100.0) * n_segments
    segment_idx = int(segment_progress)
    local_pct = segment_progress - segment_idx
    p1 = route[segment_idx]
    p2 = route[min(segment_idx + 1, len(route)-1)]
    lat = p1["lat"] + (p2["lat"] - p1["lat"]) * local_pct
    lng = p1["lng"] + (p2["lng"] - p1["lng"]) * local_pct
    if local_pct < 0.15:
        location = f"Departing {p1['name']}"
    elif local_pct > 0.85:
        location = f"Approaching {p2['name']}"
    else:
        location = f"En route to {p2['name']}"    
    return {"lat": lat, "lng": lng, "location": location}

def get_best_route(origin: str, destination: str, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float, mode: str = "Sea") -> List[Dict[str, Any]]:
    o_norm = origin.lower().strip()
    d_norm = destination.lower().strip()
    m_norm = mode.lower().strip()
    o_hub = ""
    for company, hub in COMPANY_HUBS.items():
        if company in o_norm:
            o_hub = hub
            break
    for key, route in GLOBAL_LOGISTICS_ROUTES.items():
        key_parts = key.split('_')
        o_aliases = [o_norm, o_hub] if o_hub else [o_norm]
        if "mumbai" in o_aliases or "shnoor" in o_norm: o_aliases.append("india")
        d_aliases = [d_norm]
        if "germany" in d_norm or "hamburg" in d_norm: d_aliases.extend(["germany", "hamburg"])
        
        match_o = any(a in key_parts[0] or key_parts[0] in a for a in o_aliases if a)
        match_d = any(a in key_parts[1] or key_parts[1] in a for a in d_aliases if a)
        match_m = True
        if len(key_parts) > 2:
            match_m = m_norm in key_parts[2]     
        if match_o and match_d and match_m:
            return route        
    if m_norm == "air":
        waypoint_name = "High Altitude Corridor"
    elif m_norm == "land":
        waypoint_name = "Interstate Network Junction"
    else:
        waypoint_name = "Deep Water Corridor"      
    import random
    offset_lat = random.uniform(-2.0, 2.0)
    offset_lng = random.uniform(-5.0, 5.0)
    
    return [
        {"name": origin, "lat": origin_lat, "lng": origin_lng},
        {"name": waypoint_name, "lat": (origin_lat + dest_lat) / 2 + offset_lat, "lng": (origin_lng + dest_lng) / 2 + offset_lng},
        {"name": destination, "lat": dest_lat, "lng": dest_lng}
    ]

@app.post("/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), user_id: int = 1, db: Session = Depends(get_database_session)):
    from ocr_engine import process_document    
    file_bytes = await file.read()
    extracted_data = process_document(file_bytes, file.filename)   
    new_doc = models.Document(
        filename=file.filename,
        file_type=file.content_type or "unknown",
        extracted_data=extracted_data,
        humanized_summary=extracted_data.get("humanized_summary"),
        client_name=extracted_data.get("client_name", "Primary Client"),
        status="processed",
        user_id=user_id
    )  
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)  
    return {
        "id": new_doc.id,
        "filename": new_doc.filename,
        "status": new_doc.status,
        "extracted_data": extracted_data
    }

@app.get("/documents")
async def list_documents(user_id: int = 1, db: Session = Depends(get_database_session)):
    return db.query(models.Document).filter(models.Document.user_id == user_id).order_by(models.Document.created_at.desc()).all()

@app.post("/documents/{doc_id}/approve")
async def approve_document(doc_id: int, user_id: int = 1, db: Session = Depends(get_database_session)):
    target_doc = db.query(models.Document).filter(
        models.Document.id == doc_id, 
        models.Document.user_id == user_id
    ).first()  
    if not target_doc:
        raise HTTPException(status_code=404, detail="Document not found")       
    extracted_info = target_doc.extracted_data or {}  
    try:
        vendor = extracted_info.get("vendor", "Unknown")
        origin = extracted_info.get("origin", "India")
        destination = extracted_info.get("destination", "Germany")       
        all_user_docs = db.query(models.Document).filter(models.Document.user_id == user_id).all()
        vendor_history = [d for d in all_user_docs if d.extracted_data and d.extracted_data.get("vendor") == vendor]      
        overdue_invoices = [d for d in vendor_history if d.payment_status == "overdue"]
        paid_invoices = [d for d in vendor_history if d.payment_status == "paid"]      
        trust_score = calculate_trust_score(
            origin=origin,
            destination=destination,
            overdue_count=len(overdue_invoices),
            paid_count=len(paid_invoices),
            total_count=len(vendor_history)
        )      
        risk_level = "Low" if trust_score > 80 else ("Medium" if trust_score > 50 else "High")
        risk_msg = f"Route cleared: {origin} to {destination}." if trust_score > 70 else f"High risk route detected: {origin} to {destination}. Trust score: {trust_score}"       
        existing_alert = db.query(models.RiskAlert).filter(models.RiskAlert.entity_name == vendor).first()
        if existing_alert:
            existing_alert.trust_score = trust_score
            existing_alert.risk_level = risk_level
            existing_alert.message = risk_msg
        else:
            new_alert = models.RiskAlert(
                entity_name=vendor,
                risk_level=risk_level,
                trust_score=trust_score,
                message=risk_msg
            )
            db.add(new_alert)           
        tracking_number = f"SHP-{extracted_info.get('invoice_no', 'UNK')}-{target_doc.id}"
        def resolve_coords(location_str: str, default: list) -> list:
            if not location_str:
                return default         
            clean_loc = location_str.lower().strip()           
            if clean_loc in CITY_COORDINATES:
                return CITY_COORDINATES[clean_loc]           
            for company, hub in COMPANY_HUBS.items():
                if company in clean_loc:
                    return CITY_COORDINATES.get(hub, default)         
            parts = [p.strip() for p in clean_loc.split(',')]
            for part in parts:
                if part in CITY_COORDINATES:
                    return CITY_COORDINATES[part]         
            return default
        o_coords = resolve_coords(vendor, [20.5937, 78.9629])
        d_coords = resolve_coords(destination, [52.5200, 13.4050])      
        new_shipment = models.Shipment(
            shipment_id=tracking_number,
            origin=vendor,
            destination=destination,
            type=extracted_info.get("transport_mode", "Sea"),
            status="In Transit",
            progress=15,
            origin_lat=o_coords[0],
            origin_lng=o_coords[1],
            dest_lat=d_coords[0],
            dest_lng=d_coords[1],
            current_lat=o_coords[0] + (d_coords[0] - o_coords[0]) * 0.15,
            current_lng=o_coords[1] + (d_coords[1] - o_coords[1]) * 0.15,
            eta=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
            user_id=user_id
        )       
        db.add(new_shipment)
        db.commit()      
        target_doc.shipment_id = new_shipment.id
        db.commit()     
        return {"status": "success", "tracking_id": tracking_number}      
    except Exception as error:
        db.rollback()
        logger.error(f"Approval workflow failed for doc {doc_id}: {error}")
        raise HTTPException(status_code=500, detail="Failed to process document.")

@app.patch("/documents/{doc_id}/payment")
async def update_payment_status(doc_id: int, payload: dict, user_id: int = 1, db: Session = Depends(get_database_session)):
    document = db.query(models.Document).filter(
        models.Document.id == doc_id, 
        models.Document.user_id == user_id
    ).first()  
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")     
    payment_status = payload.get("status", "unpaid")
    document.payment_status = payment_status
    if payment_status == "paid":
        document.paid_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    return {"status": "ok", "payment_status": document.payment_status}

@app.post("/hsn")
async def classify_hsn(data: HSNRequest, user_id: int = 1, db: Session = Depends(get_database_session)):
    classification = get_hsn(data.description)   
    history_record = models.HSNResult(
        product_desc=classification["product_desc"],
        hsn_code=classification["hsn_code"],
        confidence=classification["confidence"],
        ai_logic=classification["ai_logic"],
        explanation=classification.get("explanation", ""),
        user_id=user_id
    )   
    db.add(history_record)
    db.commit()   
    return classification

@app.post("/duty")
async def calculate_duty(data: DutyRequest, user_id: int = 1, db: Session = Depends(get_database_session)):
    destination = data.destination.lower().strip()
    total_value = float(data.value)
    hsn_code = data.hsn_code   
    rates = DUTY_TABLE.get(destination, [0.12, 0.15]) 
    basic_rate = rates[0]
    if hsn_code.startswith(("61", "62")):
        basic_rate += 0.05      
    tax_rate = rates[1]   
    calculated_duty = total_value * basic_rate
    additional_tax = (total_value + calculated_duty) * tax_rate
    total_tax_amount = calculated_duty + additional_tax   
    result = {
        "country": destination.title(),
        "hsn_code": hsn_code,
        "currency": "USD",
        "basic_duty": calculated_duty,
        "additional_tax": additional_tax,
        "total_tax": total_tax_amount,
        "user_id": user_id
    }  
    try:
        db.add(models.Duty(**result))
        db.commit()
    except Exception as error:
        logger.warning(f"Failed to log duty calculation: {error}")
        db.rollback()       
    return result

@app.get("/analytics")
async def get_analytics(user_id: int = 1, db: Session = Depends(get_database_session)):
    user_documents = db.query(models.Document).filter(models.Document.user_id == user_id).all()   
    total_trade_volume = 0.0
    hsn_category_metrics = {}
    monthly_trend = [0.0] * 12   
    for doc in user_documents:
        if not doc.extracted_data:
            continue           
        invoice_amount = float(doc.extracted_data.get("amount") or 0.0)
        total_trade_volume += invoice_amount     
        if doc.created_at:
            monthly_trend[doc.created_at.month - 1] += invoice_amount          
        for code in (doc.extracted_data.get("hsn_codes") or []):
            if code not in hsn_category_metrics:
                hsn_category_metrics[code] = {"count": 0, "volume": 0.0}
            hsn_category_metrics[code]["count"] += 1
            hsn_category_metrics[code]["volume"] += invoice_amount           
    top_categories = []
    sorted_metrics = sorted(hsn_category_metrics.items(), key=lambda x: x[1]["volume"], reverse=True)[:5]  
    for hsn_code, stats in sorted_metrics:
        hsn_details = lookup_hsn(hsn_code)
        top_categories.append({
            "code": hsn_code,
            "category": hsn_details.get("description", "Product") if hsn_details else "Product",
            "vol": f"${stats['volume']:,.0f}",
            "count": stats["count"],
            "duty": "Variable"
        })      
    return {
        "total_trade_volume": f"${total_trade_volume:,.2f}",
        "duty_saved": f"${total_trade_volume * 0.08:,.2f}",
        "docs_processed": str(len(user_documents)),
        "top_hsn_categories": top_categories,
        "monthly_breakdown": monthly_trend
    }

@app.get("/risk")
async def get_risk_alerts(search: Optional[str] = None, user_id: int = 1, db: Session = Depends(get_database_session)):
    query = db.query(models.RiskAlert)
    if search:
        query = query.filter(models.RiskAlert.entity_name.ilike(f"%{search}%"))
    return query.all()

@app.get("/shipments")
async def get_shipments(user_id: int = 1, db: Session = Depends(get_database_session)):
    user_shipments = db.query(models.Shipment).filter(models.Shipment.user_id == user_id).all()
    results = []   
    for shipment in user_shipments:
        associated_doc = db.query(models.Document).filter(models.Document.shipment_id == shipment.id).first()       
        shipment_data = {col.name: getattr(shipment, col.name) for col in shipment.__table__.columns}
        shipment_data["payment_status"] = associated_doc.payment_status if associated_doc else "unpaid"
        results.append(shipment_data)       
    return results

@app.get("/shipments/live")
async def get_live_tracking(user_id: int = 1, db: Session = Depends(get_database_session)):
    shipments = db.query(models.Shipment).filter(
        models.Shipment.user_id == user_id
    ).all()   
    live_data = []
    now = datetime.datetime.utcnow()   
    for s in shipments:
        route = get_best_route(s.origin, s.destination, s.origin_lat, s.origin_lng, s.dest_lat, s.dest_lng, s.type)       
        current_lat = s.origin_lat or 0.0
        current_lng = s.origin_lng or 0.0
        progress = s.progress or 0
        current_location = "Initializing Route"        
        status_lower = (s.status or "").lower().strip()       
        if status_lower == "in transit":
            if s.eta and s.created_at:
                total_duration = (s.eta - s.created_at).total_seconds()
                elapsed = (now - s.created_at).total_seconds()             
                if total_duration > 0:
                    calc_progress = min(0.99, max(0.15, elapsed / total_duration))
                else:
                    calc_progress = 0.99
            else:
                total_duration = 7 * 24 * 3600
                elapsed = (now - s.created_at).total_seconds()
                calc_progress = min(0.99, (elapsed / total_duration) + 0.15)           
            progress = int(calc_progress * 100)
            pos_data = interpolate_route_position(route, progress)
            current_lat = pos_data["lat"]
            current_lng = pos_data["lng"]
            current_location = pos_data["location"]            
            s.progress = progress
            s.current_lat = current_lat
            s.current_lng = current_lng
        elif status_lower in ["processed", "delivered"]:
            current_lat = s.dest_lat or 0.0
            current_lng = s.dest_lng or 0.0
            progress = 100
            current_location = f"Arrived at {s.destination}"
            s.progress = 100
            s.current_lat = current_lat
            s.current_lng = current_lng       
        live_data.append({
            "id": s.id,
            "shipment_id": s.shipment_id,
            "current_lat": current_lat,
            "current_lng": current_lng,
            "current_location": current_location,
            "origin_lat": s.origin_lat,
            "origin_lng": s.origin_lng,
            "dest_lat": s.dest_lat,
            "dest_lng": s.dest_lng,
            "progress": progress,
            "status": s.status,
            "type": s.type,
            "route_path": route
        })   
    db.commit()
    return live_data

@app.patch("/shipments/{shipment_id}")
async def update_shipment(shipment_id: int, payload: dict, user_id: int = 1, db: Session = Depends(get_database_session)):
    shipment = db.query(models.Shipment).filter(
        models.Shipment.id == shipment_id,
        models.Shipment.user_id == user_id
    ).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    for key, value in payload.items():
        if hasattr(shipment, key):
            setattr(shipment, key, value)   
    db.commit()
    db.refresh(shipment)
    return shipment

@app.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: int, user_id: int = 1, db: Session = Depends(get_database_session)):
    shipment = db.query(models.Shipment).filter(
        models.Shipment.id == shipment_id,
        models.Shipment.user_id == user_id
    ).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")     
    db.query(models.Document).filter(models.Document.shipment_id == shipment.id).delete() 
    db.delete(shipment)
    db.commit()
    return {"status": "success", "message": "Shipment and associated data removed"}

@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "version": "1.0.0"
    }
@app.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_database_session)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")       
    new_user = models.User(
        email=user_data.email,
        full_name=user_data.fullName,
        hashed_password=user_data.password
    )   
    db.add(new_user)
    db.commit()
    db.refresh(new_user)   
    return {"status": "success", "user_id": new_user.id}

@app.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_database_session)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()  
    if not user or user.hashed_password != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")      
    return {
        "status": "success", 
        "user_id": user.id, 
        "full_name": user.full_name
    }

@app.post("/contact")
async def send_contact_email(form: ContactForm):
    try:
        email_body = get_contact_email_template(form.name, form.email, form.subject, form.message)
        email_message = MessageSchema(
            subject=f"New Trade Inquiry: {form.subject}",
            recipients=["lmoksha.132@gmail.com"],
            body=email_body,
            subtype=MessageType.html
        )       
        fm = FastMail(mail_config)
        await fm.send_message(email_message)      
        return {"status": "success"}
    except Exception as error:
        logger.error(f"Contact form email delivery failed: {error}")
        raise HTTPException(status_code=500, detail="Failed to deliver message.")

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_database_session)):
    try:
        user = db.query(models.User).filter(models.User.email == request.email).first()
        if not user:
            return {"status": "success"}           
        reset_link = f"http://localhost:5173/reset-password?token={user.id}"
        email_body = get_password_reset_template(user.full_name, reset_link)     
        reset_message = MessageSchema(
            subject="Action Required: Password Reset Request",
            recipients=[request.email],
            body=email_body,
            subtype=MessageType.html
        )        
        fm = FastMail(mail_config)
        await fm.send_message(reset_message)        
        return {"status": "success"}
    except Exception as error:
        logger.error(f"Password reset process failed: {error}")
        raise HTTPException(status_code=500, detail="Failed to initiate password reset.")

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_database_session)):
    try:
        user = db.query(models.User).filter(models.User.id == int(request.token)).first()      
        if not user:
            raise HTTPException(status_code=404, detail="Invalid or expired reset token")              
        user.hashed_password = request.newPassword
        db.commit()       
        return {"status": "success"}
    except Exception as error:
        db.rollback()
        logger.error(f"Failed to finalize password reset for user ID {request.token}: {error}")
        raise HTTPException(status_code=500, detail="Password update failed.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)