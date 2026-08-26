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

Base.metadata.create_all(bind=engine)

# Instagram schema migrator
from core.database.migrate_instagram import ensure_instagram_schema
ensure_instagram_schema(engine)

# Import factories to ensure workflows are registered
import industries.healthcare.workflow.HealthcareWorkflowFactory
import industries.ecommerce.workflow.EcommerceWorkflowFactory

# Webhook routers
from core.channels.whatsapp.routers import whatsapp_webhook_router
# Note: we need to point to the correct instagram router path if it moved
from core.routers import instagram_webhook_router

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

from industries.healthcare.services.reminder_service import ReminderService
async def appointment_reminders_task():
    while True:
        try:
            await asyncio.sleep(5 * 60)
            ReminderService().process_reminders()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error processing reminders: {e}")

from core.services.instagram_dedup import instagram_event_guard
async def instagram_event_prune_task():
    while True:
        try:
            await asyncio.sleep(6 * 60 * 60)
            instagram_event_guard.prune(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error pruning instagram events: {e}")

from core.services.instagram_reply_queue import instagram_reply_queue
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

from core.services.instagram_onboarding_service import instagram_onboarding_service
async def instagram_token_refresh_task():
    while True:
        try:
            await asyncio.sleep(12 * 60 * 60)
            instagram_onboarding_service.refresh_expiring_tokens(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error refreshing instagram tokens: {e}")

from industries.healthcare.services.review_service import ReviewService
async def appointment_reviews_task():
    while True:
        try:
            await asyncio.sleep(60 * 60)
            ReviewService().process_reviews()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error(f"Error processing reviews: {e}")

@app.on_event("startup")
async def startup_event():
    setup_logging()
    asyncio.create_task(cleanup_sessions_task())
    asyncio.create_task(appointment_reminders_task())
    asyncio.create_task(appointment_reviews_task())
    asyncio.create_task(instagram_event_prune_task())
    asyncio.create_task(instagram_reply_worker_task())
    asyncio.create_task(instagram_token_refresh_task())

# Include ONLY Webhooks for the Bot
app.include_router(whatsapp_webhook_router.router)
app.include_router(instagram_webhook_router.router)

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


 
