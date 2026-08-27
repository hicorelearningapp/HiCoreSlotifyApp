from fastapi import APIRouter
from backend_app.modules.ecommerce.routers.product_router import router as product_router
from backend_app.modules.ecommerce.routers.order_router import router as order_router
from backend_app.modules.ecommerce.routers.customer_router import router as customer_router

router = APIRouter(prefix="/ecommerce")
router.include_router(product_router)
router.include_router(order_router)
router.include_router(customer_router)
