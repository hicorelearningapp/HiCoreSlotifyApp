from fastapi import APIRouter
from app.modules.ecommerce.routers.product_router import ProductRouter, router as product_router
from app.modules.ecommerce.routers.order_router import OrderRouter, router as order_router
from app.modules.ecommerce.routers.customer_router import EcommerceCustomerRouter, router as customer_router
from app.modules.ecommerce.routers.dashboard_router import DashboardRouter, router as dashboard_router
from app.modules.ecommerce.routers.report_router import ReportRouter, router as report_router


class EcommerceRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/ecommerce")
        self.router.include_router(product_router)
        self.router.include_router(order_router)
        self.router.include_router(customer_router)
        self.router.include_router(dashboard_router)
        self.router.include_router(report_router)


router = EcommerceRouter().router
__all__ = ["EcommerceRouter", "router"]

