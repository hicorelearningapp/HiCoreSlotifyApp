"""
The Meta webhook. One endpoint, one payload shape that matters.

Comments arrive as a `changes` array. Direct messages would arrive as a
`messaging` array and are not handled: the account is subscribed to `comments`
only, so Meta never delivers them. Instagram is a funnel here -- a commenter
is answered with a link and the conversation continues on WhatsApp.

This file owns transport only: the size cap, the signature, the JSON. What
happens to a comment lives in services/comment_processor.py, the same way the
bot engine's webhook router hands off to ConversationManager.

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
from services.comment_processor import comment_processor
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
            logger.warning(
                "Rejected a %s byte webhook; the limit is %s",
                len(raw_body), MAX_WEBHOOK_BYTES,
            )
            raise HTTPException(status_code=413, detail="Webhook payload is too large")

        if INSTAGRAM_SIGNATURE_REQUIRED:
            if not INSTAGRAM_APP_SECRET:
                # Every delivery is rejected until this is set, so say it loudly
                # rather than letting the 503s look like a Meta problem.
                logger.error(
                    "INSTAGRAM_APP_SECRET is not configured; rejecting every webhook"
                )
                raise HTTPException(status_code=503, detail="INSTAGRAM_APP_SECRET is not configured")
            signature = request.headers.get("x-hub-signature-256")
            if not signature:
                logger.warning("Webhook arrived with no x-hub-signature-256 header")
                raise HTTPException(status_code=401, detail="Missing webhook signature")
            if not verify_meta_signature(raw_body, signature, INSTAGRAM_APP_SECRET):
                # Either the app secret does not match the app that sent this,
                # or someone else is posting to the endpoint. Both matter.
                logger.error(
                    "Webhook signature did not verify; %s bytes rejected", len(raw_body)
                )
                raise HTTPException(status_code=403, detail="Invalid webhook signature")

        try:
            data = json.loads(raw_body)
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            logger.warning("Webhook body was not readable JSON: %s", exc)
            raise HTTPException(status_code=400, detail="Malformed JSON payload") from exc
        if not isinstance(data, dict):
            logger.warning("Webhook payload was %s, not an object", type(data).__name__)
            raise HTTPException(status_code=400, detail="Webhook payload must be an object")

        if data.get("object") != "instagram":
            # Subscribed to the wrong object in the dashboard, most likely.
            logger.warning(
                "Ignoring a webhook for object %r; this service only handles "
                "'instagram'", data.get("object"),
            )
            return {"status": "ignored"}

        try:
            outcomes = comment_processor.process(db_session, data)
        except HTTPException:
            raise
        except Exception:
            # Deliberately a 500. Meta retries, and the claim in the funnel stops
            # the retry becoming a duplicate reply.
            logger.exception("Unhandled error processing Instagram webhook")
            raise HTTPException(status_code=500, detail="Webhook processing failed")

        return {"status": "ok", **outcomes}


router = WebhookRouter().router
