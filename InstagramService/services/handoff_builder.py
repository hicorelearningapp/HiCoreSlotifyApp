"""
Builds the wa.me link and the two reply texts.

The prefilled text is the only state that survives the jump from Instagram to
WhatsApp, so its exact shape matters: the WhatsApp side parses it back to
recover the product. Keep it in step with parse_order_text() there.

Two shapes:
  healthcare -> a plain greeting, so WhatsApp starts on the normal booking
                flow. Carries no reference, so a booking cannot be traced to
                the comment that produced it -- an accepted tradeoff.
  ecommerce  -> the reel is resolved to a product and the link carries its id
                alongside the name, because two vendors can use the same
                product name but ids cannot collide.
"""
from __future__ import annotations

import logging
import urllib.parse

from services.catalog_client import catalog_client
from services.policy import InstagramPolicy
from utils.comment_parser import CommentEvent
from utils.rules import render_reply

logger = logging.getLogger("uvicorn")


def _digits(value: str) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())


def booking_link(wa_number: str, prefill_text: str = "Hi") -> str:
    return f"https://wa.me/{_digits(wa_number)}?text={urllib.parse.quote(prefill_text)}"


def order_link(wa_number: str, product_name: str, commenter_id: str, product_id=None) -> str:
    if product_id is not None and str(product_id).strip():
        text = f"Hi! I'd like to order {product_name} (id:{product_id}, ref:IG{commenter_id})"
    else:
        text = f"Hi! I'd like to order {product_name} (ref:IG{commenter_id})"
    return f"https://wa.me/{_digits(wa_number)}?text={urllib.parse.quote(text)}"


class HandoffBuilder:
    def __init__(self, catalog=catalog_client):
        self.catalog = catalog

    def build(self, db, event: CommentEvent, policy: InstagramPolicy) -> tuple[str, str]:
        """Return (public_reply_text, private_reply_text) for one comment."""
        if not policy.handoff_wa_number:
            raise ValueError(
                "No WhatsApp number configured for this account -- set the "
                "connection's BusinessPhoneNumber or INSTAGRAM_HANDOFF_WA_NUMBER."
            )

        if policy.handoff_mode == "ecommerce":
            wa_link, product_name = self._ecommerce(db, event, policy)
        else:
            wa_link, product_name = self._healthcare(policy), ""

        public_text = render_reply(
            policy.public_reply_text, event, wa_link=wa_link, product_name=product_name
        )
        private_text = render_reply(
            policy.private_reply_text, event, wa_link=wa_link, product_name=product_name
        )
        return public_text, private_text

    def dm_reply(self, policy: InstagramPolicy) -> str:
        """The text sent for a direct message.

        A DM carries no reel, so there is no product to resolve -- it always
        gets the plain booking link. The template comes from the policy, like
        the two comment replies, so vendors sharing a deployment can word their
        DM differently instead of all sending the deployment default.
        """
        wa_link = self._healthcare(policy)
        return policy.dm_reply_text.replace("{wa_link}", wa_link)

    def _healthcare(self, policy: InstagramPolicy) -> str:
        return booking_link(policy.handoff_wa_number, policy.handoff_prefill_text)

    def _ecommerce(self, db, event: CommentEvent, policy: InstagramPolicy) -> tuple[str, str]:
        product = self.catalog.product_for_reel(db, event.media_id)
        if product is None:
            # An untagged reel is common: the vendor simply has not linked it.
            # Sending the booking link beats sending nothing.
            logger.info(
                "No product tagged with reel %s; falling back to a booking link",
                event.media_id,
            )
            return self._healthcare(policy), ""

        wa_link = order_link(
            policy.handoff_wa_number,
            product.name,
            str(event.commenter_id or ""),
            product_id=product.id,
        )
        return wa_link, product.name


handoff_builder = HandoffBuilder()
