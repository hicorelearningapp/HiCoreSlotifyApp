"""Request and response shapes for the reel resolve API."""
from __future__ import annotations

from pydantic import BaseModel, Field


class ReelResolveRequest(BaseModel):
    """One reel URL, however the vendor happened to paste it.

    Every shape is accepted -- /p/, /reel/, /reels/, a bare shortcode, a share
    link, with or without scheme, www or tracking parameters. Share links are
    followed to the reel they point at before anything else happens.
    """

    url: str = Field(min_length=1, max_length=2048)


class ReelResolveOut(BaseModel):
    """What Backend stores against the product.

    media_id is the field that matters: it is what Meta puts in every comment
    webhook, so it is the only value the reply path can match on. The rest is
    for a human reading the row later.
    """

    media_id: str
    permalink: str
    instagram_account_id: str
    instagram_username: str | None = None
    media_product_type: str | None = None
