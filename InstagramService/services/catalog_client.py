"""
The only thing this service needs from the rest of the platform.

A reel is joined to a product by `products.reel_id`, and that is the whole
dependency -- five columns of one table. Everything else the comment flow uses
(which account belongs to which business, which WhatsApp number to hand off to,
which policy applies) lives in this service's own tables.

It is isolated behind one interface on purpose. Today it reads the shared
SQLite file directly, because all three services already open it. When the
catalogue moves somewhere this service cannot reach, swap the implementation
for an HTTP call to Backend and nothing else changes.

A lookup failure is never fatal: the handoff falls back to a plain booking link
rather than dropping the reply.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy import text

logger = logging.getLogger("uvicorn")


@dataclass(frozen=True)
class CatalogProduct:
    id: int
    name: str
    price: float


class CatalogClient:
    """Reads the catalogue. Swap the body, keep the signature."""

    def product_for_reel(self, db, media_id: str) -> CatalogProduct | None:
        """The active product tagged with this reel id, if there is one."""
        if not media_id:
            return None

        try:
            row = db.execute(
                text(
                    "SELECT id, name, price FROM products "
                    "WHERE reel_id = :reel_id AND active = 1 LIMIT 1"
                ),
                {"reel_id": str(media_id)},
            ).first()
        except Exception as e:
            # The catalogue is another service's table. If it is missing or its
            # shape changed, that is not a reason to drop the customer's reply.
            logger.warning("Catalogue lookup failed for reel %s: %s", media_id, e)
            return None

        if row is None:
            return None

        return CatalogProduct(
            id=int(row[0]),
            name=str(row[1] or ""),
            price=float(row[2] or 0.0),
        )


catalog_client = CatalogClient()
