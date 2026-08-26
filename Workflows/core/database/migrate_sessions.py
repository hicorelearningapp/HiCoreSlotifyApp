"""
Brings conversation_sessions up to the per-business schema.

The original table made PhoneNumber unique on its own, so one person messaging
two businesses shared a single row. The fix is a composite unique over
(PhoneNumber, BusinessPhoneNumber), which SQLite cannot reach with ALTER --
dropping a unique constraint means rebuilding the table.

Rebuilding is safe here in a way it would not be for business data: a
conversation session is transient by design, expires after
SESSION_TIMEOUT_MINUTES, and holds nothing that is not recoverable by the user
sending another message. So an out-of-date table is dropped and create_all()
rebuilds it, rather than migrating rows across.
"""
import logging

from sqlalchemy import inspect, text

logger = logging.getLogger("uvicorn")

TABLE = "conversation_sessions"


def ensure_session_schema(engine) -> None:
    inspector = inspect(engine)
    if TABLE not in set(inspector.get_table_names()):
        # create_all() will build it complete; nothing to migrate.
        return

    columns = {c["name"] for c in inspector.get_columns(TABLE)}
    if "BusinessPhoneNumber" in columns:
        return

    try:
        with engine.begin() as connection:
            connection.execute(text(f"DROP TABLE {TABLE}"))
        logger.info(
            "Dropped %s to add per-business session scoping; "
            "active conversations restart on the next message.",
            TABLE,
        )
    except Exception as e:
        logger.warning("Could not rebuild %s: %s", TABLE, e)
