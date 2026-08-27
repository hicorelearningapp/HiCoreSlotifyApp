import sys
import os
import asyncio
import logging

# Ensure both Backend and Workflows are in the Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "Backend"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "Workflows"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# Setup DB Connection
from backend_app.core.database import engine, Base, db_session, request_context, ensure_dynamic_schemas

# Import models so they are registered with Base.metadata before create_all is called
import core.models  # type: ignore
import core.channels.instagram.models.instagram_connection  # type: ignore
import backend_app.modules.doctor_appointment.models  # type: ignore
import backend_app.modules.ecommerce.models  # type: ignore

Base.metadata.create_all(bind=engine)
ensure_dynamic_schemas(engine)

# Instagram schema migrator
from core.database.migrate_instagram import ensure_instagram_schema  # type: ignore
ensure_instagram_schema(engine)

# Import factories to ensure workflows are registered
import industries.healthcare.HealthcareWorkflowFactory 
import industries.ecommerce.EcommerceWorkflowFactory  

# --- ROUTERS ---
# Workflows Webhook routers
from core.channels.whatsapp.routers import whatsapp_webhook_router 
from core.channels.instagram.routers import instagram_webhook_router 

# Backend API routers
from backend_app.common.router import router as common_router  # type: ignore
from backend_app.modules.doctor_appointment.routers import router as doctor_appointment_router  # type: ignore
from backend_app.modules.ecommerce.routers import router as ecommerce_router  # type: ignore
from backend_app.modules.doctor_appointment.services import StatusTypeService, ConsultationTypeService  # type: ignore

app = FastAPI(
    title="HiCore Slotify - Unified Server",
    description="Bot workflows (WhatsApp/Instagram) and modular API Backend supporting Doctor Appointment & Ecommerce.",
    openapi_url="/docs/openapi.json"
)

# Serve static images for the simulator (from Workflows)
workflows_images_dir = os.path.join(os.path.dirname(__file__), "Workflows", "images")
os.makedirs(workflows_images_dir, exist_ok=True)
app.mount("/images", StaticFiles(directory=workflows_images_dir), name="images")

# Serve backend images
backend_images_dir = os.path.join(os.path.dirname(__file__), "Backend", "backend_app", "images")
os.makedirs(backend_images_dir, exist_ok=True)
app.mount("/api_images", StaticFiles(directory=backend_images_dir), name="api_images")

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    token = request_context.set(object())  # type: ignore
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        try:
            db_session.rollback()
        except Exception:
            pass
        raise e
    finally:
        try:
            db_session.remove()
        except Exception:
            pass
        request_context.reset(token)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
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

# --- Background Tasks from Workflows ---
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

@app.on_event("startup")  # type: ignore
async def startup_event():
    setup_logging()
    
    # Backend initialization
    try:
        StatusTypeService.seed_defaults(db_session())
        ConsultationTypeService.seed_defaults(db_session())
    except Exception as e:
        logging.getLogger("uvicorn").error(f"Error seeding default types: {e}")
        
    # Workflows Background tasks
    asyncio.create_task(cleanup_sessions_task())
    asyncio.create_task(appointment_reminders_task())
    asyncio.create_task(appointment_reviews_task())
    asyncio.create_task(instagram_event_prune_task())
    asyncio.create_task(instagram_reply_worker_task())
    asyncio.create_task(instagram_token_refresh_task())

# Include Webhooks for the Bot
app.include_router(whatsapp_webhook_router.router)
app.include_router(instagram_webhook_router.router)

# Include Backend API Routers
app.include_router(common_router)
app.include_router(doctor_appointment_router)
app.include_router(ecommerce_router)

@app.get("/")
def read_root():
    return {
        "message": "HiCore Slotify - Unified Server",
        "bot_ui": "Visit /test-ui for the interactive tester.",
        "api_documentation": "/docs"
    }

@app.get("/test-ui", response_class=HTMLResponse)
def get_test_ui():
    ui_path = os.path.join(os.path.dirname(__file__), "Workflows", "test_ui.html")
    if os.path.exists(ui_path):
        with open(ui_path, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("test_ui.html not found.", status_code=404)

if __name__ == "__main__":
    import uvicorn
    # Run the unified server on port 8003
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
