"""
Database wiring.

This service owns four tables and reads one belonging to the catalogue. Its
Base is its own, so create_all() here only ever creates Instagram tables --
it will not try to build Backend's schema even when pointed at the shared
SQLite file.
"""
import contextvars
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, scoped_session, sessionmaker

from config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# One session per request, keyed on a contextvar the middleware sets.
request_context = contextvars.ContextVar("request_context", default=None)


def _context_id() -> int:
    ctx = request_context.get()
    return 0 if ctx is None else id(ctx)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal, scopefunc=_context_id)

Base = declarative_base()


def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db_session.remove()


def generate_uuid() -> str:
    return str(uuid.uuid4())
