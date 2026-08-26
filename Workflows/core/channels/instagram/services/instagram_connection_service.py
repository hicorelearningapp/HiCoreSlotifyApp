"""
Resolves an Instagram professional account to the business that owns it.

Meta puts the receiving account in ``entry[].id``. That is the only tenant
signal an Instagram webhook carries -- a vendor id in the payload body would be
attacker-controlled, so it is never used for routing. This service turns that
account id into the BusinessPhoneNumber the rest of the platform already keys
on, plus the token and policy for that vendor.

Policy resolution is layered: values in the connection's PolicyJson win, and
anything absent falls back to the global config defaults. A vendor that has not
customised anything behaves exactly like the Phase 1 single-account setup.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, replace

from sqlalchemy.exc import IntegrityError

from config import (
    INSTAGRAM_COMMENT_REPLY_MODE,
    INSTAGRAM_COMMENT_MATCH_MODE,
    INSTAGRAM_COMMENT_KEYWORDS,
    INSTAGRAM_PUBLIC_REPLY_TEXT,
    INSTAGRAM_PRIVATE_REPLY_TEXT,
    INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
    INSTAGRAM_IGNORE_OWN_COMMENTS,
    INSTAGRAM_HANDOFF_MODE,
    INSTAGRAM_HANDOFF_WA_NUMBER,
    INSTAGRAM_HANDOFF_PREFILL_TEXT,
    INSTAGRAM_ACCESS_TOKEN,
)
from core.channels.instagram.models.instagram_connection import InstagramConnection
from core.channels.instagram.services.instagram_token_cipher import instagram_token_cipher, TokenCipherError

logger = logging.getLogger("uvicorn")

VALID_REPLY_MODES = ("public", "private", "both", "none")
VALID_MATCH_MODES = ("all", "contains", "exact")
VALID_HANDOFF_MODES = ("healthcare", "ecommerce")

POLICY_FIELDS = (
    "comment_reply_mode",
    "comment_match_mode",
    "comment_keywords",
    "public_reply_text",
    "private_reply_text",
    "reply_to_nested_comments",
    "ignore_own_comments",
    "handoff_mode",
    "handoff_wa_number",
    "handoff_prefill_text",
)


@dataclass(frozen=True)
class InstagramPolicy:
    comment_reply_mode: str
    comment_match_mode: str
    comment_keywords: tuple
    public_reply_text: str
    private_reply_text: str
    reply_to_nested_comments: bool
    ignore_own_comments: bool
    handoff_mode: str
    handoff_wa_number: str
    handoff_prefill_text: str


@dataclass(frozen=True)
class ResolvedConnection:
    """One webhook's routing result: who owns the account, and how to answer."""

    instagram_account_id: str
    business_phone_number: str
    access_token: str
    policy: InstagramPolicy
    connection_id: str | None = None
    instagram_username: str | None = None
    is_fallback: bool = False


def _default_policy() -> InstagramPolicy:
    return InstagramPolicy(
        comment_reply_mode=INSTAGRAM_COMMENT_REPLY_MODE,
        comment_match_mode=INSTAGRAM_COMMENT_MATCH_MODE,
        comment_keywords=tuple(INSTAGRAM_COMMENT_KEYWORDS),
        public_reply_text=INSTAGRAM_PUBLIC_REPLY_TEXT,
        private_reply_text=INSTAGRAM_PRIVATE_REPLY_TEXT,
        reply_to_nested_comments=INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
        ignore_own_comments=INSTAGRAM_IGNORE_OWN_COMMENTS,
        handoff_mode=INSTAGRAM_HANDOFF_MODE,
        handoff_wa_number=INSTAGRAM_HANDOFF_WA_NUMBER,
        handoff_prefill_text=INSTAGRAM_HANDOFF_PREFILL_TEXT,
    )


