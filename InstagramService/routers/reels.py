"""
Resolve a pasted reel URL to its media id.

Backend calls this once, when a vendor saves a product, and stores the media
id it gets back. Doing it then rather than per comment means the reply path
stays a single lookup, and a vendor who pastes the wrong thing is told so
while they are still looking at the form -- rather than discovering it as
silence under a reel weeks later.

The endpoint holds no state. It reads Instagram, answers, and forgets; the
only durable record of the reel is the row Backend writes.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from routers.connections import require_admin
from schemas.reel import ReelResolveOut, ReelResolveRequest
from services.reel_resolver import MediaLookupError, ReelResolveError, reel_resolver

logger = logging.getLogger("uvicorn")


class ReelsRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/integrations/instagram/reels", tags=["reels"])
        self._add_routes()

    def _add_routes(self):
        admin = [Depends(require_admin)]
        self.router.add_api_route(
            "/resolve", self.resolve, methods=["POST"],
            response_model=ReelResolveOut, dependencies=admin,
        )

    def resolve(self, payload: ReelResolveRequest, db: Session = Depends(get_db)):
        """Turn a reel URL into the media id its comments will arrive with.

        404 rather than 200-with-null when no connected account owns the reel:
        the caller is asking a question with a right answer, and "not yours"
        is a refusal the vendor needs to see, not an empty result.
        """
        try:
            resolved = reel_resolver.resolve(db, payload.url)
        except ReelResolveError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except MediaLookupError as e:
            # Instagram was unreachable or refused us. That is not the
            # vendor's fault and not a permanent answer, so it must not read
            # as "this reel does not exist".
            logger.error("Instagram refused a reel lookup: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Instagram could not be reached: {e}",
            )

        if resolved is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="That reel is not on any connected Instagram account.",
            )

        logger.info(
            "Resolved reel %s to media %s on @%s",
            payload.url, resolved.media_id, resolved.instagram_username or "?",
        )
        return ReelResolveOut(
            media_id=resolved.media_id,
            permalink=resolved.permalink,
            instagram_account_id=resolved.instagram_account_id,
            instagram_username=resolved.instagram_username,
            media_product_type=resolved.media_product_type,
        )


router = ReelsRouter().router
