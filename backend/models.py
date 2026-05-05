from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="staff")
    created_at = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True)
    shipment_id = Column(String, unique=True, index=True)
    type = Column(String)
    carrier = Column(String)
    origin = Column(String)
    destination = Column(String)
    status = Column(String)
    progress = Column(Integer, default=0)
    client_name = Column(String, default="Client Name")
    eta = Column(DateTime)
    current_lat = Column(Float)
    current_lng = Column(Float)
    origin_lat = Column(Float)
    origin_lng = Column(Float)
    dest_lat = Column(Float)
    dest_lng = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    documents = relationship("Document", back_populates="shipment")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    file_type = Column(String)
    s3_url = Column(String)
    extracted_data = Column(JSON)
    humanized_summary = Column(String)
    status = Column(String, default="processed")
    client_name = Column(String, default="Client Name")
    payment_status = Column(String, default="unpaid")
    due_date = Column(DateTime)
    paid_at = Column(DateTime)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    shipment = relationship("Shipment", back_populates="documents")
    created_at = Column(DateTime, default=datetime.utcnow)

class HSNResult(Base):
    __tablename__ = "hsn_results"
    id = Column(Integer, primary_key=True)
    product_desc = Column(String)
    hsn_code = Column(String, index=True)
    confidence = Column(Float)
    ai_logic = Column(String)
    explanation = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Duty(Base):
    __tablename__ = "duties"
    id = Column(Integer, primary_key=True)
    country = Column(String, index=True)
    hsn_code = Column(String, index=True)
    basic_duty = Column(Float)
    additional_tax = Column(Float)
    total_tax = Column(Float)
    currency = Column(String, default="USD")
    user_id = Column(Integer, ForeignKey("users.id"))
    last_updated = Column(DateTime, default=datetime.utcnow)
    
class RiskAlert(Base):
    __tablename__ = "risk_alerts"
    id = Column(Integer, primary_key=True)
    entity_name = Column(String, index=True)
    risk_level = Column(String)
    message = Column(String)
    trust_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)