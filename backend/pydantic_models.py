from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    filename: str
    file_type: str
    extracted_data: Optional[Dict[str, Any]]
    humanized_summary: Optional[str] = None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HSNOut(BaseModel):
    id: int
    product_desc: str
    hsn_code: str
    confidence: float
    ai_logic: str
    explanation: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DutyOut(BaseModel):
    id: int
    country: str
    hsn_code: str
    basic_duty: float
    additional_tax: float
    total_tax: float
    model_config = ConfigDict(from_attributes=True)

class RiskOut(BaseModel):
    id: int
    entity_name: str
    risk_level: str
    message: str
    trust_score: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ShipmentOut(BaseModel):
    id: int
    shipment_id: str
    type: Optional[str]
    origin: str
    destination: str
    status: str
    progress: int = 0
    eta: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AnalyticsOut(BaseModel):
    total_trade_volume: str
    duty_saved: str
    docs_processed: str
    top_hsn_categories: List[Dict[str, Any]]