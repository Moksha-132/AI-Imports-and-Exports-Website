import logging
from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import pydantic_models as schemas
import models
from database import engine, get_db

# --- Logging Configuration ---
# Setting up standard logging to track system behavior and catch issues early.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("trade-intel-api")

# Initialize database tables on startup. 
# Note: In a production environment with migrations, we'd use Alembic instead of metadata.create_all.
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

app = FastAPI(
    title="Shnoor TradeIntel API",
    description="Backend gateway for the AI-Powered Import-Export Intelligence System.",
    version="1.0.0"
)

# CORS Configuration
# Standard middleware to allow our React frontend to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, we should restrict this to specific domains.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.post("/documents", response_model=schemas.DocumentOut, tags=["Documents"], status_code=status.HTTP_201_CREATED)
async def create_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Handles the upload and initial processing of trade documents.
    Currently simulates OCR extraction for demonstration purposes.
    """
    logger.info(f"Received document upload: {file.filename}")
    
    # TODO: Integrate with actual OCR service (e.g., AWS Textract or Tesseract)
    mock_data = {
        "invoice_no": "INV-2026-001",
        "vendor": "AI Export Pvt Ltd",
        "amount": 690.00,
        "currency": "USD",
        "items": ["Electronics Component"],
        "hsn_code": "8542"
    }
    
    db_doc = models.Document(
        filename=file.filename,
        file_type="Invoice", # Defaulting for now; should be detected by AI
        extracted_data=mock_data,
        status="processed"
    )
    
    try:
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        return db_doc
    except Exception as e:
        logger.error(f"Error saving document to DB: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error during document processing.")

@app.post("/hsn", response_model=schemas.HSNOut, tags=["HSN"])
async def classify_hsn(query: schemas.HSNQuery, db: Session = Depends(get_db)):
    """
    Classifies a product description into the appropriate HSN code using AI models.
    """
    logger.info(f"HSN Classification request for: {query.description}")
    
    # Mocked classification logic - replaced with actual ML pipeline in next phase
    hsn_code = "8471.30.00"
    confidence = 0.985
    
    db_hsn = models.HSNResult(
        product_desc=query.description,
        hsn_code=hsn_code,
        confidence=confidence,
        ai_logic="Neural Match Engine (Transformers)"
    )
    
    db.add(db_hsn)
    db.commit()
    db.refresh(db_hsn)
    return db_hsn

@app.post("/duty", response_model=schemas.DutyOut, tags=["Duty"])
async def calculate_duty(req: schemas.DutyReq, db: Session = Depends(get_db)):
    """
    Calculates estimated customs duties and taxes based on HSN code and trade corridor.
    """
    logger.info(f"Calculating duty for HSN {req.hsn_code} from {req.origin} to {req.destination}")
    
    # Business Logic: Simplified tax calculation
    # In reality, this would query a complex tax matrix for different jurisdictions.
    base_duty_rate = 0.10 # 10% standard rate
    tax_rate = 0.05 # 5% VAT/GST
    
    basic_duty = req.value * base_duty_rate
    additional_tax = req.value * tax_rate
    
    db_duty = models.Duty(
        country=req.destination,
        hsn_code=req.hsn_code,
        basic_duty=basic_duty,
        additional_tax=additional_tax,
        total_tax=basic_duty + additional_tax
    )
    
    db.add(db_duty)
    db.commit()
    db.refresh(db_duty)
    return db_duty

@app.get("/risk", response_model=List[schemas.RiskOut], tags=["Risk"])
async def get_risk_alerts(entity: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Retrieves risk profiles and alerts for specific trading entities.
    """
    logger.info("Fetching risk alerts from the integrity engine.")
    query = db.query(models.RiskAlert)
    if entity:
        query = query.filter(models.RiskAlert.entity_name.ilike(f"%{entity}%"))
    
    return query.all()

@app.get("/shipments", response_model=List[schemas.ShipmentOut], tags=["Shipments"])
async def get_shipments(db: Session = Depends(get_db)):
    """
    Returns a list of all tracked shipments in the system.
    """
    return db.query(models.Shipment).all()

@app.post("/shipments", response_model=schemas.ShipmentOut, tags=["Shipments"])
async def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    """
    Creates a new shipment tracking record.
    """
    db_shipment = models.Shipment(**shipment.model_dump())
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@app.get("/")
async def root():
    return {
        "message": "Shnoor International - Trade Intelligence API Gateway",
        "status": "active",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    # Using uvicorn to serve the application. Standard practice for FastAPI.
    uvicorn.run(app, host="0.0.0.0", port=8000)
