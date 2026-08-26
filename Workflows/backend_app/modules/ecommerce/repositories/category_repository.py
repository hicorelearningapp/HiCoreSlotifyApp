from typing import List
from sqlalchemy.orm import Session
from backend_app.modules.ecommerce.models import Category

class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_categories(self) -> List[Category]:
        return self.db.query(Category).filter(Category.is_active == True).all()

    def create(self, category: Category) -> Category:
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category
