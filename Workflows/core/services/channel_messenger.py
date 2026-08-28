from __future__ import annotations

import logging
from core.services.whatsapp_service import whatsapp as WhatsAppService

logger = logging.getLogger("uvicorn")


class ChannelMessenger:
    """Routes an outbound reply to WhatsApp."""

    def __init__(self):
        self.wa = WhatsAppService

    async def send_reply(self, customer_id: str, reply, business_id: str | None = None):
        return await self.wa.send_reply(customer_id, reply)


channel_messenger = ChannelMessenger()

