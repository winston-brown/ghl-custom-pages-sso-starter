"""
GHL SSO payload decryption.

CryptoJS encrypts with AES-256-CBC using OpenSSL's Salted__ format.
The key and IV are derived from the passphrase + salt using MD5-based
EVP_BytesToKey. This module implements the Python equivalent.
"""

import base64
import json
from hashlib import md5

from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad


def evp_bytes_to_key(
    password: bytes, salt: bytes, key_len: int = 32, iv_len: int = 16
) -> tuple[bytes, bytes]:
    """
    OpenSSL-compatible key derivation (EVP_BytesToKey with MD5).

    CryptoJS uses this internally when encrypting with a passphrase.
    Derives both the AES key and IV by iteratively hashing with MD5.

    Args:
        password: The shared secret as bytes
        salt: 8-byte salt extracted from the encrypted payload
        key_len: 32 for AES-256
        iv_len: 16 for AES block size

    Returns:
        Tuple of (key, iv) as bytes
    """
    d = b""
    key_iv = b""
    while len(key_iv) < key_len + iv_len:
        d = md5(d + password + salt).digest()
        key_iv += d
    return key_iv[:key_len], key_iv[key_len : key_len + iv_len]


def decrypt_sso_payload(encrypted_data: str, shared_secret: str) -> dict:
    """
    Decrypt a GHL SSO payload.

    The payload is base64-encoded and uses OpenSSL's Salted__ format:
    - Bytes 0-7:  'Salted__' literal
    - Bytes 8-15: 8-byte random salt
    - Bytes 16+:  AES-256-CBC encrypted data with PKCS7 padding

    Args:
        encrypted_data: Base64-encoded encrypted string from GHL
        shared_secret: Your app's Shared Secret key

    Returns:
        Decrypted user context as a dictionary

    Raises:
        ValueError: If the payload format is invalid or decryption fails
    """
    raw = base64.b64decode(encrypted_data)

    if raw[:8] != b"Salted__":
        raise ValueError("Invalid payload: missing 'Salted__' header")

    salt = raw[8:16]
    ciphertext = raw[16:]

    key, iv = evp_bytes_to_key(shared_secret.encode("utf-8"), salt)

    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)

    return json.loads(plaintext.decode("utf-8"))
