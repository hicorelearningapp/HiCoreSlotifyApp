"""
Reply policy, resolved per Instagram account.

Three layers, cheapest first:

    1. environment defaults          how this deployment behaves
    2. PolicyJson on the connection  whatever the vendor customised

Where a commenter is sent is no longer part of this. That moved to
instagram_reel_links, one link per reel, so the policy now only decides how
the reply is worded and which comments earn one.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, replace

from config import (
    INSTAGRAM_COMMENT_KEYWORDS,
    INSTAGRAM_COMMENT_MATCH_MODE,
    INSTAGRAM_COMMENT_REPLY_MODE,
    INSTAGRAM_IGNORE_OWN_COMMENTS,
    INSTAGRAM_PRIVATE_REPLY_TEXT,
    INSTAGRAM_PUBLIC_REPLY_TEXT,
    INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
)

logger = logging.getLogger("uvicorn")

REPLY_MODES = {"public", "private", "both", "none"}
MATCH_MODES = {"all", "contains", "exact"}


@dataclass(frozen=True)
class InstagramPolicy:
    comment_reply_mode: str
    comment_match_mode: str
    comment_keywords: tuple
    public_reply_text: str
    private_reply_text: str
    reply_to_nested_comments: bool
    ignore_own_comments: bool


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
        reply_to_nested_comments=INSTAGRAM_REPLY_TO_NESTED_COMMENTS,
        ignore_own_comments=INSTAGRAM_IGNORE_OWN_COMMENTS,
    )


def resolve_policy(connection) -> InstagramPolicy:
    """Overlay one connection's stored policy on the deployment defaults."""
    policy = default_policy()

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
