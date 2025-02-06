from flask import jsonify, request, send_file
from flask_login import login_user, login_required, logout_user, current_user
from app import app, db, User, Password, History, Category
import pyotp
import secrets
import string
import os
from base64 import b64encode
from cryptography.fernet import Fernet
import qrcode
from io import BytesIO
import base64
import hashlib
import requests

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
    print("Login attempt for email:", data['email'])  # Debug log
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    totp = pyotp.TOTP(user.two_factor_secret)
    provided_code = data['two_factor_code']
    print("2FA verification - Secret:", user.two_factor_secret)  # Debug log
    print("2FA verification - Provided code:", provided_code)  # Debug log
    if not totp.verify(provided_code, valid_window=1):
        print("2FA verification failed")  # Debug log
        return jsonify({'error': 'Invalid 2FA code'}), 401
    
    print("Login successful")  # Debug log
    login_user(user)
    
    # Log the successful login
    log_user_action('login', f'User logged in: {user.email}')
    
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
    
    # Log the logout action before the user is logged out
    log_user_action('logout', f'User logged out: {current_user.email}')
    
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

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
            'category_id': p.category_id,
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
            notes=data.get('notes', ''),
            category_id=data.get('category_id')
        )
        
        db.session.add(password)
        db.session.commit()
        
        # Log password creation
        log_user_action('create_password', f'Created password entry: {data["title"]}')
        
        return jsonify({
            'id': password.id,
            'title': password.title,
            'url': password.url,
            'notes': password.notes,
            'category_id': password.category_id,
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
    if 'category_id' in data:
        password.category_id = data['category_id']
    
    db.session.commit()
    
    # Log password update
    log_user_action('update_password', f'Updated password entry: {password.title}')
    
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
            'category_id': password.category_id,
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
    
    # Log password deletion before deleting
    log_user_action('delete_password', f'Deleted password entry: {password.title}')
    
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

@app.route('/api/check-password-breach', methods=['POST'])
@login_required
def check_password_breach():
    try:
        data = request.get_json()
        password = data.get('password')
        
        # Generate SHA-1 hash of password
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]
        
        # Query haveibeenpwned API
        url = f'https://api.pwnedpasswords.com/range/{prefix}'
        headers = {
            'User-Agent': 'Windkey Password Manager',
            'Accept': 'application/json'
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            return jsonify({'error': 'API request failed'}), 500
            
        # Check if hash suffix is in response
        hashes = (line.split(':') for line in response.text.splitlines())
        count = next((int(count) for hash_suffix, count in hashes if hash_suffix == suffix), 0)
        
        return jsonify({
            'breached': count > 0,
            'count': count
        })
        
    except Exception as e:
        print(f"Error in check_password_breach: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET', 'OPTIONS'])
@login_required
def get_history():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        history_entries = History.query.filter_by(user_id=current_user.id).order_by(History.timestamp.desc()).all()
        return jsonify([entry.to_dict() for entry in history_entries])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Category endpoints
@app.route('/api/categories', methods=['GET', 'OPTIONS'])
@login_required
def get_categories():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        categories = Category.query.filter_by(user_id=current_user.id).all()
        return jsonify([category.to_dict() for category in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['POST', 'OPTIONS'])
@login_required
def create_category():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Category name is required'}), 400
            
        category = Category(
            user_id=current_user.id,
            name=data['name'],
            icon=data.get('icon', 'Folder'),  # Default icon
            color=data.get('color', '#2563EB')  # Default color (primary blue)
        )
        
        db.session.add(category)
        db.session.commit()
        
        log_user_action('create_category', f'Created category: {category.name}')
        
        return jsonify(category.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/<int:id>', methods=['PUT', 'OPTIONS'])
@login_required
def update_category(id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        category = Category.query.get(id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
            
        if category.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json()
        
        if 'name' in data:
            category.name = data['name']
        if 'icon' in data:
            category.icon = data['icon']
        if 'color' in data:
            category.color = data['color']
            
        db.session.commit()
        
        log_user_action('update_category', f'Updated category: {category.name}')
        
        return jsonify(category.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/<int:id>', methods=['DELETE', 'OPTIONS'])
@login_required
def delete_category(id):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        category = Category.query.get(id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
            
        if category.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Remove category_id from all passwords in this category
        Password.query.filter_by(category_id=id).update({'category_id': None})
        
        category_name = category.name
        db.session.delete(category)
        db.session.commit()
        
        log_user_action('delete_category', f'Deleted category: {category_name}')
        
        return jsonify({'message': 'Category deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Helper function to log user actions
def log_user_action(action, details=None):
    try:
        history_entry = History(
            user_id=current_user.id,
            action=action,
            details=details,
            ip_address=request.remote_addr
        )
        db.session.add(history_entry)
        db.session.commit()
    except Exception as e:
        print(f"Failed to log action: {str(e)}")
        db.session.rollback()