def validate_policy_values(values: dict) -> dict:
    """Reject unknown keys and invalid enum values before they reach the DB."""
    unknown = set(values) - set(POLICY_FIELDS)
    if unknown:
        raise ValueError(f"Unknown policy fields: {', '.join(sorted(unknown))}")

    cleaned = dict(values)
    if "comment_reply_mode" in cleaned:
        mode = str(cleaned["comment_reply_mode"]).strip().lower()
        if mode not in VALID_REPLY_MODES:
            raise ValueError(f"comment_reply_mode must be one of {VALID_REPLY_MODES}")
        cleaned["comment_reply_mode"] = mode
    if "comment_match_mode" in cleaned:
        mode = str(cleaned["comment_match_mode"]).strip().lower()
        if mode not in VALID_MATCH_MODES:
            raise ValueError(f"comment_match_mode must be one of {VALID_MATCH_MODES}")
        cleaned["comment_match_mode"] = mode
    if "handoff_mode" in cleaned:
        mode = str(cleaned["handoff_mode"]).strip().lower()
        if mode not in VALID_HANDOFF_MODES:
            raise ValueError(f"handoff_mode must be one of {VALID_HANDOFF_MODES}")
        cleaned["handoff_mode"] = mode
    if "comment_keywords" in cleaned and cleaned["comment_keywords"] is not None:
        cleaned["comment_keywords"] = [
            str(k).strip().casefold() for k in cleaned["comment_keywords"] if str(k).strip()
        ]

    match_mode = cleaned.get("comment_match_mode")
    if match_mode in ("contains", "exact") and not cleaned.get("comment_keywords"):
        raise ValueError(
            "comment_keywords is required when comment_match_mode is contains or exact"
        )
    return cleaned


