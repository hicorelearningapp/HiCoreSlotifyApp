from fastapi import APIRouter
from app.modules.demo_request.routers.demo_request_router import router as demo_request_router

router = APIRouter()
router.include_router(demo_request_router)
