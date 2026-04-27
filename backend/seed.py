from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import datetime

def seed_db():
    db = SessionLocal()
    
    # Create tables if not exists
    models.Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(models.Shipment).first():
        print("Database already seeded.")
        return

    # Seed Shipments
    shipments = [
        models.Shipment(shipment_id="SH-882", type="Sea", carrier="Maersk", origin="Mumbai, IN", destination="New York, US", status="In Transit", progress=65, eta=datetime.datetime(2026, 5, 12)),
        models.Shipment(shipment_id="SH-891", type="Air", carrier="Emirates Sky", origin="Dubai, AE", destination="London, UK", status="Delayed", progress=85, eta=datetime.datetime(2026, 4, 30)),
        models.Shipment(shipment_id="SH-905", type="Land", carrier="DHL Express", origin="Berlin, DE", destination="Paris, FR", status="Delivered", progress=100, eta=datetime.datetime(2026, 4, 25)),
    ]
    db.add_all(shipments)

    # Seed Risk Alerts
    alerts = [
        models.RiskAlert(entity_name="Orient Logistics Ltd", risk_level="High", message="Sanction hit detected on Cargo #902 origin port.", trust_score=42.0),
        models.RiskAlert(entity_name="Nordic Imports AB", risk_level="Medium", message="Credit limit exceeded for Nordic Imports AB.", trust_score=75.0),
        models.RiskAlert(entity_name="Global Tech Solutions", risk_level="Low", message="Compliance audit passed.", trust_score=88.0),
    ]
    db.add_all(alerts)

    # Seed HSN Results
    hsn = [
        models.HSNResult(product_desc="MacBook Pro 14-inch", hsn_code="8471.30.00", confidence=0.99, ai_logic="Transformers match"),
        models.HSNResult(product_desc="Industrial Valve", hsn_code="8481.80.30", confidence=0.95, ai_logic="Keyword match"),
    ]
    db.add_all(hsn)

    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
