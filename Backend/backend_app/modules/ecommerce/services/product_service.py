from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Product, Inventory
from backend_app.modules.ecommerce.schemas import ProductCreate, ProductUpdate

class ProductService:
    def __init__(self, db: Session = None):
        self.db = db or db_session

    def list_products(self, category: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
        query = self.db.query(Product).filter(Product.active == True)
        if category:
            query = query.filter(Product.category == category)
        return query.offset(skip).limit(limit).all()

    def get_product(self, product_id: int) -> Product:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")
        return product

    def create_product(self, data: ProductCreate) -> Product:
        prod_data = data.model_dump()
        product = Product(**prod_data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)

        inventory = Inventory(product_id=product.id, stock_quantity=product.stock_quantity)
        self.db.add(inventory)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.get_product(product_id)
        for field, val in data.model_dump(exclude_unset=True).items():
            setattr(product, field, val)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete_product(self, product_id: int) -> bool:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if product:
            self.db.delete(product)
            self.db.commit()
            return True
        return False
