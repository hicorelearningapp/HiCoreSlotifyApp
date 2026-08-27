import sys
import os

# Add the Backend folder to sys.path so we can import from backend_app
# (Wait, actually we don't need this anymore since we decoupled)
# backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Backend")
# sys.path.insert(0, backend_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import asyncio

# Setup DB Connection
from core.database import engine, Base, db_session

# Import models so they are registered with Base.metadata before create_all is called
import core.models

Base.metadata.create_all(bind=engine)

# Import factories to ensure workflows are registered
import industries.healthcare.HealthcareWorkflowFactory
import industries.ecommerce.EcommerceWorkflowFactory

# Webhook routers
from core.routers.whatsapp_webhook_router import whatsapp_webhook_router

# Platform routers
from core.routers import (
    business_config_router,
    google_auth_router,
    session_router,
    system_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    task = asyncio.create_task(cleanup_sessions_task())
    yield
    task.cancel()

app = FastAPI(
    title="HiCore Slotify - Bot Engine",
    description="Bot workflows and conversation management (WhatsApp)",
    openapi_url="/docs/openapi.json",
    lifespan=lifespan
)

# Serve static images for the simulator
images_dir = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(images_dir, exist_ok=True)
app.mount("/images", StaticFiles(directory=images_dir), name="images")

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        db_session.rollback()
        raise e
    finally:
        db_session.remove()

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



# Channel webhooks
app.include_router(whatsapp_webhook_router.router)

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
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
