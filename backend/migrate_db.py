from app import db
import os

def migrate_database():
    # Create a backup of the current database
    if os.path.exists('windkey.db'):
        print("Creating database backup...")
        with open('windkey.db', 'rb') as src:
            with open('windkey.db.backup', 'wb') as dst:
                dst.write(src.read())

    try:
        # Add category_id column to password table
        print("Adding category_id column to password table...")
        with db.engine.connect() as conn:
            conn.execute(db.text("""
                ALTER TABLE password
                ADD COLUMN category_id INTEGER
                REFERENCES category(id)
            """))
            
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        # Restore backup if something went wrong
        if os.path.exists('windkey.db.backup'):
            print("Restoring database from backup...")
            with open('windkey.db.backup', 'rb') as src:
                with open('windkey.db', 'wb') as dst:
                    dst.write(src.read())
            print("Database restored from backup.")
        raise

if __name__ == '__main__':
    migrate_database()
