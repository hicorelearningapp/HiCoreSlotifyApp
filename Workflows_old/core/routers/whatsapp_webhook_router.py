from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse

from config import VERIFY_TOKEN
from core.conversation.ConversationManager import ConversationManager
from core.services.whatsapp_service import whatsapp as WhatsAppService
from core.utils.whatsapp_parser import ParseManager


class WebhookRouter:
    def __init__(self):
        self.router = APIRouter(tags=["webhook"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("/webhook", self.verify, methods=["GET"])
        self.router.add_api_route("/webhook", self.receive_message, methods=["POST"])

    async def verify(self, request: Request):
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")

        if mode == "subscribe" and token == VERIFY_TOKEN:
            return PlainTextResponse(challenge)

        return PlainTextResponse("Verification Failed", status_code=403)

    async def receive_message(self, request: Request):
        try:
            # Import request_payloads context variable locally to avoid circular import issues
            from core.services.whatsapp_service import request_payloads
            
            # Initialize a new empty list for this specific HTTP request context to track all outgoing messages
            request_payloads.set([])
            
            # Parse the incoming WhatsApp webhook payload from the HTTP request into a structured Message object
            message = await ParseManager.ParseWhatsapp(request)
            
            # If the payload wasn't a valid message (e.g. status update or unsupported type), ignore it
            if not message:
                return {"status": "ignored"}
                
            # Pass the parsed message to the ConversationManager to trigger the state machine / workflow logic
            await ConversationManager().process(message.PhoneNumber, message)
            
            # Retrieve all the outgoing payloads that the ConversationManager queued up to send during this request
            bot_replies = request_payloads.get()
            
            # Return HTTP 200 OK along with the captured bot replies (used by the Simulator UI to render responses)
            return {"status": "ok", "bot_replies": bot_replies}
                
        except Exception as ex:
            # If any unhandled exception occurs, log it to the console
            print(f"Error processing webhook: {ex}")
            # Return a 200 OK with an error status so WhatsApp doesn't keep retrying the failed webhook
            return {"status": "error", "message": str(ex)}

router = WebhookRouter().router
