from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Product, Cart, CartItem
from backend_app.modules.ecommerce.schemas import CartItemCreate

class CartService:
    def __init__(self, db: Session = None):
        self.db = db or db_session

    def get_or_create_cart(self, customer_phone: str, store_id: str = "default") -> Cart:
        cart = self.db.query(Cart).filter(Cart.customer_phone == customer_phone, Cart.store_id == store_id).first()
        if not cart:
            cart = Cart(customer_phone=customer_phone, store_id=store_id)
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        return cart

    def add_item(self, customer_phone: str, item_in: CartItemCreate, store_id: str = "default") -> Cart:
        cart = self.get_or_create_cart(customer_phone, store_id)
        product = self.db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")

        existing_item = self.db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id,
            CartItem.variant_id == item_in.variant_id
        ).first()

        if existing_item:
            existing_item.quantity += item_in.quantity
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item_in.product_id,
                variant_id=item_in.variant_id,
                quantity=item_in.quantity,
                unit_price=product.price
            )
            self.db.add(new_item)

        self.db.commit()
        self.db.refresh(cart)
        return cart

    def remove_item(self, item_id: int) -> bool:
        item = self.db.query(CartItem).filter(CartItem.id == item_id).first()
        if item:
            self.db.delete(item)
            self.db.commit()
            return True
        return False
