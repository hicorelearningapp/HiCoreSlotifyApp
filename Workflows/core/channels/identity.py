"""
Channel tagging for conversation ids.

The conversation engine addresses a person by an opaque id and is otherwise
channel-agnostic. Instagram ids are tagged with an ``ig_`` prefix at the
webhook boundary so the channel travels with the id, and the tag is stripped
again before the id goes back to Meta, which addresses people by their bare
Instagram-scoped id.

These helpers deliberately import nothing else: ChannelMessenger imports the
channel services, so the services cannot import the helpers back from it
without a cycle.
"""
from __future__ import annotations

INSTAGRAM_PREFIX = "ig_"


def is_instagram(value: str | None) -> bool:
    """True when an id was tagged at the Instagram webhook boundary."""
    return bool(value) and str(value).startswith(INSTAGRAM_PREFIX)


def to_instagram_id(value: str | None) -> str:
    """Tag a bare Instagram-scoped id for use inside the conversation engine."""
    value = str(value or "")
    return value if is_instagram(value) else f"{INSTAGRAM_PREFIX}{value}"


def strip_prefix(value: str | None) -> str:
    """
    Return the bare id Instagram expects.

    Only a leading tag is removed. Using str.replace() here would strip the
    sequence from anywhere in the id, corrupting any value that happens to
    contain it.
    """
    value = str(value or "")
    return value[len(INSTAGRAM_PREFIX):] if value.startswith(INSTAGRAM_PREFIX) else value
