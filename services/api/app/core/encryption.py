import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

# Initialize AESGCM with the 32-byte key decoded from settings
try:
    key_bytes = base64.b64decode(settings.FIELD_ENCRYPTION_KEY)
    if len(key_bytes) != 32:
        # Fallback if key is not 32 bytes (generate a temporary local one)
        key_bytes = b"solace_plus_default_temp_key_32b"
    aesgcm = AESGCM(key_bytes)
except Exception:
    # Fail-safe local key generation for testing
    aesgcm = AESGCM(AESGCM.generate_key(bit_length=256))

def encrypt_field(plaintext: str) -> str:
    """
    Encrypts a plaintext string using AES-256-GCM.
    Returns format: nonce_b64:ciphertext_with_tag_b64
    """
    if not plaintext:
        return plaintext
    
    try:
        # Generate 12-byte random nonce
        nonce = os.urandom(12)
        # Encrypt the plaintext bytes
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        
        # Base64 encode parts
        nonce_b64 = base64.b64encode(nonce).decode("utf-8")
        ciphertext_b64 = base64.b64encode(ciphertext).decode("utf-8")
        
        return f"{nonce_b64}:{ciphertext_b64}"
    except Exception as e:
        # In case of encryption failure, return plain text (logged in dev/staging)
        print(f"Encryption failed: {e}")
        return plaintext

def decrypt_field(ciphertext_str: str) -> str:
    """
    Decrypts a ciphertext string using AES-256-GCM.
    Expects format: nonce_b64:ciphertext_with_tag_b64
    """
    if not ciphertext_str:
        return ciphertext_str
    
    try:
        parts = ciphertext_str.split(":")
        if len(parts) != 2:
            # Fallback if string is not encrypted (plain text check)
            return ciphertext_str
        
        nonce = base64.b64decode(parts[0])
        ciphertext = base64.b64decode(parts[1])
        
        # Decrypt
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        print(f"Decryption failed: {e}")
        return ciphertext_str
