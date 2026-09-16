import logging
import requests
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)


def resolve_media_id(reel_url: str) -> str | None:
    """
    Reel URL -> Instagram media id. None means 'could not ask' — save anyway.
    Handles all URL shapes: /p/, /reel/, /reels/, bare shortcodes, share links, etc.
    """
    if not reel_url or not str(reel_url).strip():
        return None

    clean_url = str(reel_url).strip()

    # If it is already a numeric media ID (e.g. 18126449017684407), return directly
    if clean_url.isdigit() and len(clean_url) >= 10:
        return clean_url

    resolve_url = f"{settings.INSTAGRAM_SERVICE_URL.rstrip('/')}/integrations/instagram/reels/resolve"

    try:
        r = requests.post(
            resolve_url,
            json={"url": clean_url},
            headers={"X-API-Key": settings.INSTAGRAM_ADMIN_API_KEY},
            timeout=30,
        )
    except requests.RequestException as e:
        logger.warning("Instagram resolver unreachable: %s", e)
        return None

    if r.status_code == 200:
        try:
            data = r.json()
            return data.get("media_id")
        except Exception:
            return None

    if r.status_code in (400, 404):
        # The vendor's mistake, and fixable by them — surface it on the form.
        try:
            err_data = r.json()
            detail = err_data.get("detail") if isinstance(err_data, dict) else str(err_data)
        except Exception:
            detail = "Invalid Instagram reel URL or reel not found on connected account."
        raise HTTPException(status_code=400, detail=detail)

    logger.warning("Instagram resolver returned HTTP %s: %s", r.status_code, r.text)
    return None
