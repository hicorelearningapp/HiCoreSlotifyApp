from typing import List
from sqlalchemy.orm import Session
from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Category
from backend_app.modules.ecommerce.schemas import CategoryCreate
from backend_app.modules.ecommerce.repositories.category_repository import CategoryRepository

class CategoryService:
    def __init__(self, db: Session = None):
        self.db = db or db_session
        self.repo = CategoryRepository(self.db)

    def list_categories(self) -> List[Category]:
        return self.repo.list_categories()

    def create_category(self, data: CategoryCreate) -> Category:
        category = Category(**data.model_dump())
        return self.repo.create(category)
