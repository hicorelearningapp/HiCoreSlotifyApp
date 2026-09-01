"""
The comment funnel.

Everything that happens to a comment between arriving and being queued. The
router owns transport -- size, signature, JSON -- and hands the parsed payload
here; this owns the decisions.

Split out for the same reason the bot engine keeps ConversationManager behind
its webhook router: the funnel is the part worth testing, and testing it
should not require constructing an HTTP request. Every method takes its
session, so a test can hand it one.

Nothing here sends anything. It decides and records, and the reply worker
delivers -- by the time a reply would be sent the delivery is already claimed
against duplicates, so an inline failure would have no second chance.
"""
from __future__ import annotations

import logging

from services.comment_gate import comment_gate
from services.handoff_builder import handoff_builder
from services.reply_queue import reply_queue
from services.tenant_resolver import tenant_resolver
from utils.comment_parser import CommentEvent, extract_comment_events

logger = logging.getLogger("uvicorn")


class CommentProcessor:
    def process(self, db, payload: dict) -> dict:
        """Run every comment in one webhook payload. Returns a summary.

        The parser reads the tenant from entry[].id and nowhere else -- an id
        taken from payload content would be attacker-controlled.
        """
        events = extract_comment_events(payload)
        if not events:
            # Delivered, well-formed, and nothing in it we act on: a field we
            # are not subscribed to, or entries the parser could not read.
            # Without this the webhook returns 200 with an empty list and the
            # silence is indistinguishable from nobody having commented.
            entries = len(payload.get("entry") or [])
            logger.warning(
                "Webhook carried no comment events (%s entr%s); nothing to do",
                entries, "y" if entries == 1 else "ies",
            )
            return {"comments": []}

        handled = [self._handle(db, event) for event in events]
        return {"comments": [c for c in handled if c]}

    def _handle(self, db, event: CommentEvent) -> dict:
        """One comment: resolve the vendor, gate it, build the reply, queue it."""
        resolved = tenant_resolver.resolve(db, event.account_id)
        if resolved is None:
            logger.info("No active connection for account %s; skipping", event.account_id)
            return {"comment_id": event.comment_id, "skipped": "no_connection"}

        verdict = comment_gate.evaluate(db, event, resolved)
        if not verdict.passed:
            logger.info(
                "Comment %s skipped: %s (%s)",
                event.comment_id, verdict.reason, verdict.detail,
            )
            return {"comment_id": event.comment_id, "skipped": verdict.reason}

        try:
            public_text, private_text = handoff_builder.build(db, event, resolved.policy)
        except ValueError as e:
            logger.warning("Could not build a reply for comment %s: %s", event.comment_id, e)
            return {"comment_id": event.comment_id, "skipped": "no_reply_text"}

        mode = resolved.policy.comment_reply_mode
        actions = []
        if mode in ("public", "both"):
            actions.append(("public", public_text))
        if mode in ("private", "both"):
            actions.append(("private", private_text))

        queued = reply_queue.enqueue(db, event.account_id, event.comment_id, actions)
        logger.info("Queued %s reply action(s) for comment %s", queued, event.comment_id)
        return {"comment_id": event.comment_id, "queued": queued}


comment_processor = CommentProcessor()
