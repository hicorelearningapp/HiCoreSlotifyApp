"""
Idempotent column additions for the Instagram tables.

SQLAlchemy's create_all() creates missing tables but never alters existing
ones. A server that already ran an earlier version has instagram_connections
without the token-lifecycle columns, so they are added here on startup.

Follows the same ALTER-and-ignore pattern as update_schema.py.
"""
import logging

from sqlalchemy import inspect, text

logger = logging.getLogger("uvicorn")

INSTAGRAM_COLUMNS = {
    "instagram_connections": [
        ("TokenExpiresAt", "FLOAT"),
        ("Scopes", "VARCHAR(500)"),
        ("AccountType", "VARCHAR(50)"),
        ("AppScopedId", "VARCHAR(64)"),
    ],
}


def ensure_instagram_schema(engine) -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    for table, columns in INSTAGRAM_COLUMNS.items():
        if table not in existing_tables:
            # create_all() will build it complete; nothing to patch.
            continue
        present = {c["name"] for c in inspector.get_columns(table)}
        for name, column_type in columns:
            if name in present:
                continue
            try:
                with engine.begin() as connection:
                    connection.execute(
                        text(f"ALTER TABLE {table} ADD COLUMN {name} {column_type} NULL")
                    )
                logger.info("Added %s.%s", table, name)
            except Exception as e:
                logger.warning("Could not add %s.%s: %s", table, name, e)
