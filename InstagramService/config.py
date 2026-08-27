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

# Shared with the Backend API and the bot engine. Unset resolves to
# <repo-root>/appointments.db so all three services open the same file.
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(_REPO_ROOT, "appointments.db").replace(os.sep, "/"),
)

# Public origin Meta calls back on. The webhook, the OAuth callback, /privacy
# and /data-deletion are all served here, so this must reach THIS service --
# not the Backend API, and not the bot engine.
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", f"http://127.0.0.1:{PORT}").strip().rstrip("/")

# ── Meta app ──────────────────────────────────────────────────────────────
# The Instagram app is separate from the WhatsApp booking app and signs its
# webhooks with its own secret. These are not interchangeable.
INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_APP_SECRET_OAUTH = os.getenv("INSTAGRAM_APP_SECRET_OAUTH", "") or INSTAGRAM_APP_SECRET
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
# plus {wa_link} and {product_name} in the private reply.
INSTAGRAM_PUBLIC_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PUBLIC_REPLY_TEXT",
    "Thanks for commenting @{username}! Check your DMs 💬",
)
INSTAGRAM_PRIVATE_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PRIVATE_REPLY_TEXT",
    "Hi {username}! Continue on WhatsApp 👇\n\n{wa_link}",
)

# ── Handoff ───────────────────────────────────────────────────────────────
#   healthcare -> a plain booking link to the account's WhatsApp number
#   ecommerce  -> the reel is looked up as a product; the link carries its id
INSTAGRAM_HANDOFF_MODE = os.getenv("INSTAGRAM_HANDOFF_MODE", "healthcare").strip().lower()
# Fallback only. A connection's BusinessPhoneNumber wins, so each vendor hands
# off to their own number.
INSTAGRAM_HANDOFF_WA_NUMBER = os.getenv("INSTAGRAM_HANDOFF_WA_NUMBER", "").strip()
INSTAGRAM_HANDOFF_PREFILL_TEXT = os.getenv("INSTAGRAM_HANDOFF_PREFILL_TEXT", "Hi")

# Sent for any direct message. Instagram is a funnel: DMs are answered with the
# same handoff link rather than running a conversation.
INSTAGRAM_DM_REPLY_TEXT = os.getenv(
    "INSTAGRAM_DM_REPLY_TEXT",
    "Hi! Continue on WhatsApp 👇\n\n{wa_link}",
)

# ── Dedup and delivery ────────────────────────────────────────────────────
INSTAGRAM_EVENT_RETENTION_SECONDS = int(os.getenv("INSTAGRAM_EVENT_RETENTION_SECONDS", "86400"))
INSTAGRAM_MAX_DELIVERY_ATTEMPTS = int(os.getenv("INSTAGRAM_MAX_DELIVERY_ATTEMPTS", "5"))
INSTAGRAM_WORKER_POLL_SECONDS = float(os.getenv("INSTAGRAM_WORKER_POLL_SECONDS", "5"))
INSTAGRAM_WORKER_BATCH_SIZE = int(os.getenv("INSTAGRAM_WORKER_BATCH_SIZE", "20"))

# ── OAuth onboarding ──────────────────────────────────────────────────────
INSTAGRAM_OAUTH_REDIRECT_URI = os.getenv(
    "INSTAGRAM_OAUTH_REDIRECT_URI",
    f"{PUBLIC_BASE_URL}/integrations/instagram/callback",
)
INSTAGRAM_OAUTH_AUTHORIZE_URL = os.getenv(
    "INSTAGRAM_OAUTH_AUTHORIZE_URL", "https://www.instagram.com/oauth/authorize"
)
INSTAGRAM_OAUTH_TOKEN_URL = os.getenv(
    "INSTAGRAM_OAUTH_TOKEN_URL", "https://api.instagram.com/oauth/access_token"
)
INSTAGRAM_LONG_LIVED_TOKEN_URL = os.getenv(
    "INSTAGRAM_LONG_LIVED_TOKEN_URL", "https://graph.instagram.com/access_token"
)
INSTAGRAM_REFRESH_TOKEN_URL = os.getenv(
    "INSTAGRAM_REFRESH_TOKEN_URL", "https://graph.instagram.com/refresh_access_token"
)
INSTAGRAM_OAUTH_SCOPES = tuple(
    scope.strip()
    for scope in os.getenv(
        "INSTAGRAM_OAUTH_SCOPES",
        "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
    ).split(",")
    if scope.strip()
)
OAUTH_STATE_TTL_SECONDS = max(60, int(os.getenv("OAUTH_STATE_TTL_SECONDS", "600")))
# Meta requires a long-lived token to be at least 24h old before it refreshes,
# so the margin is days rather than hours.
INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS = int(
    os.getenv("INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS", str(7 * 24 * 60 * 60))
)

# ── Admin API ─────────────────────────────────────────────────────────────
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

# ── Legal pages (required by Meta App Review) ─────────────────────────────
APP_DISPLAY_NAME = os.getenv("APP_DISPLAY_NAME", "HiCore Instagram Handler")
PRIVACY_CONTROLLER_NAME = os.getenv("PRIVACY_CONTROLLER_NAME", "HiCore")
PRIVACY_CONTACT_EMAIL = os.getenv("PRIVACY_CONTACT_EMAIL", "")
