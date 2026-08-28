from typing import Generator
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, db_session
from app.core.security import decode_access_token

def get_database_session() -> Generator[Session, None, None]:
    yield from get_db()

def get_current_user_optional(authorization: str = Header(None)) -> dict:
    if not authorization:
        return {}
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload:
        return {}
    return payload

def get_current_user_required(authorization: str = Header(None)) -> dict:
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
