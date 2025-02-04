from cryptography.fernet import Fernet
import os
from base64 import b64encode

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
