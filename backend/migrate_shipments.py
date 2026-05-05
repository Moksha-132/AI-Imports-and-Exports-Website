from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Migrating 'shipments' table...")
        columns_to_add = [
            ("current_lat", "FLOAT"),
            ("current_lng", "FLOAT"),
            ("origin_lat", "FLOAT"),
            ("origin_lng", "FLOAT"),
            ("dest_lat", "FLOAT"),
            ("dest_lng", "FLOAT")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE shipments ADD COLUMN {col_name} {col_type}"))
                conn.commit()
                print(f"Added column: {col_name}")
            except Exception as e:
                print(f"Column {col_name} might already exist or error: {e}")
        
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
