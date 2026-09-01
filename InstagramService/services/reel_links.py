"""
Reel -> WhatsApp link.

One query over two columns, and the only thing that decides where a commenter
is sent. There is no number-plus-prefill assembly behind it: a reel either has
a link seeded for it or it does not, and an unseeded reel gets no reply rather
than a guessed one.

This replaces the catalogue join. The reel is no longer resolved to a product
first -- the product is already baked into the link that was seeded for it.
"""
from __future__ import annotations

import logging

from models.connection import InstagramReelLink

logger = logging.getLogger("uvicorn")


class ReelLinks:
    """Reads the reel link table. Swap the body, keep the signature."""

    def link_for_reel(self, db, reel_id: str) -> str | None:
        """The link seeded for one reel, or None if it has not been seeded.

        Reel ids are globally unique, so this needs nothing but the reel. The
        number inside the returned link is not verified by anything -- seed it
        wrong and the reply renders perfectly on its way to the wrong
        business. That is a proofreading job, not a runtime check.
        """
        if not reel_id:
            return None

        row = (
            db.query(InstagramReelLink)
            .filter(InstagramReelLink.ReelId == str(reel_id))
            .first()
        )
        if row is None:
            logger.info("No WhatsApp link seeded for reel %s", reel_id)
            return None

        return str(row.WaLink or "").strip() or None


reel_links = ReelLinks()
