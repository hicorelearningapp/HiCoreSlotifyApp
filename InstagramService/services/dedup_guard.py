"""
Duplicate-delivery and self-reply protection.

Two problems, one table:

  Meta retries a webhook it believes failed, for several minutes. Without a
  claim, each retry produces another public reply under the same comment.

  Our own public reply is itself a comment on our own media, and Meta delivers
  it back to us. Answering it would produce another reply, which comes back
  again -- an unbounded loop under the vendor's own account.

Both are solved by recording keys, prefixed by kind so they cannot collide:

    event:{account_id}:{comment_id}   a delivery already handled
    own:{account_id}:{comment_id}     a comment this service created
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta

from sqlalchemy.exc import IntegrityError

from config import INSTAGRAM_EVENT_RETENTION_SECONDS
from models.connection import InstagramProcessedEvent

logger = logging.getLogger("uvicorn")


def event_key(account_id: str, comment_id: str) -> str:
    return f"event:{account_id}:{comment_id}"


def own_key(account_id: str, comment_id: str) -> str:
    return f"own:{account_id}:{comment_id}"


class DedupGuard:
    def _claim(self, db, key: str, account_id: str) -> bool:
        """Insert a key, returning False if another writer got there first.

        The uniqueness check is the INSERT itself rather than a SELECT before
        it: two concurrent deliveries of the same comment would both pass a
        read check and both reply.
        """
        row = InstagramProcessedEvent(EventKey=key, InstagramAccountId=str(account_id))
        db.add(row)
        try:
            db.commit()
            return True
        except IntegrityError:
            db.rollback()
            return False

    def claim_event(self, db, account_id: str, comment_id: str) -> bool:
        """Take an exclusive claim on one delivery. False means duplicate."""
        return self._claim(db, event_key(account_id, comment_id), account_id)

    def record_own_reply(self, db, account_id: str, comment_id: str) -> None:
        """Remember a comment id this service created, so we ignore it later."""
        if not self._claim(db, own_key(account_id, comment_id), account_id):
            # Already recorded is fine. A real write failure is not: without
            # this row, Meta delivering our own reply back looks like a fresh
            # comment and the account starts answering itself.
            logger.warning(
                "Could not record our own reply %s on account %s; if this was "
                "not a duplicate, a self-reply loop is possible",
                comment_id, account_id,
            )

    def is_own_reply(self, db, account_id: str, comment_id: str) -> bool:
        return (
            db.query(InstagramProcessedEvent)
            .filter(InstagramProcessedEvent.EventKey == own_key(account_id, comment_id))
            .first()
            is not None
        )

    def prune(self, db, retention_seconds: int | None = None) -> int:
        """Drop records older than the retention window.

        The window only has to outlive Meta's retry period; keeping them
        forever would grow the table without bound.
        """
        seconds = retention_seconds or INSTAGRAM_EVENT_RETENTION_SECONDS
        threshold = datetime.utcnow() - timedelta(seconds=seconds)
        deleted = (
            db.query(InstagramProcessedEvent)
            .filter(InstagramProcessedEvent.CreatedAt < threshold)
            .delete()
        )
        db.commit()
        if deleted:
            logger.info("Pruned %s processed Instagram events", deleted)
        return deleted


dedup_guard = DedupGuard()
