from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend_app.core.database import get_db
from backend_app.modules.ecommerce.schemas import CartOut, CartItemCreate
from backend_app.modules.ecommerce.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Ecommerce Cart"])

@router.get("", response_model=CartOut)
def get_cart(customer_phone: str, store_id: str = "default", db: Session = Depends(get_db)):
    svc = CartService(db)
    cart = svc.get_or_create_cart(customer_phone, store_id)
    total = sum(item.unit_price * item.quantity for item in cart.items)
    return {
        "id": cart.id,
        "customer_phone": cart.customer_phone,
        "store_id": cart.store_id,
        "items": cart.items,
        "total_amount": total
    }

@router.post("/items", response_model=CartOut)
def add_to_cart(customer_phone: str, item_in: CartItemCreate, store_id: str = "default", db: Session = Depends(get_db)):
    svc = CartService(db)
    cart = svc.add_item(customer_phone, item_in, store_id)
    total = sum(item.unit_price * item.quantity for item in cart.items)
    return {
        "id": cart.id,
        "customer_phone": cart.customer_phone,
        "store_id": cart.store_id,
        "items": cart.items,
        "total_amount": total
    }

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    svc = CartService(db)
    svc.remove_item(item_id)
    return None
