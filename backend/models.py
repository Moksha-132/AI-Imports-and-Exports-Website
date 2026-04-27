from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

# --- Domain Models for Shnoor TradeIntel ---
# These models define the relational structure of our global trade data.

class User(Base):
    """
    Core user entity for authentication and RBAC (Role-Based Access Control).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="staff") # roles: admin, staff, viewer
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Shipment(Base):
    """
    Represents a physical shipment moving across international borders.
    Tracks logistics status and estimated arrival times.
    """
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, unique=True, index=True) # External tracking ID (e.g. MAEU123)
    type = Column(String) # Enum-like: Sea, Air, Land
    carrier = Column(String) # e.g. Maersk, Emirates, DHL
    origin = Column(String) # Port/City of origin
    destination = Column(String) # Destination Port/City
    status = Column(String) # In Transit, Delayed, At Port, Delivered
    progress = Column(Integer, default=0) # 0-100 percentage
    eta = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship back to documents associated with this shipment
    documents = relationship("Document", back_populates="shipment")

class Document(Base):
    """
    Trade documents (Invoices, Packing Lists, etc.) uploaded by the user.
    Stores the results of AI-powered OCR extraction.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_type = Column(String) # Invoice, Packing List, Certificate, B/L
    s3_url = Column(String, nullable=True) # Cloud storage path
    extracted_data = Column(JSON) # Raw JSON results from OCR service
    status = Column(String, default="pending") # pending, processed, error
    
    # Linking document to a specific shipment
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    shipment = relationship("Shipment", back_populates="documents")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HSNResult(Base):
    """
    Audit log of AI-based HSN code classifications.
    Helps in training/tuning the ML model by tracking confidence scores.
    """
    __tablename__ = "hsn_results"

    id = Column(Integer, primary_key=True, index=True)
    product_desc = Column(String) # Input text from the user/invoice
    hsn_code = Column(String, index=True) # Resulting HSN/Tariff code
    confidence = Column(Float) # 0.0 - 1.0 confidence score
    ai_logic = Column(String) # Model version or reasoning trace
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Duty(Base):
    """
    Local tax and customs duty calculations for specific trade corridors.
    Used for landing cost estimations.
    """
    __tablename__ = "duties"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, index=True)
    hsn_code = Column(String, index=True)
    basic_duty = Column(Float)
    additional_tax = Column(Float) # e.g. IGST, Cess, Excise
    total_tax = Column(Float)
    currency = Column(String, default="USD")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class RiskAlert(Base):
    """
    Predictive risk profiles for trading entities (Suppliers/Clients).
    Tracks payment reliability and compliance history.
    """
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String, index=True)
    risk_level = Column(String) # Low, Medium, High, Critical
    message = Column(String) # Reason for the alert
    trust_score = Column(Float) # Internal reliability metric (0-100)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
