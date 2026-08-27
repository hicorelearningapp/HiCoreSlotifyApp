"""
Durable queue for outbound replies, with retry and backoff.

Replies are not sent during the webhook request. The reason is specific: by the
time we would send, the event has already been claimed against duplicate
delivery, so an inline failure had no second chance -- a 429 or a network blip
lost the reply permanently. Enqueuing lets the webhook return fast and gives a
transient failure somewhere to be retried from.

ActionId is `{account_id}:{comment_id}:{action_type}` and UNIQUE, so the same
comment cannot enqueue the same reply twice even under concurrent delivery.
"""
from __future__ import annotations

import logging
import time

from sqlalchemy.exc import IntegrityError

from config import INSTAGRAM_MAX_DELIVERY_ATTEMPTS, INSTAGRAM_WORKER_BATCH_SIZE
from models.connection import InstagramReplyAction
from services.dedup_guard import dedup_guard
from services.messenger import InstagramSendError, messenger
from services.tenant_resolver import tenant_resolver

logger = logging.getLogger("uvicorn")

MAX_BACKOFF_SECONDS = 60.0


def action_id(account_id: str, comment_id: str, action_type: str) -> str:
    return f"{account_id}:{comment_id}:{action_type}"


class ReplyQueue:
    def enqueue(self, db, account_id: str, comment_id: str,
                actions: list[tuple[str, str]]) -> int:
        """Queue (action_type, text) pairs. Returns how many were new."""
        queued = 0
        for action_type, reply_text in actions:
            row = InstagramReplyAction(
                ActionId=action_id(account_id, comment_id, action_type),
                InstagramAccountId=str(account_id),
                CommentId=str(comment_id),
                ActionType=action_type,
                ReplyText=reply_text,
                Status="queued",
                Attempts=0,
                NextAttemptAt=time.time(),
            )
            db.add(row)
            try:
                db.commit()
                queued += 1
            except IntegrityError:
                # Already queued by a concurrent delivery of the same comment.
                db.rollback()
        return queued

    def claim_due(self, db, limit: int | None = None) -> list[InstagramReplyAction]:
        """Take the next batch of due actions and mark them processing."""
        now = time.time()
        rows = (
            db.query(InstagramReplyAction)
            .filter(
                InstagramReplyAction.Status.in_(("queued", "retry")),
                InstagramReplyAction.NextAttemptAt <= now,
            )
            .order_by(InstagramReplyAction.NextAttemptAt.asc())
            .limit(limit or INSTAGRAM_WORKER_BATCH_SIZE)
            .all()
        )
        for row in rows:
            row.Status = "processing"
            row.Attempts = (row.Attempts or 0) + 1
        if rows:
            db.commit()
        return rows

    def recover_stuck(self, db) -> int:
        """Return actions left `processing` by a crash to the queue."""
        stuck = (
            db.query(InstagramReplyAction)
            .filter(InstagramReplyAction.Status == "processing")
            .all()
        )
        for action in stuck:
            action.Status = "retry"
            action.NextAttemptAt = time.time()
        if stuck:
            db.commit()
            logger.info("Recovered %s stuck Instagram reply actions", len(stuck))
        return len(stuck)

    def mark_sent(self, db, action, meta_result_id: str | None) -> None:
        action.Status = "sent"
        action.MetaResultId = meta_result_id
        action.LastError = None
        db.commit()

    def mark_retry(self, db, action, error: Exception) -> None:
        action.Status = "retry"
        action.LastError = str(error)[:1000]
        # 2s, 4s, 8s, 16s ... capped at a minute.
        action.NextAttemptAt = time.time() + min(
            MAX_BACKOFF_SECONDS, 2.0 ** (action.Attempts or 1)
        )
        db.commit()

    def mark_failed(self, db, action, error: Exception) -> None:
        action.Status = "failed"
        action.LastError = str(error)[:1000]
        db.commit()

    def process_once(self, db) -> int:
        """Deliver every due action. Returns how many were attempted."""
        actions = self.claim_due(db)
        for action in actions:
            self._deliver(db, action)
        return len(actions)

    def _deliver(self, db, action) -> None:
        token = tenant_resolver.get_access_token(db, action.InstagramAccountId)
        if not token:
            self.mark_failed(
                db, action,
                RuntimeError(f"no usable token for account {action.InstagramAccountId}"),
            )
            return

        try:
            if action.ActionType == "public":
                reply_id = messenger.reply_publicly(
                    action.CommentId, action.ReplyText, access_token=token
                )
                # Remember our own reply so Meta delivering it back does not
                # start a loop.
                if reply_id:
                    dedup_guard.record_own_reply(db, action.InstagramAccountId, reply_id)
            elif action.ActionType == "private":
                reply_id = messenger.send_private_reply(
                    action.InstagramAccountId, action.CommentId,
                    action.ReplyText, access_token=token,
                )
            else:
                self.mark_failed(
                    db, action, RuntimeError(f"unknown action type {action.ActionType!r}")
                )
                return

            self.mark_sent(db, action, reply_id)
            logger.info(
                "Delivered %s reply for comment %s", action.ActionType, action.CommentId
            )

        except InstagramSendError as e:
            attempts = action.Attempts or 1
            if e.retryable and attempts < INSTAGRAM_MAX_DELIVERY_ATTEMPTS:
                self.mark_retry(db, action, e)
                logger.warning(
                    "Instagram %s reply attempt %s failed, will retry: %s",
                    action.ActionType, attempts, e,
                )
            else:
                self.mark_failed(db, action, e)
                logger.error(
                    "Instagram %s reply gave up after %s attempts: %s",
                    action.ActionType, attempts, e,
                )
        except Exception as e:  # noqa: BLE001 - a bug here must not kill the worker
            self.mark_retry(db, action, e)
            logger.exception("Unexpected error delivering Instagram reply: %s", e)


reply_queue = ReplyQueue()
