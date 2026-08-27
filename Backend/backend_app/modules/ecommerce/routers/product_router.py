from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend_app.core.database import get_db
from backend_app.modules.ecommerce.schemas import ProductOut, ProductCreate, ProductUpdate
from backend_app.modules.ecommerce.services.product_service import ProductService


router = APIRouter(prefix="/products", tags=["Ecommerce Products"])

@router.get("/categories")
def get_categories(store_id: str = "default", db: Session = Depends(get_db)):
    return ProductService.get_all_categories(db, store_id)

@router.get("/categories/{category_id}/products")
def get_products_by_category(category_id: int, db: Session = Depends(get_db)):
    return ProductService.get_products_by_category(db, category_id)

@router.get("/{product_id}/variants")
def get_product_variants(product_id: int, db: Session = Depends(get_db)):
    return ProductService.get_variants_by_product_id(db, product_id)

@router.get("/find/{identifier}")
def find_product(identifier: str, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_name_or_id(db, identifier)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
