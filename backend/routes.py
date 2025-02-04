from flask import jsonify, request
from flask_login import login_required, current_user, login_user, logout_user
from app import app, db, User, Password
from cryptography.fernet import Fernet
import pyotp

# Verschlüsselungshelfer
encryption_key = Fernet.generate_key()
cipher_suite = Fernet(encryption_key)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(email=data['email'])
    user.set_password(data['password'])
    user.generate_2fa_secret()
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'two_factor_secret': user.two_factor_secret
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(data['two_factor_code']):
        return jsonify({'error': 'Invalid 2FA code'}), 401
    
    login_user(user)
    return jsonify({'message': 'Login successful'})

@app.route('/api/passwords', methods=['GET'])
@login_required
def get_passwords():
    passwords = Password.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'url': p.url,
        'notes': p.notes,
        'created_at': p.created_at.isoformat(),
        'updated_at': p.updated_at.isoformat()
    } for p in passwords])

@app.route('/api/passwords', methods=['POST'])
@login_required
def create_password():
    data = request.get_json()
    
    # Passwort verschlüsseln
    encrypted_password = cipher_suite.encrypt(data['password'].encode())
    
    password = Password(
        title=data['title'],
        encrypted_password=encrypted_password,
        notes=data.get('notes'),
        url=data.get('url'),
        user_id=current_user.id
    )
    
    db.session.add(password)
    db.session.commit()
    
    return jsonify({'message': 'Password created successfully'}), 201

@app.route('/api/passwords/<int:id>', methods=['PUT'])
@login_required
def update_password(id):
    password = Password.query.get_or_404(id)
    
    if password.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'password' in data:
        password.encrypted_password = cipher_suite.encrypt(data['password'].encode())
    if 'title' in data:
        password.title = data['title']
    if 'notes' in data:
        password.notes = data['notes']
    if 'url' in data:
        password.url = data['url']
    
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/passwords/<int:id>', methods=['DELETE'])
@login_required
def delete_password(id):
    password = Password.query.get_or_404(id)
    
    if password.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(password)
    db.session.commit()
    
    return jsonify({'message': 'Password deleted successfully'})

@app.route('/api/generate-password', methods=['GET'])
def generate_password():
    # Implementierung eines sicheren Passwortgenerators
    import secrets
    import string
    
    length = int(request.args.get('length', 16))
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    
    return jsonify({'password': password})
