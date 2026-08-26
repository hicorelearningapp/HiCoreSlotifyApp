from typing import List, Optional
from sqlalchemy.orm import Session
from backend_app.modules.ecommerce.models import Product

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def list_products(self, category: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
        query = self.db.query(Product).filter(Product.active == True)
        if category:
            query = query.filter(Product.category == category)
        return query.offset(skip).limit(limit).all()

    def create(self, product: Product) -> Product:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product: Product) -> Product:
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product_id: int) -> bool:
        prod = self.get_by_id(product_id)
        if prod:
            self.db.delete(prod)
            self.db.commit()
            return True
        return False
