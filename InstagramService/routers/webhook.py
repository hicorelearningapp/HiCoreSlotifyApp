"""
The Meta webhook. One endpoint, two payload shapes.

A `messaging` array is a direct message; a `changes` array is a comment. They
share the entry envelope and nothing else.

On error handling: the bot engine's version caught every exception and returned
200 with {"status":"error"}. Meta reads 200 as success and never retries, so a
crash was indistinguishable from a healthy delivery from the outside -- a real
bug sat unnoticed for weeks behind exactly that. Here, anything unexpected
returns 500 so Meta retries, and the claim in the funnel is what stops those
retries turning into duplicate replies.
"""
from __future__ import annotations

import json
import logging
import secrets

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import PlainTextResponse

from config import (
    INSTAGRAM_APP_SECRET,
    INSTAGRAM_SIGNATURE_REQUIRED,
    INSTAGRAM_VERIFY_TOKEN,
    MAX_WEBHOOK_BYTES,
)
from db import db_session
from services.comment_gate import comment_gate
from services.handoff_builder import handoff_builder
from services.messenger import InstagramSendError, messenger
from services.reply_queue import reply_queue
from services.tenant_resolver import tenant_resolver
from utils.comment_parser import extract_comment_events
from utils.signature import verify_meta_signature

logger = logging.getLogger("uvicorn")

# The path registered as the callback URL in the Meta dashboard. Changing it
# means re-verifying the webhook there, so it is a constant rather than a
# literal buried in the route table.
WEBHOOK_PATH = "/webhook/instagram"


class WebhookRouter:
    def __init__(self):
        self.router = APIRouter(tags=["webhook"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(WEBHOOK_PATH, self.verify, methods=["GET"])
        self.router.add_api_route(WEBHOOK_PATH, self.receive, methods=["POST"])

    async def verify(
        self,
        hub_mode: str = Query(None, alias="hub.mode"),
        hub_verify_token: str = Query(None, alias="hub.verify_token"),
        hub_challenge: str = Query(None, alias="hub.challenge"),
    ):
        if (
            hub_mode == "subscribe"
            and hub_verify_token is not None
            and INSTAGRAM_VERIFY_TOKEN
            and secrets.compare_digest(hub_verify_token, INSTAGRAM_VERIFY_TOKEN)
            and hub_challenge is not None
        ):
            logger.info("Instagram webhook verified")
            return PlainTextResponse(hub_challenge)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification failed")

    async def receive(self, request: Request):
        raw_body = await request.body()

        if len(raw_body) > MAX_WEBHOOK_BYTES:
            raise HTTPException(status_code=413, detail="Webhook payload is too large")

        if INSTAGRAM_SIGNATURE_REQUIRED:
            if not INSTAGRAM_APP_SECRET:
                raise HTTPException(status_code=503, detail="INSTAGRAM_APP_SECRET is not configured")
            signature = request.headers.get("x-hub-signature-256")
            if not signature:
                raise HTTPException(status_code=401, detail="Missing webhook signature")
            if not verify_meta_signature(raw_body, signature, INSTAGRAM_APP_SECRET):
                raise HTTPException(status_code=403, detail="Invalid webhook signature")

        try:
            data = json.loads(raw_body)
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise HTTPException(status_code=400, detail="Malformed JSON payload") from exc
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail="Webhook payload must be an object")

        if data.get("object") != "instagram":
            return {"status": "ignored"}

        try:
            outcomes = _dispatch(data)
        except HTTPException:
            raise
        except Exception:
            # Deliberately a 500. Meta retries, and the claim in the funnel stops
            # the retry becoming a duplicate reply.
            logger.exception("Unhandled error processing Instagram webhook")
            raise HTTPException(status_code=500, detail="Webhook processing failed")

        return {"status": "ok", **outcomes}


def _dispatch(payload: dict) -> dict:
    """Route every event in one payload. Returns a per-event summary."""
    dms, comments = [], []

    for entry in payload.get("entry", []):
        if not isinstance(entry, dict):
            continue
        # entry[].id is the only trustworthy tenant signal -- an id read from
        # payload content would be attacker-controlled.
        account_id = str(entry.get("id") or "").strip()
        for messaging in entry.get("messaging", []) or []:
            if isinstance(messaging, dict):
                dms.append(_handle_dm(account_id, messaging))

    for event in extract_comment_events(payload):
        comments.append(_handle_comment(event))

    return {
        "comments": [c for c in comments if c],
        "direct_messages": [d for d in dms if d],
    }


def _handle_dm(account_id: str, messaging: dict) -> dict | None:
    """Answer a direct message with the handoff link.

    Instagram is a funnel: a DM does not start a conversation here. It gets the
    same WhatsApp link a comment does, and the conversation continues there.
    """
    sender_id = str((messaging.get("sender") or {}).get("id") or "").strip()
    message = messaging.get("message") or {}
    if not sender_id or not message.get("text"):
        return None

    # Our own outbound messages echo back with is_echo set.
    if message.get("is_echo"):
        return None

    resolved = tenant_resolver.resolve(db_session, account_id)
    if resolved is None:
        logger.info("No active connection for account %s; ignoring DM", account_id)
        return {"sender": sender_id, "skipped": "unroutable"}

    try:
        text = handoff_builder.dm_reply(resolved.policy)
    except ValueError as e:
        logger.warning("Could not build a DM reply for %s: %s", account_id, e)
        return {"sender": sender_id, "skipped": "no_wa_number"}

    try:
        messenger.send_text(
            resolved.instagram_account_id, sender_id, text,
            access_token=resolved.access_token,
        )
    except InstagramSendError as e:
        # Surfaced rather than swallowed. A DM has no queue behind it, so the
        # 500 this triggers is what gets Meta to deliver it again.
        logger.error("Could not answer DM from %s: %s", sender_id, e)
        raise

    return {"sender": sender_id, "replied": True}


def _handle_comment(event) -> dict:
    """Run one comment through the funnel and queue its replies."""
    resolved = tenant_resolver.resolve(db_session, event.account_id)
    if resolved is None:
        logger.info("No active connection for account %s; skipping", event.account_id)
        return {"comment_id": event.comment_id, "skipped": "no_connection"}

    verdict = comment_gate.evaluate(db_session, event, resolved)
    if not verdict.passed:
        logger.info(
            "Comment %s skipped: %s (%s)", event.comment_id, verdict.reason, verdict.detail
        )
        return {"comment_id": event.comment_id, "skipped": verdict.reason}

    try:
        public_text, private_text = handoff_builder.build(db_session, event, resolved.policy)
    except ValueError as e:
        logger.warning("Could not build a reply for comment %s: %s", event.comment_id, e)
        return {"comment_id": event.comment_id, "skipped": "no_reply_text"}

    mode = resolved.policy.comment_reply_mode
    actions = []
    if mode in ("public", "both"):
        actions.append(("public", public_text))
    if mode in ("private", "both"):
        actions.append(("private", private_text))

    queued = reply_queue.enqueue(db_session, event.account_id, event.comment_id, actions)
    logger.info("Queued %s reply action(s) for comment %s", queued, event.comment_id)
    return {"comment_id": event.comment_id, "queued": queued}


router = WebhookRouter().router
