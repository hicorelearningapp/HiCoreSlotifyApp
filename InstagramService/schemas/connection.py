"""Request and response shapes for the connection admin API."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ConnectionCreate(BaseModel):
    """One vendor, added by hand.

    token_expires_at is a unix timestamp. Meta does not say when a token
    pasted out of the dashboard expires, so leaving it unset assumes the 60
    days a fresh long-lived token gets. It only has to be roughly right --
    the refresh job renews anything inside a 7-day margin, so an optimistic
    guess is still caught before the token actually dies.
    """

    instagram_account_id: str = Field(min_length=1, max_length=64)
    access_token: str = Field(min_length=1)
    instagram_username: str | None = Field(default=None, max_length=150)
    #: A label. Nothing in the comment flow reads it -- the number a customer
    #: reaches is the one inside that reel's seeded link.
    business_phone_number: str | None = Field(default=None, max_length=20)
    token_expires_at: float | None = None


class PolicyUpdate(BaseModel):
    """Every field optional -- only what is sent is overridden."""

    comment_reply_mode: Literal["public", "private", "both", "none"] | None = None
    comment_match_mode: Literal["all", "contains", "exact"] | None = None
    comment_keywords: list[str] | None = None
    public_reply_text: str | None = None
    private_reply_text: str | None = None
    reply_to_nested_comments: bool | None = None
    ignore_own_comments: bool | None = None


class StatusUpdate(BaseModel):
    status: Literal["active", "paused", "revoked"]


class ConnectionOut(BaseModel):
    """What an admin sees. The access token is never included."""

    instagram_account_id: str
    instagram_username: str | None = None
    business_phone_number: str | None = None
    status: str
    token_expires_at: float | None = None
    effective_policy: dict[str, Any]
