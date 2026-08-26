from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, SecretStr


class InstagramPolicyInput(BaseModel):
    """Per-vendor overrides. Anything left unset falls back to config defaults."""

    model_config = ConfigDict(extra="forbid")

    comment_reply_mode: Optional[str] = None
    comment_match_mode: Optional[str] = None
    comment_keywords: Optional[List[str]] = None
    public_reply_text: Optional[str] = None
    private_reply_text: Optional[str] = None
    reply_to_nested_comments: Optional[bool] = None
    ignore_own_comments: Optional[bool] = None
    handoff_mode: Optional[str] = None
    handoff_wa_number: Optional[str] = None
    handoff_prefill_text: Optional[str] = None


class InstagramConnectionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    instagram_account_id: str = Field(min_length=1, max_length=64)
    business_phone_number: str = Field(min_length=1, max_length=20)
    # SecretStr keeps the token out of tracebacks and log lines.
    access_token: SecretStr
    instagram_username: Optional[str] = None
    policy: Optional[InstagramPolicyInput] = None


class InstagramConnectionResponse(BaseModel):
    """Never carries the access token, encrypted or otherwise."""

    id: str
    instagram_account_id: str
    business_phone_number: str
    instagram_username: Optional[str] = None
    status: str
    policy: dict
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
