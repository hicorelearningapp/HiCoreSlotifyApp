"""
Turns one comment into the two reply texts.

The link is neither built here nor stored here. It is fetched whole from
Backend for the reel the comment sits under -- number and prefill text already
inside it -- which is what removed the catalogue join, the
healthcare/ecommerce split, and the number-plus-prefill assembly.

render_reply() runs str.format_map over the template, so a raw `{` inside a
link would be read as a placeholder and blow up mid-webhook. Backend
percent-encodes the prefill text, so there are none; if that ever stops being
true, this is where it breaks.

The prefill text is the only state that survives the jump to WhatsApp, and the
WhatsApp side parses it back to recover the product. Its shape is Backend's to
decide -- this service passes the link through untouched.
"""
from __future__ import annotations

import logging

from services.policy import InstagramPolicy
from services.reel_links import reel_links
from utils.comment_parser import CommentEvent
from utils.rules import render_reply

logger = logging.getLogger("uvicorn")


class HandoffBuilder:
    def __init__(self, links=reel_links):
        self.links = links

    def build(self, db, event: CommentEvent, policy: InstagramPolicy) -> tuple[str, str]:
        """Return (public_reply_text, private_reply_text) for one comment."""
        wa_link = self.links.link_for_reel(db, event.media_id)
        if not wa_link:
            # Raised rather than defaulted: a guessed link sends the customer
            # to the wrong conversation, which is worse than no reply.
            raise ValueError(f"no WhatsApp link for reel {event.media_id!r}")

        public_text = render_reply(policy.public_reply_text, event, wa_link=wa_link)
        private_text = render_reply(policy.private_reply_text, event, wa_link=wa_link)
        return public_text, private_text


handoff_builder = HandoffBuilder()
