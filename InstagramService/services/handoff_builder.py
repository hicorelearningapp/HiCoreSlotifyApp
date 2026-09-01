"""
Turns one comment into the two reply texts.

The link is no longer built here. It is looked up whole from
instagram_reel_links, which removed the catalogue join, the
healthcare/ecommerce split, and the number-plus-prefill assembly. What a
commenter receives is exactly what was seeded against that reel.

Two things depend on the stored link being fully percent-encoded:

  render_reply() runs str.format_map over the template, so a raw `{` in a
  link would be read as a placeholder and blow up mid-webhook. Encoded,
  there are none.

  the commenter id is substituted into %7Bref%7D rather than {ref}, because
  that is what encoding turns the placeholder into.

The prefill text is still the only state that survives the jump to WhatsApp,
and the WhatsApp side parses it back with a regex -- see parse_order_text()
in ConversationManager. Reword a seeded link and that parse is what breaks.
"""
from __future__ import annotations

import logging

from services.policy import InstagramPolicy
from services.reel_links import reel_links
from utils.comment_parser import CommentEvent
from utils.rules import render_reply

logger = logging.getLogger("uvicorn")

#: What `{ref}` becomes once the prefill text is URL-encoded.
REF_PLACEHOLDER = "%7Bref%7D"


class HandoffBuilder:
    def __init__(self, links=reel_links):
        self.links = links

    def build(self, db, event: CommentEvent, policy: InstagramPolicy) -> tuple[str, str]:
        """Return (public_reply_text, private_reply_text) for one comment."""
        wa_link = self.links.link_for_reel(db, event.media_id)
        if not wa_link:
            # Raised rather than defaulted: a guessed link sends the customer
            # to the wrong conversation, which is worse than no reply.
            raise ValueError(
                f"no WhatsApp link seeded for reel {event.media_id!r}"
            )

        wa_link = wa_link.replace(REF_PLACEHOLDER, str(event.commenter_id or ""))

        public_text = render_reply(policy.public_reply_text, event, wa_link=wa_link)
        private_text = render_reply(policy.private_reply_text, event, wa_link=wa_link)
        return public_text, private_text


handoff_builder = HandoffBuilder()
