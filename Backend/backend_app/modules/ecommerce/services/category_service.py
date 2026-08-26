from typing import List
from sqlalchemy.orm import Session
from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Category
from backend_app.modules.ecommerce.schemas import CategoryCreate

class CategoryService:
    def __init__(self, db: Session = None):
        self.db = db or db_session

    def list_categories(self) -> List[Category]:
        return self.db.query(Category).filter(Category.is_active == True).all()

    def create_category(self, data: CategoryCreate) -> Category:
        category = Category(**data.model_dump())
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

