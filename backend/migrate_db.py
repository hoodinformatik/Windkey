from app import db, app
import os
from sqlalchemy import inspect

def column_exists(table_name, column_name):
    with app.app_context():
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns

def migrate_database():
    # Create a backup of the current database
    if os.path.exists('windkey.db'):
        print("Creating database backup...")
        with open('windkey.db', 'rb') as src:
            with open('windkey.db.backup', 'wb') as dst:
                dst.write(src.read())

    try:
        # Check if category_id column already exists
        if not column_exists('password', 'category_id'):
            print("Adding category_id column to password table...")
            with app.app_context():
                with db.engine.connect() as conn:
                    conn.execute(db.text("""
                        ALTER TABLE password
                        ADD COLUMN category_id INTEGER
                        REFERENCES category(id)
                    """))
                print("Migration completed successfully!")
        else:
            print("category_id column already exists in password table. Skipping migration.")
            
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