class InstagramConnectionService:

    # ── lookup ────────────────────────────────────────────────────────────

    @staticmethod
    def get_by_account_id(db, instagram_account_id: str):
        if not instagram_account_id:
            return None
        return (
            db.query(InstagramConnection)
            .filter(InstagramConnection.InstagramAccountId == str(instagram_account_id))
            .first()
        )

    @staticmethod
    def get_by_business(db, business_phone_number: str):
        return (
            db.query(InstagramConnection)
            .filter(InstagramConnection.BusinessPhoneNumber == business_phone_number)
            .all()
        )

    @staticmethod
    def list_all(db, status: str | None = None):
        query = db.query(InstagramConnection)
        if status:
            query = query.filter(InstagramConnection.Status == status)
        return query.order_by(InstagramConnection.CreatedAt).all()

    # ── policy ────────────────────────────────────────────────────────────

    @classmethod
    def resolve_policy(cls, connection) -> InstagramPolicy:
        """Overlay a connection's stored policy on the global defaults."""
        policy = _default_policy()

        # Each clinic hands off to its own WhatsApp number. That is the point of
        # the join: without an explicit override the booking link points at the
        # business this Instagram account belongs to, not a global number.
        if connection is not None and connection.BusinessPhoneNumber:
            policy = replace(policy, handoff_wa_number=connection.BusinessPhoneNumber)

        if connection is None or not connection.PolicyJson:
            return policy

        try:
            stored = json.loads(connection.PolicyJson)
        except (ValueError, TypeError):
            logger.warning(
                "Instagram connection %s has unreadable PolicyJson; using defaults",
                connection.InstagramAccountId,
            )
            return policy
        if not isinstance(stored, dict):
            return policy

        overrides = {
            key: value
            for key, value in stored.items()
            if key in POLICY_FIELDS and value is not None
        }
        if "comment_keywords" in overrides:
            overrides["comment_keywords"] = tuple(overrides["comment_keywords"])
        return replace(policy, **overrides)

    # ── routing ───────────────────────────────────────────────────────────

    @classmethod
    def resolve(cls, db, instagram_account_id: str) -> ResolvedConnection | None:
        """Resolve a webhook's account id to its owning business.

        Falls back to the global INSTAGRAM_ACCESS_TOKEN when no connection row
        exists, which keeps a Phase 1 single-account install working unchanged.
        Returns None when neither is available -- the event is then unroutable.
        """
        connection = cls.get_by_account_id(db, instagram_account_id)

        if connection is None:
            if not INSTAGRAM_ACCESS_TOKEN:
                return None
            return ResolvedConnection(
                instagram_account_id=str(instagram_account_id),
                business_phone_number=INSTAGRAM_HANDOFF_WA_NUMBER,
                access_token=INSTAGRAM_ACCESS_TOKEN,
                policy=_default_policy(),
                is_fallback=True,
            )

        if connection.Status != "active":
            logger.info(
                "Instagram account %s is connected but %s",
                instagram_account_id,
                connection.Status,
            )
            return None

        try:
            access_token = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as exc:
            logger.error(
                "Instagram account %s token unavailable: %s", instagram_account_id, exc
            )
            return None

        return ResolvedConnection(
            instagram_account_id=connection.InstagramAccountId,
            business_phone_number=connection.BusinessPhoneNumber,
            access_token=access_token,
            policy=cls.resolve_policy(connection),
            connection_id=connection.Id,
            instagram_username=connection.InstagramUsername,
        )

    @classmethod
    def get_access_token(cls, db, instagram_account_id: str) -> str | None:
        """Token for one account, for the DM path. Falls back to the global one."""
        connection = cls.get_by_account_id(db, instagram_account_id)
        if connection is None or connection.Status != "active":
            return INSTAGRAM_ACCESS_TOKEN or None
        try:
            return instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as exc:
            logger.error(
                "Instagram account %s token unavailable: %s", instagram_account_id, exc
            )
            return None

    # ── writes ────────────────────────────────────────────────────────────

    @classmethod
    def connect(
        cls,
        db,
        instagram_account_id: str,
        business_phone_number: str,
        access_token: str,
        instagram_username: str | None = None,
        policy: dict | None = None,
    ) -> InstagramConnection:
        """Create or update the connection for one Instagram account."""
        instagram_account_id = str(instagram_account_id or "").strip()
        business_phone_number = str(business_phone_number or "").strip()
        if not instagram_account_id:
            raise ValueError("instagram_account_id must not be empty")
        if not business_phone_number:
            raise ValueError("business_phone_number must not be empty")

        cleaned_policy = validate_policy_values(policy) if policy else None
        encrypted = instagram_token_cipher.encrypt(access_token)

        connection = cls.get_by_account_id(db, instagram_account_id)
        if connection is None:
            connection = InstagramConnection(
                InstagramAccountId=instagram_account_id,
                BusinessPhoneNumber=business_phone_number,
                InstagramUsername=instagram_username,
                AccessTokenEncrypted=encrypted,
                Status="active",
                PolicyJson=json.dumps(cleaned_policy) if cleaned_policy else None,
            )
            db.add(connection)
        else:
            connection.BusinessPhoneNumber = business_phone_number
            connection.AccessTokenEncrypted = encrypted
            connection.Status = "active"
            if instagram_username is not None:
                connection.InstagramUsername = instagram_username
            if cleaned_policy is not None:
                connection.PolicyJson = json.dumps(cleaned_policy)

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ValueError(
                f"Instagram account {instagram_account_id} is already connected"
            ) from exc
        db.refresh(connection)
        return connection

    @classmethod
    def update_policy(cls, db, instagram_account_id: str, changes: dict):
        connection = cls.get_by_account_id(db, instagram_account_id)
        if connection is None:
            return None

        current = {}
        if connection.PolicyJson:
            try:
                loaded = json.loads(connection.PolicyJson)
                if isinstance(loaded, dict):
                    current = loaded
            except (ValueError, TypeError):
                current = {}

        merged = {**current, **{k: v for k, v in changes.items() if v is not None}}
        connection.PolicyJson = json.dumps(validate_policy_values(merged))
        db.commit()
        db.refresh(connection)
        return connection

    @classmethod
    def set_status(cls, db, instagram_account_id: str, status: str):
        if status not in ("active", "disconnected"):
            raise ValueError("status must be active or disconnected")
        connection = cls.get_by_account_id(db, instagram_account_id)
        if connection is None:
            return None
        connection.Status = status
        db.commit()
        db.refresh(connection)
        return connection

    @classmethod
    def disconnect(cls, db, instagram_account_id: str) -> bool:
        """Erase the stored token and mark the connection disconnected."""
        connection = cls.get_by_account_id(db, instagram_account_id)
        if connection is None:
            return False
        db.delete(connection)
        db.commit()
        return True


instagram_connection_service = InstagramConnectionService()
