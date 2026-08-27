"""
Comment matching and reply templating.

Ported from the standalone Instagram Message Automation app's rules.py.
Keeps the same match modes (all / contains / exact) and the same safe
template rendering, so a missing placeholder renders empty instead of
raising KeyError mid-webhook.
"""
from __future__ import annotations

from utils.comment_parser import CommentEvent


class _SafeTemplateValues(dict):
    def __missing__(self, key: str) -> str:
        return ""


def matches_comment(event: CommentEvent, match_mode: str, keywords: tuple[str, ...]) -> bool:
    """True when the comment text satisfies the configured keyword rule."""
    if match_mode == "all":
        return True

    text = " ".join(event.text.casefold().split())
    if match_mode == "exact":
        return text in keywords
    return any(keyword in text for keyword in keywords)


def render_reply(template: str, event: CommentEvent, **extra: str) -> str:
    """Render a reply template. Unknown placeholders become empty strings."""
    values = _SafeTemplateValues(
        username=event.commenter_username or "there",
        comment=event.text,
        comment_id=event.comment_id,
        media_id=event.media_id or "",
        media_type=event.media_product_type or "",
        **extra,
    )
    rendered = template.format_map(values).strip()
    if not rendered:
        raise ValueError("Reply template rendered to an empty message")
    return rendered
