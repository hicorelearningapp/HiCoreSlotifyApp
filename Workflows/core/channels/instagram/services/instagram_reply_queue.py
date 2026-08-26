"""
Durable queue for outbound comment replies, with retry and backoff.

Ported from the standalone app's store.py + worker.py, backed by a table
instead of a JSON file.

Before this, a reply was sent inline during the webhook request. A transient
Meta failure (429, a 5xx, a network blip) lost it permanently, because the
event had already been claimed against duplicate delivery. Now the webhook
enqueues and returns fast, and a background worker delivers with exponential
backoff until it succeeds or exhausts its attempts.

ActionId is `{account_id}:{comment_id}:{action_type}` and is UNIQUE, so the
same comment cannot enqueue the same reply twice even under concurrent
deliveries.
"""
from __future__ import annotations

import logging
import time

from sqlalchemy.exc import IntegrityError

from config import (
    INSTAGRAM_MAX_DELIVERY_ATTEMPTS,
    INSTAGRAM_WORKER_BATCH_SIZE,
)
from core.channels.instagram.models.instagram_connection import InstagramReplyAction
from core.channels.instagram.services.instagram_service import instagram as InstagramService
from core.channels.instagram.services.instagram_connection_service import instagram_connection_service
from core.channels.instagram.services.instagram_dedup import instagram_event_guard

logger = logging.getLogger("uvicorn")


class InstagramReplyQueue:

    @staticmethod
    def _action_id(account_id, comment_id, action_type):
        return f"{account_id}:{comment_id}:{action_type}"

    def enqueue(self, db, account_id, comment_id, actions) -> int:
        """Queue (action_type, reply_text) pairs. Returns how many were new."""
        created = 0
        now = time.time()
        for action_type, reply_text in actions:
            action_id = self._action_id(account_id, comment_id, action_type)
            record = InstagramReplyAction(
                ActionId=action_id,
                InstagramAccountId=str(account_id),
                CommentId=str(comment_id),
                ActionType=action_type,
                ReplyText=reply_text,
                Status="pending",
                Attempts=0,
                NextAttemptAt=now,
            )
            db.add(record)
            try:
                db.commit()
                created += 1
            except IntegrityError:
                # Already queued by an earlier delivery of the same comment.
                db.rollback()
        return created

    def claim_due(self, db, limit=None):
        """Take up to `limit` actions that are due, marking them processing."""
        limit = limit or INSTAGRAM_WORKER_BATCH_SIZE
        now = time.time()
        due = (
            db.query(InstagramReplyAction)
            .filter(
                InstagramReplyAction.Status.in_(("pending", "retry")),
                InstagramReplyAction.NextAttemptAt <= now,
            )
            .order_by(InstagramReplyAction.NextAttemptAt)
            .limit(limit)
            .all()
        )
        claimed = []
        for action in due:
            action.Status = "processing"
            action.Attempts = (action.Attempts or 0) + 1
            claimed.append(action)
        if claimed:
            db.commit()
        return claimed

    def recover_stuck(self, db) -> int:
        """Return actions left `processing` by a crash back to the queue."""
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

    def mark_sent(self, db, action, meta_result_id):
        action.Status = "sent"
        action.MetaResultId = meta_result_id
        action.LastError = None
        db.commit()

    def mark_retry(self, db, action, error):
        action.Status = "retry"
        action.LastError = str(error)[:1000]
        # 2s, 4s, 8s, 16s ... capped at a minute.
        action.NextAttemptAt = time.time() + min(60.0, 2.0 ** (action.Attempts or 1))
        db.commit()

    def mark_failed(self, db, action, error):
        action.Status = "failed"
        action.LastError = str(error)[:1000]
        db.commit()

    def process_once(self, db) -> int:
        """Deliver every due action. Returns how many were attempted."""
        actions = self.claim_due(db)
        for action in actions:
            self._deliver(db, action)
        return len(actions)

    def _deliver(self, db, action):
        resolved = instagram_connection_service.resolve(db, action.InstagramAccountId)
        if resolved is None:
            self.mark_failed(db, action, "no active connection for this account")
            return

        try:
            if action.ActionType == "public":
                result_id = InstagramService.reply_publicly(
                    action.CommentId,
                    action.ReplyText,
                    access_token=resolved.access_token,
                )
                # Record our own reply id so Meta echoing it back cannot loop.
                if result_id:
                    instagram_event_guard.record_own_reply(
                        db, action.InstagramAccountId, result_id
                    )
            elif action.ActionType == "private":
                result_id = InstagramService.send_private_reply(
                    action.InstagramAccountId,
                    action.CommentId,
                    action.ReplyText,
                    access_token=resolved.access_token,
                )
            else:
                self.mark_failed(db, action, f"unknown action type {action.ActionType}")
                return
        except Exception as e:
            retryable = getattr(e, "retryable", None)
            if retryable is None:
                # InstagramReplyError carries no classification; treat a failure
                # as retryable until attempts run out rather than dropping it.
                retryable = True
            if retryable and (action.Attempts or 1) < INSTAGRAM_MAX_DELIVERY_ATTEMPTS:
                self.mark_retry(db, action, e)
                logger.warning(
                    "Instagram %s reply will retry (attempt %s): %s",
                    action.ActionType, action.Attempts, e,
                )
            else:
                self.mark_failed(db, action, e)
                logger.error(
                    "Instagram %s reply failed after %s attempts: %s",
                    action.ActionType, action.Attempts, e,
                )
            return

        self.mark_sent(db, action, str(result_id) if result_id else None)
        logger.info(
            "Instagram %s reply sent for comment %s", action.ActionType, action.CommentId
        )

    def stats(self, db) -> dict:
        counts = {}
        for action in db.query(InstagramReplyAction).all():
            counts[action.Status] = counts.get(action.Status, 0) + 1
        return counts


instagram_reply_queue = InstagramReplyQueue()
