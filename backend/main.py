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
from trade_constants import COUNTRY_RISK, DUTY_TABLE
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
    description="Trade Intelligence API Service",
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
        new_shipment = models.Shipment(
            shipment_id=tracking_number,
            origin=vendor,
            destination=destination,
            type=extracted_info.get("transport_mode", "Sea"),
            status="Pending",
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
        raise HTTPException(status_code=500, detail="Failed to process document approval.")

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
        if document.shipment:
            document.shipment.status = "Processed"
    elif document.shipment:
        document.shipment.status = "Pending"
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