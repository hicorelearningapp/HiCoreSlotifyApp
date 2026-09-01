"""
Reply policy, resolved per Instagram account.

Three layers, cheapest first:

    1. environment defaults          how this deployment behaves
    2. the connection row            handoff number comes from the account
    3. PolicyJson on that connection whatever the vendor customised

Layer 2 is the reason a policy is per-account rather than global: two clinics
sharing one server hand off to their own WhatsApp numbers, and two Instagram
accounts belonging to one business can still be configured apart.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, replace

from config import (
    INSTAGRAM_COMMENT_KEYWORDS,
    INSTAGRAM_COMMENT_MATCH_MODE,
    INSTAGRAM_COMMENT_REPLY_MODE,
    INSTAGRAM_DM_REPLY_TEXT,
    INSTAGRAM_HANDOFF_MODE,
    INSTAGRAM_HANDOFF_PREFILL_TEXT,
    INSTAGRAM_HANDOFF_WA_NUMBER,
    INSTAGRAM_IGNORE_OWN_COMMENTS,
    INSTAGRAM_PRIVATE_REPLY_TEXT,
    INSTAGRAM_PUBLIC_REPLY_TEXT,
    INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
)

logger = logging.getLogger("uvicorn")

REPLY_MODES = {"public", "private", "both", "none"}
MATCH_MODES = {"all", "contains", "exact"}
HANDOFF_MODES = {"healthcare", "ecommerce"}


@dataclass(frozen=True)
class InstagramPolicy:
    comment_reply_mode: str
    comment_match_mode: str
    comment_keywords: tuple
    public_reply_text: str
    private_reply_text: str
    dm_reply_text: str
    reply_to_nested_comments: bool
    ignore_own_comments: bool
    handoff_mode: str
    handoff_wa_number: str
    handoff_prefill_text: str


#: Fields a connection's PolicyJson is allowed to override. Anything else in
#: that JSON is ignored rather than trusted, so a bad write cannot inject
#: arbitrary attributes onto the policy.
POLICY_FIELDS = frozenset(InstagramPolicy.__dataclass_fields__)


def default_policy() -> InstagramPolicy:
    return InstagramPolicy(
        comment_reply_mode=INSTAGRAM_COMMENT_REPLY_MODE,
        comment_match_mode=INSTAGRAM_COMMENT_MATCH_MODE,
        comment_keywords=INSTAGRAM_COMMENT_KEYWORDS,
        public_reply_text=INSTAGRAM_PUBLIC_REPLY_TEXT,
        private_reply_text=INSTAGRAM_PRIVATE_REPLY_TEXT,
        dm_reply_text=INSTAGRAM_DM_REPLY_TEXT,
        reply_to_nested_comments=INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
        ignore_own_comments=INSTAGRAM_IGNORE_OWN_COMMENTS,
        handoff_mode=INSTAGRAM_HANDOFF_MODE,
        handoff_wa_number=INSTAGRAM_HANDOFF_WA_NUMBER,
        handoff_prefill_text=INSTAGRAM_HANDOFF_PREFILL_TEXT,
    )


def resolve_policy(connection) -> InstagramPolicy:
    """Overlay one connection's stored policy on the deployment defaults."""
    policy = default_policy()

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

    # Keywords are a tuple on the policy but arrive as a JSON list.
    if "comment_keywords" in overrides:
        raw = overrides["comment_keywords"]
        if isinstance(raw, (list, tuple)):
            overrides["comment_keywords"] = tuple(
                str(k).strip().casefold() for k in raw if str(k).strip()
            )
        else:
            overrides.pop("comment_keywords")

    for field, allowed in (
        ("comment_reply_mode", REPLY_MODES),
        ("comment_match_mode", MATCH_MODES),
        ("handoff_mode", HANDOFF_MODES),
    ):
        value = overrides.get(field)
        if value is not None and str(value).strip().lower() not in allowed:
            logger.warning(
                "Instagram connection %s has invalid %s=%r; keeping default",
                connection.InstagramAccountId, field, value,
            )
            overrides.pop(field)
        elif value is not None:
            overrides[field] = str(value).strip().lower()

    return replace(policy, **overrides)
