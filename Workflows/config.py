import os
from datetime import time

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

BUSINESS_OPEN_TIME = time(0, 0)   # 09:00 AM
BUSINESS_CLOSE_TIME = time(23, 59) # 05:00 PM

APPOINTMENT_INTERVAL_MINUTES = 10

REMINDER_TIMINGS_HOURS = [24, 2, 1]

MAX_BOOKINGS_PER_SLOT = 1

MAX_BOOKINGS_PER_DAY = None

CUSTOMER_APPOINTMENT_BUFFER_MINUTES = 60


ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "")
INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
INSTAGRAM_VERIFY_TOKEN = os.getenv("INSTAGRAM_VERIFY_TOKEN", "slotify_verify_token")
APP_SECRET = os.getenv("APP_SECRET", "")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER", "")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "hicore-admin-secret-2026")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "hicore")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "hicore123")
SERVER_BASE_URL = os.getenv("SERVER_BASE_URL", "http://151.185.41.194:8003")


# ──────────────────────────────────────────────────────────────
# Instagram comment automation
# ──────────────────────────────────────────────────────────────
# The Instagram comment replier is a SEPARATE Meta app from the WhatsApp
# booking app, so it has its own App Secret. Webhook signatures are signed
# with the secret of the app that sent the event -- APP_SECRET (WhatsApp)
# and INSTAGRAM_APP_SECRET (Instagram) are not interchangeable.
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_SIGNATURE_REQUIRED = os.getenv("INSTAGRAM_SIGNATURE_REQUIRED", "true").strip().lower() in ("1", "true", "yes", "on")

# "Instagram API with Instagram Login" endpoints. The legacy DM path in
# InstagramService still targets graph.facebook.com; only the comment
# reply/private-reply calls use these.
INSTAGRAM_GRAPH_HOST = os.getenv("INSTAGRAM_GRAPH_HOST", "https://graph.instagram.com").strip().rstrip("/")
INSTAGRAM_GRAPH_API_VERSION = os.getenv("INSTAGRAM_GRAPH_API_VERSION", "v26.0").strip()
INSTAGRAM_HTTP_TIMEOUT = float(os.getenv("INSTAGRAM_HTTP_TIMEOUT", "10"))

MAX_WEBHOOK_BYTES = int(os.getenv("MAX_WEBHOOK_BYTES", "1048576"))

# Which handoff to build when a comment arrives.
#   healthcare -> plain wa.me booking link to the doctor appointment number
#   ecommerce  -> look the reel/media up as a product and build an order link
INSTAGRAM_HANDOFF_MODE = os.getenv("INSTAGRAM_HANDOFF_MODE", "healthcare").strip().lower()
INSTAGRAM_HANDOFF_WA_NUMBER = os.getenv("INSTAGRAM_HANDOFF_WA_NUMBER", "").strip() or ADMIN_PHONE_NUMBER
INSTAGRAM_HANDOFF_PREFILL_TEXT = os.getenv("INSTAGRAM_HANDOFF_PREFILL_TEXT", "Hi")

# Comment matching policy.
#   reply mode : public | private | both | none
#   match mode : all | contains | exact
INSTAGRAM_COMMENT_REPLY_MODE = os.getenv("INSTAGRAM_COMMENT_REPLY_MODE", "both").strip().lower()
INSTAGRAM_COMMENT_MATCH_MODE = os.getenv("INSTAGRAM_COMMENT_MATCH_MODE", "all").strip().lower()
INSTAGRAM_COMMENT_KEYWORDS = tuple(
    keyword.strip().casefold()
    for keyword in os.getenv("INSTAGRAM_COMMENT_KEYWORDS", "").split(",")
    if keyword.strip()
)
INSTAGRAM_REPLY_TO_NESTED_COMMENTS = os.getenv("INSTAGRAM_REPLY_TO_NESTED_COMMENTS", "false").strip().lower() in ("1", "true", "yes", "on")
INSTAGRAM_IGNORE_OWN_COMMENTS = os.getenv("INSTAGRAM_IGNORE_OWN_COMMENTS", "true").strip().lower() in ("1", "true", "yes", "on")

