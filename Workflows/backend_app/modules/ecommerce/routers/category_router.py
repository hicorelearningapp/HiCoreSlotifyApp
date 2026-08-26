from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from backend_app.core.database import get_db
from backend_app.modules.ecommerce.schemas import CategoryOut, CategoryCreate
from backend_app.modules.ecommerce.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Ecommerce Categories"])

@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    svc = CategoryService(db)
    return svc.list_categories()

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    svc = CategoryService(db)
    return svc.create_category(data)
