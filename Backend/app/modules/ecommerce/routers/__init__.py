from fastapi import APIRouter
from app.modules.ecommerce.routers.product_router import router as product_router
from app.modules.ecommerce.routers.order_router import router as order_router
from app.modules.ecommerce.routers.customer_router import router as customer_router
from app.modules.ecommerce.routers.dashboard_router import router as dashboard_router
from app.modules.ecommerce.routers.report_router import router as report_router

router = APIRouter(prefix="/ecommerce")
router.include_router(product_router)
router.include_router(order_router)
router.include_router(customer_router)
router.include_router(dashboard_router)
router.include_router(report_router)