# Reply templates. Placeholders: {username} {comment} {comment_id} {media_id}
# {media_type} and, for the private reply only, {wa_link}.
INSTAGRAM_PUBLIC_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PUBLIC_REPLY_TEXT",
    "Thanks for commenting @{username}! Check your DMs 💬",
)
INSTAGRAM_PRIVATE_REPLY_TEXT = os.getenv(
    "INSTAGRAM_PRIVATE_REPLY_TEXT",
    "Hi {username}! Book your appointment on WhatsApp 👇\n\n{wa_link}",
)

# How long a comment id is remembered for duplicate suppression. Meta retries
# a failed webhook for a few minutes, so this only needs to outlive that.
INSTAGRAM_DEDUP_TTL_SECONDS = int(os.getenv("INSTAGRAM_DEDUP_TTL_SECONDS", "3600"))

# Fernet key protecting per-vendor access tokens at rest. Required before a
# vendor token can be stored, because appointments.db is tracked in git.
#   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
INSTAGRAM_TOKEN_ENCRYPTION_KEY = os.getenv("INSTAGRAM_TOKEN_ENCRYPTION_KEY", "")

# How long a processed-event row is kept before pruning.
INSTAGRAM_EVENT_RETENTION_SECONDS = int(os.getenv("INSTAGRAM_EVENT_RETENTION_SECONDS", "86400"))

# ── Instagram OAuth onboarding ────────────────────────────────────────────
# One shared Meta app; each vendor authorizes it and grants access to one
# professional account. INSTAGRAM_APP_SECRET_OAUTH falls back to the webhook
# app secret because for a single Meta app they are the same value.
INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET_OAUTH = os.getenv("INSTAGRAM_APP_SECRET_OAUTH", "") or INSTAGRAM_APP_SECRET
INSTAGRAM_OAUTH_REDIRECT_URI = os.getenv(
    "INSTAGRAM_OAUTH_REDIRECT_URI",
    f"{SERVER_BASE_URL.rstrip('/')}/integrations/instagram/callback",
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

# Refresh a long-lived token when it has this long or less remaining. Meta
# requires the token to be at least 24 hours old before it can be refreshed.
INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS = int(
    os.getenv("INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS", str(7 * 24 * 60 * 60))
)

# ── Reply delivery queue ──────────────────────────────────────────────────
INSTAGRAM_MAX_DELIVERY_ATTEMPTS = int(os.getenv("INSTAGRAM_MAX_DELIVERY_ATTEMPTS", "5"))
INSTAGRAM_WORKER_POLL_SECONDS = float(os.getenv("INSTAGRAM_WORKER_POLL_SECONDS", "5"))
INSTAGRAM_WORKER_BATCH_SIZE = int(os.getenv("INSTAGRAM_WORKER_BATCH_SIZE", "20"))

# ── Legal pages (required by Meta App Review) ─────────────────────────────
APP_DISPLAY_NAME = os.getenv("APP_DISPLAY_NAME", "HiCore Appointment System")
PRIVACY_CONTROLLER_NAME = os.getenv("PRIVACY_CONTROLLER_NAME", "HiCore")
PRIVACY_CONTACT_EMAIL = os.getenv("PRIVACY_CONTACT_EMAIL", "")


GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
NLU_TIMEOUT = float(os.getenv("NLU_TIMEOUT", "10"))

# NLU is only active for uninitialized sessions and the GreetingMessageWorkflow.
NLU_ENABLED = os.getenv("NLU_ENABLED", "false").strip().lower() in ("1", "true", "yes", "on")
TIME_OUT_ENABLED = os.getenv("TIME_OUT_ENABLED", "true").strip().lower() in ("1", "true", "yes", "on")
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", "10"))

LANGUAGE_SELECTION_ENABLED = os.getenv("LANGUAGE_SELECTION_ENABLED", "false").strip().lower() in ("1", "true", "yes", "on")

LANGUAGE_METADATA = {
    "en": {"title": "🇺🇸 English", "description": "English"},
    "ta": {"title": "🇮🇳 தமிழ்", "description": "Tamil"},
    "hi": {"title": "🇮🇳 हिंदी", "description": "Hindi"},
    "es": {"title": "🇪🇸 Español", "description": "Spanish"}
}
