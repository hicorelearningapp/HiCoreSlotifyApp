from fastapi import APIRouter
from app.modules.demo_request.routers.demo_request_router import DemoRequestRouter, router as demo_request_router


class DemoRequestModuleRouter:
    def __init__(self):
        self.router = APIRouter()
        self.router.include_router(demo_request_router)


router = DemoRequestModuleRouter().router
__all__ = ["DemoRequestModuleRouter", "router"]

