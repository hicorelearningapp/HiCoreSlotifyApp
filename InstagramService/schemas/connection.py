"""Request and response shapes for the connection admin API."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ConnectionCreate(BaseModel):
    instagram_account_id: str = Field(min_length=1, max_length=64)
    business_phone_number: str = Field(min_length=1, max_length=20)
    access_token: str = Field(min_length=1)
    instagram_username: str | None = Field(default=None, max_length=150)


class PolicyUpdate(BaseModel):
    """Every field optional -- only what is sent is overridden."""

    comment_reply_mode: Literal["public", "private", "both", "none"] | None = None
    comment_match_mode: Literal["all", "contains", "exact"] | None = None
    comment_keywords: list[str] | None = None
    public_reply_text: str | None = None
    private_reply_text: str | None = None
    dm_reply_text: str | None = None
    reply_to_nested_comments: bool | None = None
    ignore_own_comments: bool | None = None
    handoff_mode: Literal["healthcare", "ecommerce"] | None = None
    handoff_wa_number: str | None = None
    handoff_prefill_text: str | None = None


class StatusUpdate(BaseModel):
    status: Literal["active", "paused", "revoked"]


class ConnectionOut(BaseModel):
    """What an admin sees. The access token is never included."""

    instagram_account_id: str
    business_phone_number: str
    instagram_username: str | None = None
    status: str
    token_expires_at: float | None = None
    scopes: str | None = None
    account_type: str | None = None
    effective_policy: dict[str, Any]
