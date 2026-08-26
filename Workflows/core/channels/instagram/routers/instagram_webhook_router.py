import json
import secrets

from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse

from config import (
    INSTAGRAM_VERIFY_TOKEN,
    INSTAGRAM_APP_SECRET,
    INSTAGRAM_SIGNATURE_REQUIRED,
    MAX_WEBHOOK_BYTES,
)
from backend_app.core.database import db_session
from core.conversation.ConversationManagerFactory import ConversationManagerFactory
from core.channels.instagram.services.instagram_service import instagram as InstagramService
from core.channels.instagram.services.instagram_dedup import instagram_event_guard
from core.channels.instagram.services.instagram_handoff_service import instagram_handoff_service
from core.channels.instagram.services.instagram_connection_service import instagram_connection_service
from core.channels.instagram.services.instagram_reply_queue import instagram_reply_queue
from core.workflows.workflow_models import Message
from core.channels.instagram.utils.instagram_comment_parser import extract_comment_events
from core.channels.instagram.utils.instagram_signature import verify_meta_signature
from core.channels.instagram.utils.instagram_rules import matches_comment


class InstagramWebhookRouter:
    def __init__(self):
        self.router = APIRouter(tags=["instagram_webhook"])
        self._add_routes()

    def _add_routes(self):
        # Both spellings are served. The standalone app used /webhooks/instagram
        # (plural) and that is what is already registered in the Meta dashboard,
        # while HiCore's own convention is the singular /webhook/instagram.
        # Accepting both means the existing Meta configuration keeps working
        # without a dashboard change and a re-verification.
        for path in ("/webhook/instagram", "/webhooks/instagram"):
            self.router.add_api_route(path, self.verify, methods=["GET"])
            self.router.add_api_route(path, self.receive_message, methods=["POST"])

    async def verify(self,
        hub_mode: str = Query(None, alias="hub.mode"),
        hub_verify_token: str = Query(None, alias="hub.verify_token"),
        hub_challenge: str = Query(None, alias="hub.challenge")
    ):
        print("Instagram webhook verification")
        if (
            hub_mode == "subscribe"
            and hub_verify_token is not None
            and INSTAGRAM_VERIFY_TOKEN
            and secrets.compare_digest(hub_verify_token, INSTAGRAM_VERIFY_TOKEN)
            and hub_challenge is not None
        ):
            print("Webhook verified")
            return PlainTextResponse(hub_challenge)

        raise HTTPException(status_code=403, detail="Verification failed")

    async def receive_message(self, request: Request):
        # Signature verification runs on the raw bytes, and before the handler's
        # own error handling, so a rejected payload returns 401/403 instead of
        # being swallowed into a 200.
        raw_body = await request.body()
        if len(raw_body) > MAX_WEBHOOK_BYTES:
            raise HTTPException(status_code=413, detail="Webhook payload is too large")

        if INSTAGRAM_SIGNATURE_REQUIRED:
            if not INSTAGRAM_APP_SECRET:
                raise HTTPException(
                    status_code=503,
                    detail="INSTAGRAM_APP_SECRET is not configured",
                )
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

        try:
            print("\n===== INSTAGRAM WEBHOOK =====")
            print(data)

            if data.get("object") != "instagram":
                return {"status": "ignored"}

            # Clear payloads
            InstagramService.sent_payloads = []

            for entry in data.get("entry", []):
                instagram_account_id = entry.get("id")
                print(f"BUSINESS ACCOUNT ID: {instagram_account_id}")

                # ──────────────────────────────────────────────
                # HANDLE DMs (messaging array)
                # ──────────────────────────────────────────────
                for messaging in entry.get("messaging", []):
                    sender = messaging.get("sender", {})
                    sender_id = sender.get("id")
                    print(f"Incoming DM from CUSTOMER ID: {sender_id}")

                    message_data = messaging.get("message")
                    if message_data:
                        text = message_data.get("text")
                        quick_reply = message_data.get("quick_reply")

                        interactive_id = None
                        if quick_reply:
                            interactive_id = quick_reply.get("payload")

                        # Prefix sender_id with ig_ so ConversationManager knows it's from Instagram
                        customer_id = f"ig_{sender_id}"
                        business_id = f"ig_{instagram_account_id}"

                        message = Message(
                            phone_number=customer_id,
                            text=text,
                            interactive_id=interactive_id,
                            business_phone_number=business_id
                        )

                        await ConversationManagerFactory.get_manager(db_session, message.BusinessPhoneNumber).process(customer_id, message)

            # ──────────────────────────────────────────────
            # HANDLE COMMENTS (using the robust parser)
            # ──────────────────────────────────────────────
            for event in extract_comment_events(data):
                self._handle_comment(event)

            bot_replies = InstagramService.sent_payloads
            InstagramService.sent_payloads = []

            return {"status": "ok", "bot_replies": bot_replies}

        except HTTPException:
            raise
        except Exception as ex:
            import traceback
            traceback.print_exc()
            print(f"Error processing instagram webhook: {ex}")
            return {"status": "error", "message": str(ex)}

    def _handle_comment(self, event):
        """Route one comment to its owning business, then reply."""
        print(
            f"Comment from @{event.commenter_username} "
            f"(ID: {event.commenter_id}) on media {event.media_id}"
        )
        print(f"   Text: {event.text}")

        # entry[].id is the only trustworthy tenant signal in the payload. A
        # vendor id supplied in webhook content would be attacker-controlled,
        # so it is never used for routing.
        resolved = instagram_connection_service.resolve(db_session, event.account_id)
        if resolved is None:
            print(f"   Skipping, no active connection for account {event.account_id}")
            return

        policy = resolved.policy
        if resolved.is_fallback:
            print("   Using global fallback credentials (no connection row)")
        else:
            print(f"   Business: {resolved.business_phone_number} (@{resolved.instagram_username})")

        # Our own public reply is itself a comment, and Meta delivers it back
        # to us. Answering it would loop.
        if instagram_event_guard.is_own_reply(db_session, event.account_id, event.comment_id):
            print("   Skipping our own reply")
            return

        if policy.ignore_own_comments and event.commenter_id == event.account_id:
            print("   Skipping own comment")
            return

        if event.parent_comment_id and not policy.reply_to_nested_comments:
            print(f"   Skipping nested comment (parent: {event.parent_comment_id})")
            return

        if not matches_comment(event, policy.comment_match_mode, policy.comment_keywords):
            print("   Skipping, no keyword match")
            return

        if policy.comment_reply_mode == "none":
            print("   Skipping, reply mode is none")
            return

        # Meta retries a webhook it thinks failed, for several minutes. Claim
        # the event before replying so a retry cannot produce a second reply.
        if not instagram_event_guard.claim_event(db_session, event.account_id, event.comment_id):
            print(f"   Skipping duplicate delivery of {event.event_key}")
            return

        try:
            public_text, private_text = instagram_handoff_service.build_reply_texts(
                event, policy
            )
        except ValueError as e:
            print(f"   Could not build reply text: {e}")
            return

        # Queue rather than send inline. The webhook returns fast, and a
        # transient Meta failure is retried by the worker instead of being lost
        # -- the event is already claimed, so an inline failure had no second
        # chance.
        actions = []
        if policy.comment_reply_mode in ("public", "both"):
            actions.append(("public", public_text))
        if policy.comment_reply_mode in ("private", "both"):
            actions.append(("private", private_text))

        queued = instagram_reply_queue.enqueue(
            db_session, event.account_id, event.comment_id, actions
        )
        print(f"   Queued {queued} reply action(s) for delivery")


router = InstagramWebhookRouter().router
