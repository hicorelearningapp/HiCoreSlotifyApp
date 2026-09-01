"""
Configuration for the Instagram handler service.

Reads the environment and nothing else -- this service imports no code from
Backend or Workflows, which is the point of it being its own deployment.

Keying note: everything here is addressed by Instagram account id. The older
code keyed some settings by WhatsApp phone number, which meant two accounts
belonging to one business could not be configured apart. Per-account settings
now live in instagram_connections.PolicyJson; the values below are only the
fallback for an account with no row of its own.
"""
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def _flag(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


# ── Service ───────────────────────────────────────────────────────────────
SERVICE_NAME = "HiCore Instagram Handler"
PORT = int(os.getenv("PORT", "8002"))

# This service's own database. It used to share appointments.db with the
# Backend API and the bot engine, back when it joined a reel to a product in
# their catalogue. That join is gone -- the reel link table replaced it -- so
# it reads nobody else's tables and has no reason to share their file.
#
# Point DATABASE_URL at appointments.db to go back to the shared file; the
# four tables are the same either way. migrate_db.py moves existing rows.
_SERVICE_ROOT = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(_SERVICE_ROOT, "instagram.db").replace(os.sep, "/"),
)

# Public origin Meta calls back on. The webhook, /privacy
# and /data-deletion are all served here, so this must reach THIS service --
# not the Backend API, and not the bot engine.
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", f"http://127.0.0.1:{PORT}").strip().rstrip("/")

# ── Meta app ──────────────────────────────────────────────────────────────
# The Instagram app is separate from the WhatsApp booking app and signs its
# webhooks with its own secret. These are not interchangeable.
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_VERIFY_TOKEN = os.getenv("INSTAGRAM_VERIFY_TOKEN", "slotify_verify_token")
INSTAGRAM_SIGNATURE_REQUIRED = _flag("INSTAGRAM_SIGNATURE_REQUIRED", "true")

# Single-account fallback token, used when a webhook arrives for an account
# with no connection row. Empty means such events are unroutable and dropped.
INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")

# ── Graph API ─────────────────────────────────────────────────────────────
INSTAGRAM_GRAPH_HOST = os.getenv("INSTAGRAM_GRAPH_HOST", "https://graph.instagram.com").strip().rstrip("/")
INSTAGRAM_GRAPH_API_VERSION = os.getenv("INSTAGRAM_GRAPH_API_VERSION", "v26.0").strip()
INSTAGRAM_HTTP_TIMEOUT = float(os.getenv("INSTAGRAM_HTTP_TIMEOUT", "10"))
MAX_WEBHOOK_BYTES = int(os.getenv("MAX_WEBHOOK_BYTES", "1048576"))

# ── Token encryption ──────────────────────────────────────────────────────
# Fernet key protecting vendor access tokens at rest. Durable state, not a
# rotatable secret: regenerate it and every stored token becomes unreadable
# and every account must be re-onboarded.
INSTAGRAM_TOKEN_ENCRYPTION_KEY = os.getenv("INSTAGRAM_TOKEN_ENCRYPTION_KEY", "")

# ── Default reply policy ──────────────────────────────────────────────────
# Per-account overrides live in instagram_connections.PolicyJson.
#   reply mode : public | private | both | none
#   match mode : all | contains | exact
INSTAGRAM_COMMENT_REPLY_MODE = os.getenv("INSTAGRAM_COMMENT_REPLY_MODE", "both").strip().lower()
INSTAGRAM_COMMENT_MATCH_MODE = os.getenv("INSTAGRAM_COMMENT_MATCH_MODE", "all").strip().lower()
INSTAGRAM_COMMENT_KEYWORDS = tuple(
    keyword.strip().casefold()
    for keyword in os.getenv("INSTAGRAM_COMMENT_KEYWORDS", "").split(",")
    if keyword.strip()
)
INSTAGRAM_REPLY_TO_NESTED_COMMENTS = _flag("INSTAGRAM_REPLY_TO_NESTED_COMMENTS", "false")
INSTAGRAM_IGNORE_OWN_COMMENTS = _flag("INSTAGRAM_IGNORE_OWN_COMMENTS", "true")

# Placeholders: {username} {comment} {comment_id} {media_id} {media_type}
# plus {wa_link}, which is the link seeded for that reel in
# instagram_reel_links. An unknown placeholder renders empty rather than
# raising, so a typo costs a word rather than the reply.
INSTAGRAM_PUBLIC_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PUBLIC_REPLY_TEXT",
    "Thanks for commenting @{username}! Check your DMs 💬",
)
INSTAGRAM_PRIVATE_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PRIVATE_REPLY_TEXT",
    "Hi {username}! Continue on WhatsApp 👇\n\n{wa_link}",
)

# ── Handoff ─────────────────────────────────────────────────────────────────────────
# Nothing to configure here any more. Where a commenter is sent is one row
# per reel in instagram_reel_links, with the number and the prefill text
# already encoded into the link. Seed it with seed_reel_links.py; Backend's
# management level owns that table later.

# ── Dedup and delivery ────────────────────────────────────────────────────
INSTAGRAM_EVENT_RETENTION_SECONDS = int(os.getenv("INSTAGRAM_EVENT_RETENTION_SECONDS", "86400"))
INSTAGRAM_MAX_DELIVERY_ATTEMPTS = int(os.getenv("INSTAGRAM_MAX_DELIVERY_ATTEMPTS", "5"))
INSTAGRAM_WORKER_POLL_SECONDS = float(os.getenv("INSTAGRAM_WORKER_POLL_SECONDS", "5"))
INSTAGRAM_WORKER_BATCH_SIZE = int(os.getenv("INSTAGRAM_WORKER_BATCH_SIZE", "20"))

# ── Token lifecycle ───────────────────────────────────────────────────────
INSTAGRAM_REFRESH_TOKEN_URL = os.getenv(
    "INSTAGRAM_REFRESH_TOKEN_URL", "https://graph.instagram.com/refresh_access_token"
)
# Meta requires a long-lived token to be at least 24h old before it will
# refresh, so the margin is days rather than hours.
INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS = int(
    os.getenv("INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS", str(7 * 24 * 60 * 60))
)

# ── Admin API ─────────────────────────────────────────────────────────────
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

# ── Legal pages (required by Meta App Review) ─────────────────────────────
APP_DISPLAY_NAME = os.getenv("APP_DISPLAY_NAME", "HiCore Instagram Handler")
PRIVACY_CONTROLLER_NAME = os.getenv("PRIVACY_CONTROLLER_NAME", "HiCore")
PRIVACY_CONTACT_EMAIL = os.getenv("PRIVACY_CONTACT_EMAIL", "")
