from flask import jsonify, request, send_file
from flask_login import login_user, login_required, logout_user, current_user
from app import app, db, User, Password
from crypto import cipher_suite
import pyotp
import secrets
import string
import os
from base64 import b64encode
from cryptography.fernet import Fernet
import qrcode
from io import BytesIO
import base64

# Verschlüsselungshelfer
ENCRYPTION_KEY_FILE = 'encryption.key'

def get_or_create_key():
    if os.path.exists(ENCRYPTION_KEY_FILE):
        with open(ENCRYPTION_KEY_FILE, 'rb') as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(ENCRYPTION_KEY_FILE, 'wb') as f:
            f.write(key)
        return key

encryption_key = get_or_create_key()
cipher_suite = Fernet(encryption_key)

# CORS Pre-flight route
@app.route('/api/check-auth', methods=['GET', 'OPTIONS'])
@login_required
def check_auth():
    if request.method == 'OPTIONS':
        return '', 200
        
    return jsonify({
        'authenticated': True,
        'user': {
            'id': current_user.id,
            'email': current_user.email
        }
    })

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    try:
        user = User()
        user.email = data['email']
        user.set_password(data['password'])
        user.generate_2fa_secret()
        
        # Generate QR code
        totp = pyotp.TOTP(user.two_factor_secret)
        provisioning_uri = totp.provisioning_uri(user.email, issuer_name='Windkey')
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img_buffer = BytesIO()
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'two_factor_secret': user.two_factor_secret,
            'qr_code': f'data:image/png;base64,{img_str}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(data['two_factor_code']):
        return jsonify({'error': 'Invalid 2FA code'}), 401
    
    login_user(user)
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'email': user.email
        }
    })

@app.route('/api/logout', methods=['POST', 'OPTIONS'])
@login_required
def logout():
    if request.method == 'OPTIONS':
        return '', 200
        
    logout_user()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/passwords', methods=['GET', 'OPTIONS'])
@login_required
def get_passwords():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        passwords = Password.query.filter_by(user_id=current_user.id).all()
        return jsonify([{
            'id': p.id,
            'title': p.title,
            'password': cipher_suite.decrypt(p.encrypted_password).decode(),
            'url': p.url,
            'notes': p.notes,
            'created_at': p.created_at.isoformat(),
            'updated_at': p.updated_at.isoformat()
        } for p in passwords])
    except Exception as e:
        print(f"Error in get_passwords: {str(e)}")  # Debug-Ausgabe
        return jsonify({'error': str(e)}), 500

@app.route('/api/passwords', methods=['POST', 'OPTIONS'])
@login_required
def create_password():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400
            
        # Verschlüssele das Passwort
        encrypted_password = cipher_suite.encrypt(data['password'].encode())
        
        password = Password(
            user_id=current_user.id,
            title=data.get('title', 'Untitled'),
            encrypted_password=encrypted_password,
            url=data.get('url', ''),
            notes=data.get('notes', '')
        )
        
        db.session.add(password)
        db.session.commit()
        
        return jsonify({
            'id': password.id,
            'title': password.title,
            'url': password.url,
            'notes': password.notes,
            'created_at': password.created_at.isoformat(),
            'updated_at': password.updated_at.isoformat()
        }), 201
        
    except Exception as e:
        print(f"Error in create_password: {str(e)}")  # Debug-Ausgabe
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/passwords/<int:id>', methods=['PUT', 'OPTIONS'])
@login_required
def update_password(id):
    if request.method == 'OPTIONS':
        return '', 200
        
    password = Password.query.get_or_404(id)
    
    if password.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'password' in data and data['password']:
        password.encrypted_password = cipher_suite.encrypt(data['password'].encode())
    if 'title' in data:
        password.title = data['title']
    if 'url' in data:
        password.url = data['url']
    if 'notes' in data:
        password.notes = data['notes']
    
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/passwords/<int:id>', methods=['GET', 'OPTIONS'])
@login_required
def get_password(id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        password = Password.query.filter_by(id=id, user_id=current_user.id).first()
        if not password:
            return jsonify({'error': 'Password not found'}), 404
            
        return jsonify({
            'id': password.id,
            'title': password.title,
            'password': cipher_suite.decrypt(password.encrypted_password).decode(),
            'url': password.url,
            'notes': password.notes,
            'created_at': password.created_at.isoformat(),
            'updated_at': password.updated_at.isoformat()
        })
    except Exception as e:
        print(f"Error in get_password: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/passwords/<int:id>', methods=['DELETE', 'OPTIONS'])
@login_required
def delete_password(id):
    if request.method == 'OPTIONS':
        return '', 200
        
    password = Password.query.get_or_404(id)
    
    if password.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(password)
    db.session.commit()
    
    return jsonify({'message': 'Password deleted successfully'})

@app.route('/api/generate-password', methods=['GET', 'OPTIONS'])
def generate_password():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Parameter aus der Anfrage lesen
        length = min(max(int(request.args.get('length', 16)), 4), 128)  # Min 4, Max 128 Zeichen
        use_uppercase = request.args.get('uppercase', 'true').lower() == 'true'
        use_lowercase = request.args.get('lowercase', 'true').lower() == 'true'
        use_numbers = request.args.get('numbers', 'true').lower() == 'true'
        use_special = request.args.get('special', 'true').lower() == 'true'
        
        # Zeichensätze basierend auf den Parametern
        characters = ''
        if use_uppercase:
            characters += string.ascii_uppercase
        if use_lowercase:
            characters += string.ascii_lowercase
        if use_numbers:
            characters += string.digits
        if use_special:
            characters += string.punctuation
            
        # Stelle sicher, dass mindestens ein Zeichensatz ausgewählt ist
        if not characters:
            characters = string.ascii_letters + string.digits
            
        # Generiere das Passwort
        password = ''.join(secrets.choice(characters) for _ in range(length))
        
        # Stelle sicher, dass das Passwort die Mindestanforderungen erfüllt
        if use_uppercase and not any(c.isupper() for c in password):
            password = secrets.choice(string.ascii_uppercase) + password[1:]
        if use_lowercase and not any(c.islower() for c in password):
            password = password[:-1] + secrets.choice(string.ascii_lowercase)
        if use_numbers and not any(c.isdigit() for c in password):
            password = password[len(password)//2:] + secrets.choice(string.digits) + password[:len(password)//2]
        if use_special and not any(c in string.punctuation for c in password):
            pos = secrets.randbelow(len(password))
            password = password[:pos] + secrets.choice(string.punctuation) + password[pos+1:]
            
        return jsonify({
            'password': password,
            'length': len(password),
            'uppercase': any(c.isupper() for c in password),
            'lowercase': any(c.islower() for c in password),
            'numbers': any(c.isdigit() for c in password),
            'special': any(c in string.punctuation for c in password)
        })
    except Exception as e:
        print(f"Error in generate_password: {str(e)}")
        return jsonify({'error': str(e)}), 500
