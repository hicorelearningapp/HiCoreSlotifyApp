from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend_app.core.database import get_db
from backend_app.modules.ecommerce.schemas import ProductOut, ProductCreate, ProductUpdate
from backend_app.modules.ecommerce.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Ecommerce Products"])

@router.get("", response_model=List[ProductOut])
def list_products(category: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    svc = ProductService(db)
    return svc.list_products(category=category, skip=skip, limit=limit)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    svc = ProductService(db)
    return svc.get_product(product_id)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    svc = ProductService(db)
    return svc.create_product(data)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    svc = ProductService(db)
    return svc.update_product(product_id, data)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    svc = ProductService(db)
    svc.delete_product(product_id)
    return None
