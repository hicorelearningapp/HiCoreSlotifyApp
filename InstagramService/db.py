"""
Database wiring.

Four tables in a database of this service's own. It reads nobody else's
tables, so it no longer shares appointments.db with the Backend API and the
bot engine -- that sharing only ever existed for the catalogue join the reel
link table replaced.

Base is its own regardless, so create_all() creates Instagram tables and
nothing else even when DATABASE_URL is pointed back at the shared file.
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
