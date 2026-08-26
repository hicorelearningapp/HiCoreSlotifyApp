"""
Sends a workflow reply back on whichever channel the conversation arrived on.

ConversationManager is channel-agnostic: it knows a customer by an opaque id.
Instagram conversations carry an ``ig_`` prefix on both the customer id and the
business id, added by the Instagram webhook router. Before this existed, every
reply went out through WhatsAppService regardless, so an Instagram DM was
answered by asking the WhatsApp Cloud API to message a recipient literally
named ``ig_17841400000000000``.

The prefix is stripped before the id reaches Instagram, which addresses people
by their bare Instagram-scoped id.
"""
from __future__ import annotations

import logging

from core.channels.identity import is_instagram, strip_prefix
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
from core.channels.instagram.services.instagram_service import instagram as InstagramService

logger = logging.getLogger("uvicorn")


class ChannelMessenger:
    """Routes an outbound reply to WhatsApp or Instagram."""

    @staticmethod
    async def send_reply(customer_id: str, reply, business_id: str | None = None):
        if not is_instagram(customer_id):
            return await WhatsAppService.send_reply(customer_id, reply)

        recipient_id = strip_prefix(customer_id)
        access_token = None

        # business_id is the ig_-prefixed professional account. Resolving it
        # gives the token belonging to that vendor rather than a global one.
        if business_id:
            try:
                from backend_app.core.database import db_session
                from core.channels.instagram.services.instagram_connection_service import (
                    instagram_connection_service,
                )

                access_token = instagram_connection_service.get_access_token(
                    db_session, strip_prefix(business_id)
                )
            except Exception as e:
                logger.warning(
                    "Could not resolve Instagram token for %s: %s", business_id, e
                )

        return await InstagramService.send_reply(
            recipient_id, reply, access_token=access_token
        )


channel_messenger = ChannelMessenger()

