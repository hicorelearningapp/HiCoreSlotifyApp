import sys
import os

# Add the Backend folder to sys.path so we can import from backend_app
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Backend")
sys.path.insert(0, backend_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import logging
import asyncio

# Setup DB Connection
from backend_app.core.database import engine, Base, db_session

# Import models so they are registered with Base.metadata before create_all is called
import core.models
import core.channels.instagram.models.instagram_connection
import backend_app.modules.doctor_appointment.models
import backend_app.modules.ecommerce.models

# Runs before create_all: an out-of-date conversation_sessions table is dropped
# here so create_all can rebuild it with the per-business unique constraint.
from core.database.migrate_sessions import ensure_session_schema
ensure_session_schema(engine)

Base.metadata.create_all(bind=engine)

# Instagram schema migrator
from core.database.migrate_instagram import ensure_instagram_schema
ensure_instagram_schema(engine)

# Import factories to ensure workflows are registered
import industries.healthcare.workflow.HealthcareWorkflowFactory
import industries.ecommerce.workflow.EcommerceWorkflowFactory

# Webhook routers
from core.channels.whatsapp.routers import whatsapp_webhook_router
from core.channels.instagram.routers import instagram_webhook_router

# Instagram onboarding / management routers
from core.channels.instagram.routers import instagram_oauth_router, instagram_connection_router

# Platform routers
from core.routers import (
    business_config_router,
    google_auth_router,
    session_router,
    system_router,
)

app = FastAPI(
    title="HiCore Slotify - Bot Engine",
    description="Bot workflows and conversation management (WhatsApp/Instagram)",
    openapi_url="/docs/openapi.json"
)

# Serve static images for the simulator
images_dir = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(images_dir, exist_ok=True)
app.mount("/images", StaticFiles(directory=images_dir), name="images")

from backend_app.core.database import request_context

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    token = request_context.set(object())
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        db_session.rollback()
        raise e
    finally:
        db_session.remove()
        request_context.reset(token)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def setup_logging():
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        for handler in logger.handlers:
            handler.setFormatter(formatter)

# --- Background Tasks ---
from core.services.session_service import SessionService
async def cleanup_sessions_task():
    while True:
        try:
            await asyncio.sleep(60) 
            SessionService().process_timeouts()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error in session cleanup task: {e}")

from backend_app.modules.doctor_appointment.services.reminder_service import ReminderService
async def appointment_reminders_task():
    while True:
        try:
            await asyncio.sleep(5 * 60)
            ReminderService().process_reminders()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error processing reminders: {e}")

from core.channels.instagram.services.instagram_dedup import instagram_event_guard
async def instagram_event_prune_task():
    while True:
        try:
            await asyncio.sleep(6 * 60 * 60)
            instagram_event_guard.prune(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error pruning instagram events: {e}")

from core.channels.instagram.services.instagram_reply_queue import instagram_reply_queue
async def instagram_reply_worker_task():
    from config import INSTAGRAM_WORKER_POLL_SECONDS
    try:
        instagram_reply_queue.recover_stuck(db_session)
    except Exception as e:
        logging.getLogger("uvicorn").error(f"Error recovering instagram actions: {e}")
    while True:
        try:
            await asyncio.sleep(INSTAGRAM_WORKER_POLL_SECONDS)
            instagram_reply_queue.process_once(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error in instagram reply worker: {e}")

from core.channels.instagram.services.instagram_onboarding_service import instagram_onboarding_service
async def instagram_token_refresh_task():
    while True:
        try:
            await asyncio.sleep(12 * 60 * 60)
            instagram_onboarding_service.refresh_expiring_tokens(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error refreshing instagram tokens: {e}")

from backend_app.modules.doctor_appointment.services.review_service import ReviewService
async def appointment_reviews_task():
    while True:
        try:
            await asyncio.sleep(60 * 60)
            ReviewService().process_reviews()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error processing reviews: {e}")

def check_public_base_url():
    """Warn when the origin Meta is told to call back on can't reach this app.

    A wrong PUBLIC_BASE_URL fails silently and late: OAuth only breaks once a
    vendor clicks Connect, and Meta App Review only fails once someone opens
    /privacy. Comparing the configured redirect against the routes this app
    actually serves catches it at boot instead.
    """
    from urllib.parse import urlparse
    from config import INSTAGRAM_OAUTH_REDIRECT_URI, PUBLIC_BASE_URL, SERVER_BASE_URL

    log = logging.getLogger("uvicorn")
    path = urlparse(INSTAGRAM_OAUTH_REDIRECT_URI).path or "/"
    served = {getattr(r, "path", None) for r in app.routes}

    if path not in served:
        log.warning(
            "INSTAGRAM_OAUTH_REDIRECT_URI points at %s, which this app does not "
            "serve. Meta will get a 404 on the OAuth callback.",
            path,
        )
    elif PUBLIC_BASE_URL == SERVER_BASE_URL:
        log.warning(
            "PUBLIC_BASE_URL is unset, so Meta callbacks are addressed to %s -- "
            "the Backend API. That only works behind a reverse proxy forwarding "
            "%s to this app. Set PUBLIC_BASE_URL to this app's own origin if "
            "ports are exposed directly.",
            SERVER_BASE_URL, path,
        )
    else:
        log.info("Meta callbacks addressed to %s", PUBLIC_BASE_URL)


@app.on_event("startup")
async def startup_event():
    setup_logging()
    check_public_base_url()
    asyncio.create_task(cleanup_sessions_task())
    asyncio.create_task(appointment_reminders_task())
    asyncio.create_task(appointment_reviews_task())
    asyncio.create_task(instagram_event_prune_task())
    asyncio.create_task(instagram_reply_worker_task())
    asyncio.create_task(instagram_token_refresh_task())

# Channel webhooks
app.include_router(whatsapp_webhook_router.router)
app.include_router(instagram_webhook_router.router)

# Instagram onboarding: /integrations/instagram/*, plus the /privacy and
# /data-deletion pages Meta App Review requires.
app.include_router(instagram_oauth_router.router)
app.include_router(instagram_connection_router.router)

# Platform management
app.include_router(business_config_router.router)
app.include_router(google_auth_router.router)
app.include_router(session_router.router)
app.include_router(system_router.router)

@app.get("/")
def read_root():
    return {"message": "HiCore Slotify - Bot Engine. Visit /test-ui for the interactive tester."}

@app.get("/test-ui", response_class=HTMLResponse)
def get_test_ui():
    ui_path = os.path.join(os.path.dirname(__file__), "test_ui.html")
    if os.path.exists(ui_path):
        with open(ui_path, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("test_ui.html not found.", status_code=404)

if __name__ == "__main__":
    import uvicorn
    # Run the bot engine on port 8001
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
