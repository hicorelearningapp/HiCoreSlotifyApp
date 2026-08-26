import os
import asyncio
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend_app.core.config import settings
from backend_app.core.database import engine, Base, db_session, request_context, ensure_dynamic_schemas
from backend_app.common.router import router as common_router
from backend_app.modules.doctor_appointment.routers import router as doctor_appointment_router
from backend_app.modules.ecommerce.routers import router as ecommerce_router
from backend_app.modules.demo_request.routers import router as demo_request_router
from backend_app.modules.doctor_appointment.services import StatusTypeService, ConsultationTypeService

# Ensure database tables exist
Base.metadata.create_all(bind=engine)
ensure_dynamic_schemas(engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/docs/openapi.json",
    description="Modular Multi-Industry API Backend supporting Doctor Appointment & Ecommerce Systems."
)

# Static file serving for images
images_dir = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(images_dir, exist_ok=True)
app.mount("/images", StaticFiles(directory=images_dir), name="images")

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    token = request_context.set(object())
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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

@app.on_event("startup")
async def startup_event():
    setup_logging()
    try:
        StatusTypeService.seed_defaults(db_session)
        ConsultationTypeService.seed_defaults(db_session)
    except Exception as e:
        logging.getLogger("uvicorn").error(f"Error seeding default types: {e}")

# Register Routers
app.include_router(common_router)
app.include_router(doctor_appointment_router)
app.include_router(ecommerce_router)
app.include_router(demo_request_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to HiCore Slotify Multi-Industry API Backend.",
        "documentation": "/docs",
        "supported_domains": ["doctor_appointment", "ecommerce", "demo_request"]
    }
