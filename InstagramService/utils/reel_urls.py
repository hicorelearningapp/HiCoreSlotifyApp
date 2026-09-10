"""
Reel URLs, reduced to the one thing that identifies them.

A vendor can paste the same reel half a dozen ways -- with or without the
scheme, with or without www, under /p/ or /reel/ or /reels/, with an ?igsh=
tracking tail. Every one of those carries the same shortcode, and the
shortcode is what matches.

The exception is a share link (/share/reel/...). Its code is a redirect stub,
not the reel's own shortcode, so no amount of string work turns one into the
other -- the redirect has to be followed. That is why canonicalise() makes a
network call and extract_shortcode() never does.
"""
from __future__ import annotations

import logging
import re

import requests

logger = logging.getLogger("uvicorn")

#: /p/, /reel/, /reels/ and the share forms all carry a code in one position.
_CODE = re.compile(
    r"/(?:reel|reels|p|share/reel|share/p|share)/([A-Za-z0-9_-]+)", re.IGNORECASE
)

_SHARE = re.compile(r"/share/", re.IGNORECASE)


def extract_shortcode(url: str | None) -> str | None:
    """The reel's code, from any URL shape, or None if there is none to find."""
    if not url:
        return None
    clean = str(url).split("?")[0].split("#")[0].strip().rstrip("/")
    match = _CODE.search(clean)
    if match:
        return match.group(1)
    # A bare code, pasted without the URL around it.
    if re.fullmatch(r"[A-Za-z0-9_-]+", clean):
        return clean
    return None


def is_share_link(url: str | None) -> bool:
    return bool(url) and bool(_SHARE.search(str(url)))


def canonicalise(url: str, timeout: float = 5.0) -> str:
    """Resolve a share link to the reel's own URL. Anything else passes through.

    Instagram's mobile "Copy link" hands out /share/reel/<stub>, and that stub
    only redirects to the real reel -- it is not its shortcode. Following the
    redirect is the only way to learn the real code.

    A failure here returns the original URL rather than raising: the caller
    still has a shortcode to try, and a share link that cannot be followed
    should fail as "reel not found" with the vendor's own input echoed back,
    not as a network error they cannot act on.
    """
    if not is_share_link(url):
        return url

    try:
        # GET rather than HEAD -- Instagram does not answer HEAD reliably --
        # with the body left unread.
        response = requests.get(url, allow_redirects=True, timeout=timeout, stream=True)
        resolved = str(response.url or url)
        response.close()
    except requests.exceptions.RequestException as e:
        logger.warning("Could not follow share link %s: %s", url, e)
        return url

    if resolved != url:
        logger.info("Share link resolved to %s", resolved)
    return resolved
