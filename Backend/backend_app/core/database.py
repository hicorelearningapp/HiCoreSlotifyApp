import os
import contextvars
import logging
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from backend_app.core.config import settings

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

# Dynamic schema migration helpers
INSTAGRAM_COLUMNS = {
    "instagram_connections": [
        ("TokenExpiresAt", "FLOAT"),
        ("Scopes", "VARCHAR(500)"),
        ("AccountType", "VARCHAR(50)"),
        ("AppScopedId", "VARCHAR(64)"),
    ],
}

PRODUCT_COLUMNS = {
    "products": [
        ("category", "VARCHAR(100)"),
        ("product_type", "VARCHAR(100)"),
        ("compare_at_price", "FLOAT"),
        ("sku", "VARCHAR(100)"),
        ("stock_quantity", "INTEGER DEFAULT 0"),
        ("unit", "VARCHAR(50) DEFAULT 'Pieces'"),
        ("images", "TEXT"),
        ("store_id", "VARCHAR(50) DEFAULT 'default'"),
        ("product_data", "TEXT"),
    ],
    "product_variants": [
        ("sku", "VARCHAR(100)"),
        ("compare_at_price", "FLOAT"),
        ("stock_quantity", "INTEGER DEFAULT 0"),
        ("variant_data", "TEXT"),
    ],
}

ORDER_COLUMNS = {
    "orders": [
        ("order_number", "VARCHAR(50)"),
        ("customer_name", "VARCHAR(150)"),
        ("customer_phone", "VARCHAR(50)"),
        ("customer_email", "VARCHAR(150)"),
        ("shipping_address", "VARCHAR(300)"),
        ("city", "VARCHAR(100)"),
        ("state", "VARCHAR(100)"),
        ("pincode", "VARCHAR(20)"),
        ("payment_status", "VARCHAR(50) DEFAULT 'Unpaid'"),
        ("subtotal", "FLOAT DEFAULT 0.0"),
        ("shipping_fee", "FLOAT DEFAULT 0.0"),
        ("discount", "FLOAT DEFAULT 0.0"),
        ("notes", "TEXT"),
        ("store_id", "VARCHAR(50) DEFAULT 'default'"),
        ("updated_at", "DATETIME"),
    ],
    "order_items": [
        ("product_name", "VARCHAR(200)"),
        ("variant_name", "VARCHAR(150)"),
        ("sku", "VARCHAR(100)"),
        ("total_price", "FLOAT DEFAULT 0.0"),
    ],
}

def ensure_dynamic_schemas(target_engine=None):
    if target_engine is None:
        target_engine = engine
    try:
        inspector = inspect(target_engine)
        existing_tables = set(inspector.get_table_names())

        all_schemas = {**PRODUCT_COLUMNS, **ORDER_COLUMNS}
        for table, columns in all_schemas.items():
            if table not in existing_tables:
                continue
            present = {c["name"] for c in inspector.get_columns(table)}
            for name, column_type in columns:
                if name in present:
                    continue
                try:
                    with target_engine.begin() as connection:
                        connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {column_type} NULL"))
                    logger.info("Added %s.%s", table, name)
                except Exception as e:
                    logger.warning("Could not add %s.%s: %s", table, name, e)
    except Exception as e:
        logger.warning("Error running dynamic schema check: %s", e)
