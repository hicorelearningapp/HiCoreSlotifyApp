"""
Instagram Comment Event Parser.

Adapted from the standalone Instagram Message Automation app's normalizer.py + domain.py.
Handles both Meta comment webhook payload layouts (direct field and changes array).
"""
from __future__ import annotations
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class CommentEvent:
    """Represents a single Instagram comment webhook event."""
    account_id: str
    comment_id: str
    text: str
    commenter_id: str | None = None
    commenter_username: str | None = None
    media_id: str | None = None
    media_product_type: str | None = None
    parent_comment_id: str | None = None
    event_time: int | None = None
    source_variant: str = "unknown"

    @property
    def event_key(self) -> str:
        return f"{self.account_id}:{self.comment_id}"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "CommentEvent":
        return cls(**value)


COMMENT_FIELDS = {"comments"}


def _values(value: Any):
    """Yield dicts from a value that may be a dict or list of dicts."""
    if isinstance(value, dict):
        yield value
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                yield item


def _candidate_changes(entry: dict[str, Any]):
    """
    Yield (field, value_dict, source_variant) from both Meta payload layouts:
    - Layout 1 (direct): entry has "field" and "value" at the top level
    - Layout 2 (changes array): entry has "changes" list with {field, value} dicts
    """
    # Layout 1: Direct field
    direct_field = entry.get("field")
    if isinstance(direct_field, str):
        for value in _values(entry.get("value")):
            yield direct_field, value, "direct"

    # Layout 2: Changes array
    changes = entry.get("changes")
    if isinstance(changes, list):
        for change in changes:
            if not isinstance(change, dict):
                continue
            field = change.get("field")
            if not isinstance(field, str):
                continue
            for value in _values(change.get("value")):
                yield field, value, "changes"


def extract_comment_events(payload: dict[str, Any]) -> list[CommentEvent]:
    """
    Parse a Meta Instagram webhook payload and return a list of CommentEvent objects.
    Handles both known Meta payload layouts for comment webhooks.
    """
    if payload.get("object") != "instagram":
        return []

    results: list[CommentEvent] = []
    entries = payload.get("entry")
    if not isinstance(entries, list):
        return results

    for entry in entries:
        if not isinstance(entry, dict):
            continue

        entry_account_id = str(entry.get("id") or "").strip()
        event_time = entry.get("time")
        if not isinstance(event_time, int):
            event_time = None

        for field, value, source_variant in _candidate_changes(entry):
            if field not in COMMENT_FIELDS:
                continue

            comment_id = str(value.get("id") or value.get("comment_id") or "").strip()
            account_id = entry_account_id or str(value.get("recipient_id") or "").strip()
            if not comment_id or not account_id:
                continue

            from_data = value.get("from") if isinstance(value.get("from"), dict) else {}
            media = value.get("media") if isinstance(value.get("media"), dict) else {}
            text_value = value.get("text", value.get("message", ""))
            text = str(text_value or "").strip()

            commenter_id = str(from_data.get("id") or value.get("sender_id") or "").strip() or None
            username = str(from_data.get("username") or value.get("username") or "").strip() or None
            media_id = str(media.get("id") or value.get("media_id") or "").strip() or None
            media_type = str(
                media.get("media_product_type") or value.get("media_product_type") or ""
            ).strip() or None
            parent_id = str(
                value.get("parent_id") or value.get("parent_comment_id") or ""
            ).strip() or None

            results.append(
                CommentEvent(
                    account_id=account_id,
                    comment_id=comment_id,
                    text=text,
                    commenter_id=commenter_id,
                    commenter_username=username,
                    media_id=media_id,
                    media_product_type=media_type,
                    parent_comment_id=parent_id,
                    event_time=event_time,
                    source_variant=source_variant,
                )
            )

    return results
