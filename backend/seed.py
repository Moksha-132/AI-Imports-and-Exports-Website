from database import engine, SessionLocal
import models

def seed_data():
    db = SessionLocal()
    try:
        print("Database connected.")
    finally:
        db.close()
if __name__ == "__main__":
    seed_data()