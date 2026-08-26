"""
Duplicate-event and reply-loop protection for Instagram comments.

Two problems this solves:

1. Meta retries a webhook it considers failed, for several minutes. Without
   suppression every retry produces another public reply and another DM.
2. Our own public reply is itself a comment, so Meta delivers it straight back
   to us. Replying to it would loop.

Phase 2 moved this from an in-process dict to the instagram_processed_events
table, so a restart no longer forgets what was already answered. Claiming is
done with an INSERT against a UNIQUE column: the database decides the winner,
which is what makes it safe when more than one worker is running.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta

from sqlalchemy.exc import IntegrityError

from config import INSTAGRAM_EVENT_RETENTION_SECONDS
from core.channels.instagram.models.instagram_connection import InstagramProcessedEvent

logger = logging.getLogger("uvicorn")


class InstagramEventGuard:
    def __init__(self, retention_seconds: int = INSTAGRAM_EVENT_RETENTION_SECONDS):
        self.retention_seconds = max(3600, int(retention_seconds))

    @staticmethod
    def _event_key(account_id: str, comment_id: str) -> str:
        return f"event:{account_id}:{comment_id}"

    @staticmethod
    def _own_key(account_id: str, comment_id: str) -> str:
        return f"own:{account_id}:{comment_id}"

    def _insert(self, db, key: str, account_id: str) -> bool:
        """Insert one key. False when it was already present."""
        record = InstagramProcessedEvent(
            EventKey=key,
            InstagramAccountId=str(account_id) if account_id else None,
        )
        db.add(record)
        try:
            db.commit()
            return True
        except IntegrityError:
            # Another delivery (or another worker) claimed this key first.
            db.rollback()
            return False

    def _exists(self, db, key: str) -> bool:
        return (
            db.query(InstagramProcessedEvent)
            .filter(InstagramProcessedEvent.EventKey == key)
            .first()
            is not None
        )

    def claim_event(self, db, account_id: str, comment_id: str) -> bool:
        """Reserve a comment for processing.

        Returns True for the first delivery and False for every repeat. The
        claim is taken before any reply is attempted, so a Meta retry cannot
        produce a second reply. The cost is that a reply which fails at the
        Graph call is not retried -- it is logged instead.
        """
        return self._insert(db, self._event_key(account_id, comment_id), account_id)

    def record_own_reply(self, db, account_id: str, comment_id: str) -> None:
        """Remember a comment id we created, so we never reply to it."""
        if not comment_id:
            return
        self._insert(db, self._own_key(account_id, comment_id), account_id)

    def is_own_reply(self, db, account_id: str, comment_id: str) -> bool:
        return self._exists(db, self._own_key(account_id, comment_id))

    def prune(self, db) -> int:
        """Delete records past the retention window. Safe to call periodically."""
        cutoff = datetime.utcnow() - timedelta(seconds=self.retention_seconds)
        deleted = (
            db.query(InstagramProcessedEvent)
            .filter(InstagramProcessedEvent.CreatedAt < cutoff)
            .delete(synchronize_session=False)
        )
        db.commit()
        if deleted:
            logger.info("Pruned %s Instagram processed-event records", deleted)
        return deleted

    def stats(self, db) -> dict:
        return {"processed_events": db.query(InstagramProcessedEvent).count()}


instagram_event_guard = InstagramEventGuard()
