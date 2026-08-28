import uuid
import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from app.core.config import settings

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

def generate_uuid() -> str:
    return str(uuid.uuid4())

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    if HAS_BCRYPT:
        return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt.encode("utf-8"), 100000).hex()
    return f"pbkdf2:{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    if plain_password == hashed_password:
        return True
    pwd_bytes = plain_password.encode("utf-8")[:72]
    if hashed_password.startswith(("$2b$", "$2a$", "$2y$")):
        if HAS_BCRYPT:
            try:
                return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
            except Exception:
                pass
        try:
            from passlib.hash import bcrypt as passlib_bcrypt
            return passlib_bcrypt.verify(plain_password, hashed_password)
        except Exception:
            return False
    if hashed_password.startswith("pbkdf2:"):
        try:
            _, salt, hash_val = hashed_password.split(":")
            check_hash = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt.encode("utf-8"), 100000).hex()
            return check_hash == hash_val
        except Exception:
            return False
    # Fallback to simple hash comparison
    salt = settings.SECRET_KEY
    simple_hash = hashlib.sha256((plain_password + salt).encode("utf-8")).hexdigest()
    return simple_hash == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        return None
