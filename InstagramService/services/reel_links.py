"""
Reel -> WhatsApp link, from Backend's catalogue.

One HTTP GET, and the only thing that decides where a commenter is sent. The
link arrives complete -- number and prefill text already inside it -- so
nothing here assembles a URL. What the vendor linked to that reel in Backend
is what the customer receives.

This replaces the local reel link table. That table had to be seeded by hand
against a number nothing verified; Backend resolves the reel to a product and
the product to its seller's registered number, so the link now follows
whatever the vendor last saved rather than a frozen copy of it.

The reel is addressed by its Instagram media id -- the numeric id Meta puts in
the webhook, not the shortcode and not the permalink. It is the only reel
identifier this service ever holds, so it is the only one it can ask with.

Two failures, told apart on purpose, because different people fix them:

  404          no link for this reel -- either nothing is linked to it, or
               the product's seller record is missing. Permanent either way,
               so no reply. Backend's own wording goes into the log, because
               those two want different people to fix them.
  timeout/5xx  Backend is unreachable. Transient, but the dedup claim for this
               comment is already taken by the time we get here, so a reply
               dropped now is never redelivered. Retried briefly, then logged
               loudly as an ops failure.
"""
from __future__ import annotations

import logging
import time

import requests

from config import (
    BACKEND_BASE_URL,
    BACKEND_LINK_PARAM,
    BACKEND_HTTP_TIMEOUT,
    BACKEND_LINK_CACHE_SECONDS,
    BACKEND_LINK_RETRIES,
)

logger = logging.getLogger("uvicorn")

#: Backend's product API. The reel is passed as a media id.
_LINK_PATH = "/ecommerce/products/whatsapp-link"


def _detail(response) -> str:
    """Backend's own explanation for a refusal, for the log line."""
    try:
        payload = response.json()
    except ValueError:
        return f"HTTP {response.status_code}"
    detail = (payload or {}).get("detail")
    return str(detail) if detail else f"HTTP {response.status_code}"


class ReelLinks:
    """Reads the reel -> link mapping from Backend. Swap the body, keep the signature."""

    def __init__(self):
        #: media_id -> (wa_link, fetched_at). Short-lived on purpose: a reel
        #: getting a burst of comments becomes one call, while a vendor editing
        #: the product still takes effect within the minute. Only successes are
        #: cached -- caching a 404 would mean linking a reel and immediately
        #: testing it kept returning nothing, which is exactly what a demo does.
        self._cache: dict[str, tuple[str, float]] = {}

    def link_for_reel(self, db, reel_id: str) -> str | None:
        """The WhatsApp link Backend holds for one reel, or None.

        `db` is unused. It is kept so the call site does not change if this
        ever goes back to a local table.
        """
        if not reel_id:
            return None

        reel_id = str(reel_id)
        cached = self._cache.get(reel_id)
        if cached is not None and (time.time() - cached[1]) < BACKEND_LINK_CACHE_SECONDS:
            return cached[0]

        link = self._fetch(reel_id)
        if link is not None:
            self._cache[reel_id] = (link, time.time())
        return link

    def _fetch(self, reel_id: str) -> str | None:
        url = f"{BACKEND_BASE_URL}{_LINK_PATH}"
        last_error: object = None

        for attempt in range(BACKEND_LINK_RETRIES + 1):
            try:
                response = requests.get(
                    url, params={BACKEND_LINK_PARAM: reel_id}, timeout=BACKEND_HTTP_TIMEOUT
                )
            except requests.exceptions.RequestException as e:
                last_error = e
            else:
                # Backend answers 404 both for "no product carries this reel"
                # and for "product found, but its seller is missing" -- and
                # those need different people to fix them. Carry its own words
                # through rather than printing a guess.
                if response.status_code == 404:
                    logger.info("No link for reel %s: %s", reel_id, _detail(response))
                    return None

                if 200 <= response.status_code < 300:
                    return self._link_from(response, reel_id)

                # 4xx that is not 404 means we asked wrongly -- a retry sends
                # the same wrong question, so stop.
                if response.status_code < 500:
                    logger.error(
                        "Backend rejected the lookup for reel %s (HTTP %s): %s",
                        reel_id, response.status_code, _detail(response),
                    )
                    return None

                last_error = f"HTTP {response.status_code}"

            if attempt < BACKEND_LINK_RETRIES:
                time.sleep(0.2 * (attempt + 1))

        logger.error(
            "Backend unreachable for reel %s after %s attempt(s) (%s); reply dropped",
            reel_id, BACKEND_LINK_RETRIES + 1, last_error,
        )
        return None

    @staticmethod
    def _link_from(response, reel_id: str) -> str | None:
        try:
            payload = response.json()
        except ValueError:
            logger.error("Backend returned a non-JSON body for reel %s", reel_id)
            return None

        link = str((payload or {}).get("WhatsAppLink") or "").strip()
        if not link:
            # A 200 with nothing in it is a Backend bug, not an unlinked reel.
            logger.error("Backend returned an empty WhatsAppLink for reel %s", reel_id)
            return None
        return link


reel_links = ReelLinks()
