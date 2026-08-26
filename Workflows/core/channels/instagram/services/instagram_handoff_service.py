"""
Builds the public reply and private DM sent in response to a comment.

The funnel is: someone comments -> we reply publicly under the comment telling
them to check their DMs -> we DM them a wa.me link that opens WhatsApp with a
prefilled greeting, which drops them into the existing booking flow.

Two modes:
  healthcare -> a plain booking link to that clinic's WhatsApp number
  ecommerce  -> the reel/media is looked up as a product and the link carries
                that product, preserving the original ordering behaviour

The number, the mode, and both templates come from the resolved policy of the
Instagram account that received the comment, so two clinics sharing this server
hand off to their own WhatsApp numbers.
"""
from __future__ import annotations

from industries.ecommerce.services.handoff_service import handoff_service
from core.channels.instagram.utils.instagram_comment_parser import CommentEvent
from core.channels.instagram.utils.instagram_rules import render_reply


class InstagramHandoffService:
    def build_reply_texts(self, event: CommentEvent, policy) -> tuple[str, str]:
        """Return (public_reply_text, private_reply_text) for one comment."""
        if policy.handoff_mode == "ecommerce":
            wa_link, product_name = self._ecommerce_link(event, policy)
        else:
            wa_link, product_name = self._healthcare_link(policy), ""

        public_text = render_reply(
            policy.public_reply_text,
            event,
            wa_link=wa_link,
            product_name=product_name,
        )
        private_text = render_reply(
            policy.private_reply_text,
            event,
            wa_link=wa_link,
            product_name=product_name,
        )
        return public_text, private_text

    @staticmethod
    def _healthcare_link(policy) -> str:
        return handoff_service.generate_booking_link(
            policy.handoff_wa_number,
            policy.handoff_prefill_text,
        )

    @staticmethod
    def _ecommerce_link(event: CommentEvent, policy) -> tuple[str, str]:
        # Imported here so the healthcare path never touches the product tables.
        from backend_app.core.database import db_session
        from industries.ecommerce.services.product_service import product_service

        product = product_service.get_product_by_media_id(db_session, event.media_id)
        product_name = product["name"] if product else "CATALOG"
        wa_link = handoff_service.generate_wa_link(
            policy.handoff_wa_number,
            product_name,
            str(event.commenter_id or ""),
        )
        return wa_link, (product["name"] if product else "")


instagram_handoff_service = InstagramHandoffService()
