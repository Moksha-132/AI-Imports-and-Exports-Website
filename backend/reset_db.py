import os
import sys
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path to import models and database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
import models

def reset_database():
    print("Resetting database operational tables...")
    session = SessionLocal()
    try:
        print("Deleting Risk Alerts...")
        session.query(models.RiskAlert).delete()
        
        print("Deleting HSN Results...")
        session.query(models.HSNResult).delete()
        
        print("Deleting Duties...")
        session.query(models.Duty).delete()
        
        print("Deleting Documents...")
        session.query(models.Document).delete()
        
        print("Deleting Shipments...")
        session.query(models.Shipment).delete()
        
        session.commit()
        print("Database reset successfully! (User accounts preserved)")
    except Exception as e:
        session.rollback()
        print(f"Error resetting database: {e}")
    finally:
        session.close()
if __name__ == "__main__":
    reset_database()