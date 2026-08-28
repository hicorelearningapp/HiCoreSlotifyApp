import os
import contextvars
import logging
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# Database engine
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

request_context = contextvars.ContextVar("request_context", default=None)

def get_context_id():
    ctx = request_context.get()
    if ctx is None:
        return 0
    return id(ctx)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal, scopefunc=get_context_id)

Base = declarative_base()

def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db_session.remove()
