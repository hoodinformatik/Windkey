from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///windkey.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS konfigurieren
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "chrome-extension://*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True
    }
})

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    two_factor_secret = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    history = db.relationship('History', backref='user', lazy=True)
    categories = db.relationship('Category', backref='user', lazy=True)
    
    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
        
    def generate_2fa_secret(self):
        import pyotp
        self.two_factor_secret = pyotp.random_base32()
    
    def get_id(self):
        return str(self.id)
    
    @property
    def is_active(self):
        return True
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50))  # Material-UI icon name
    color = db.Column(db.String(50))  # Color for the category
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    passwords = db.relationship('Password', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'password_count': len(self.passwords)
        }

class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    title = db.Column(db.String(100), nullable=False)
    encrypted_password = db.Column(db.LargeBinary, nullable=False)
    url = db.Column(db.String(500))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'notes': self.notes,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    details = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat()
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    # Create tables
    db.create_all()
    
    # Check if category_id column exists in password table
    inspector = db.inspect(db.engine)
    columns = [c['name'] for c in inspector.get_columns('password')]
    
    if 'category_id' not in columns:
        print("Adding category_id column to password table...")
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("""
                    ALTER TABLE password
                    ADD COLUMN category_id INTEGER
                    REFERENCES category(id)
                """))
                conn.commit()
            print("Migration completed successfully!")
        except Exception as e:
            print(f"Error during migration: {str(e)}")

from routes import *

if __name__ == '__main__':
    app.run(debug=True)
