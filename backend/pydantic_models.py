from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Document Schemas
class DocumentBase(BaseModel):
    filename: str
    file_type: str

class DocumentOut(DocumentBase):
    id: int
    extracted_data: Optional[Dict[str, Any]]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# HSN Schemas
class HSNQuery(BaseModel):
    description: str

class HSNOut(BaseModel):
    id: int
    product_desc: str
    hsn_code: str
    confidence: float
    ai_logic: str
    class Config:
        from_attributes = True

# Duty Schemas
class DutyReq(BaseModel):
    hsn_code: str
    origin: str
    destination: str
    value: float

class DutyOut(BaseModel):
    id: int
    country: str
    hsn_code: str
    total_tax: float
    currency: str
    class Config:
        from_attributes = True

# Risk Schemas
class RiskOut(BaseModel):
    id: int
    entity_name: str
    risk_level: str
    message: str
    trust_score: float
    created_at: datetime
    class Config:
        from_attributes = True

# Shipment Schemas
class ShipmentCreate(BaseModel):
    shipment_id: str
    type: str
    origin: str
    destination: str
    status: str
    progress: int = 0
    eta: Optional[datetime] = None

class ShipmentOut(ShipmentCreate):
    id: int
    class Config:
        from_attributes = True
