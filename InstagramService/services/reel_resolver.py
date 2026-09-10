"""
A reel URL -> the media id the webhook will carry.

The missing half of the handoff. Backend stores what a vendor pasted; Meta's
webhook carries a numeric media id; nothing computes one from the other,
because Instagram publishes no mapping between a shortcode and a media id.
The only place the pair exists is the account's own media list, and reading
that needs the vendor's access token -- which is why this lives here and not
in Backend, where no token exists.

Called once, when a vendor saves a product. Nothing in the comment path
touches it: by then Backend already holds the media id, and the reply flow
asks for it directly.

Which vendor owns the reel is deliberately not asked for. A reel belongs to
exactly one account, so the connected accounts are searched and whichever owns
it answers -- and a reel no connected account owns is refused, which is an
ownership check for free. That also sidesteps needing a business-to-account
mapping, which does not exist yet.

The Graph call is written out here rather than reusing the service's other
Instagram client, because that client is shaped differently in the deployed
tree than in this repo. Fifteen lines of duplication buys one version of this
file that runs in both, instead of two that drift apart.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import requests

from config import (
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_HTTP_TIMEOUT,
)
from services.tenant_resolver import tenant_resolver
from utils.reel_urls import canonicalise, extract_shortcode

logger = logging.getLogger("uvicorn")

#: How long one account's media list is reused. Only ever spans a burst of
#: saves; a miss ignores it entirely and refetches, so a reel posted seconds
#: ago still resolves.
_MEDIA_CACHE_SECONDS = 60.0


class ReelResolveError(Exception):
    """The URL could not be read as a reel at all. The caller sent nonsense."""


class MediaLookupError(Exception):
    """Instagram could not be asked. Says nothing about whether the reel exists."""


@dataclass(frozen=True)
class ResolvedReel:
    media_id: str
    permalink: str
    instagram_account_id: str
    instagram_username: str | None
    media_product_type: str | None


def _list_media(access_token: str, max_pages: int = 10) -> list[dict]:
    """Every media on the account this token belongs to: id and permalink.

    Deliberately unfiltered by media_product_type. A reel posted to the feed
    comes back as FEED rather than REELS -- all five of the demo reels do --
    so filtering for "reels" would drop exactly the media this exists to find.

    Paginated: Meta answers a page at a time behind a cursor. The page cap
    stops an account with thousands of posts turning one resolve into an
    unbounded walk; a reel older than the cap fails to resolve, which is a
    clear answer rather than a slow one.
    """
    items: list[dict] = []
    url = f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/me/media"
    params = {"fields": "id,permalink,media_product_type", "limit": 100}
    headers = {"Authorization": f"Bearer {access_token}"}

    for _ in range(max_pages):
        try:
            response = requests.get(
                url, params=params, headers=headers, timeout=INSTAGRAM_HTTP_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            raise MediaLookupError(f"Instagram request failed: {e}") from e

        if response.status_code >= 300:
            raise MediaLookupError(f"Instagram returned HTTP {response.status_code}")

        try:
            payload = response.json()
        except ValueError as e:
            raise MediaLookupError("Instagram returned a non-JSON body") from e

        data = payload.get("data")
        if isinstance(data, list):
            items.extend(item for item in data if isinstance(item, dict))

        cursors = (payload.get("paging") or {}).get("cursors") or {}
        after = str(cursors.get("after") or "").strip()
        if not after:
            break
        params = dict(params, after=after)

    return items


class ReelResolver:
    def __init__(self):
        #: account_id -> (media list, fetched_at)
        self._cache: dict[str, tuple[list[dict], float]] = {}

    def resolve(self, db, url: str) -> ResolvedReel | None:
        """Find the media id for a pasted reel URL, or None if nobody owns it."""
        raw = str(url or "").strip()
        if not raw:
            raise ReelResolveError("no URL given")

        canonical = canonicalise(raw, timeout=INSTAGRAM_HTTP_TIMEOUT)
        shortcode = extract_shortcode(canonical)
        if not shortcode:
            raise ReelResolveError(f"{raw!r} is not a recognisable Instagram reel URL")

        connections = tenant_resolver.list_connections(db, "active")
        if not connections:
            logger.warning("Reel resolve attempted with no active connections")
            return None

        # Cached pass first, then a forced refetch. A vendor who posts a reel
        # and immediately links it would otherwise be told it does not exist,
        # which is the one moment they are most certain it does.
        searched = 0
        failures: list[str] = []

        for fresh in (False, True):
            for connection in connections:
                account_id = str(connection.InstagramAccountId)
                try:
                    found = self._search(db, connection, shortcode, fresh=fresh)
                except MediaLookupError as e:
                    # One vendor's dead token must not stop the others being
                    # searched -- but it must not be mistaken for an answer
                    # either. Remembered, and reported below if nobody could
                    # be searched at all.
                    logger.warning(
                        "Could not list media for account %s: %s", account_id, e
                    )
                    failures.append(f"{account_id}: {e}")
                    continue
                searched += 1
                if found is not None:
                    return found
            if not self._cache:
                break  # nothing cached, so the second pass would repeat the first

        if searched == 0 and failures:
            # Every account failed, so "no connected account owns this reel"
            # would be a guess dressed as a fact. The caller needs to know we
            # never actually looked.
            raise MediaLookupError("; ".join(failures))

        logger.info("Reel %s belongs to no connected account", shortcode)
        return None

    def _search(self, db, connection, shortcode: str, fresh: bool) -> ResolvedReel | None:
        account_id = str(connection.InstagramAccountId)
        # MediaLookupError propagates: resolve() decides whether a failure here
        # is survivable, because only it knows if anyone else answered.
        media = self._media_for(db, account_id, fresh=fresh)

        for item in media:
            if extract_shortcode(item.get("permalink")) != shortcode:
                continue
            media_id = str(item.get("id") or "").strip()
            if not media_id:
                continue
            return ResolvedReel(
                media_id=media_id,
                permalink=str(item.get("permalink") or ""),
                instagram_account_id=account_id,
                instagram_username=connection.InstagramUsername,
                media_product_type=item.get("media_product_type"),
            )
        return None

    def _media_for(self, db, account_id: str, fresh: bool) -> list[dict]:
        if not fresh:
            cached = self._cache.get(account_id)
            if cached is not None and (time.time() - cached[1]) < _MEDIA_CACHE_SECONDS:
                return cached[0]

        token = tenant_resolver.get_access_token(db, account_id)
        if not token:
            raise MediaLookupError(f"no usable token for account {account_id}")

        media = _list_media(token)
        self._cache[account_id] = (media, time.time())
        return media


reel_resolver = ReelResolver()
