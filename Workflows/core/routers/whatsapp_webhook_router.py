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
            from core.services.whatsapp_service import request_payloads
            
            # Initialize a new list for this specific request context
            request_payloads.set([])
            
            message = await ParseManager.ParseWhatsapp(request)
            if not message:
                return {"status": "ignored"}
            await ConversationManager().process(message.PhoneNumber, message)
            
            bot_replies = request_payloads.get()
            
            return {"status": "ok", "bot_replies": bot_replies}
                
        except Exception as ex:
            print(f"Error processing webhook: {ex}")
            return {"status": "error", "message": str(ex)}

router = WebhookRouter().router
