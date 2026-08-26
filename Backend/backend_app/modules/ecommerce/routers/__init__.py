from fastapi import APIRouter
from backend_app.modules.ecommerce.routers.product_router import router as product_router
from backend_app.modules.ecommerce.routers.category_router import router as category_router
from backend_app.modules.ecommerce.routers.cart_router import router as cart_router
from backend_app.modules.ecommerce.routers.order_router import router as order_router

router = APIRouter(prefix="/ecommerce")
router.include_router(product_router)
router.include_router(category_router)
router.include_router(cart_router)
router.include_router(order_router)

