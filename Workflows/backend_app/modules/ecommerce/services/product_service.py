from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Product, ProductVariant, Inventory
from backend_app.modules.ecommerce.schemas import ProductCreate, ProductUpdate
from backend_app.modules.ecommerce.repositories.product_repository import ProductRepository

class ProductService:
    def __init__(self, db: Session = None):
        self.db = db or db_session
        self.repo = ProductRepository(self.db)

    def list_products(self, category: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
        return self.repo.list_products(category=category, skip=skip, limit=limit)

    def get_product(self, product_id: int) -> Product:
        product = self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")
        return product

    def create_product(self, data: ProductCreate) -> Product:
        variants_data = data.variants or []
        prod_data = data.model_dump(exclude={"variants"})

        product = Product(**prod_data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)

        for v_in in variants_data:
            variant = ProductVariant(product_id=product.id, **v_in.model_dump())
            self.db.add(variant)

        inventory = Inventory(product_id=product.id, stock_quantity=product.stock_quantity)
        self.db.add(inventory)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.get_product(product_id)
        for field, val in data.model_dump(exclude_unset=True).items():
            setattr(product, field, val)
        return self.repo.update(product)

    def delete_product(self, product_id: int) -> bool:
        return self.repo.delete(product_id)
