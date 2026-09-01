import json
import os
import shutil
import uuid
from typing import List, Optional, Union
from fastapi import UploadFile
from app.core.config import settings
from app.modules.ecommerce.models.product import Product
from app.modules.ecommerce.models.category import Category as ProductCategory
from sqlalchemy.orm import Session

class ProductService:
    _reel_config = None
    
    @classmethod
    def _load_reel_config(cls):
        """Load the fallback reel_products.json config."""
        if cls._reel_config is None:
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "store_configs",
                "reel_products.json",
            )
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    cls._reel_config = json.load(f)
            except Exception as e:
                print(f"Failed to load reel_products.json: {e}")
                cls._reel_config = {}
        return cls._reel_config

    @staticmethod
    def save_uploaded_images(files: List[UploadFile]) -> List[str]:
        """
        Saves uploaded images to Backend/images/products directory
        and returns the list of static URLs.
        """
        target_dir = os.path.join(settings.IMAGES_DIR, "products")
        os.makedirs(target_dir, exist_ok=True)
        
        saved_urls: List[str] = []
        for file in files:
            if not file or not file.filename:
                continue
            ext = os.path.splitext(file.filename)[1].lower()
            if not ext:
                ext = ".jpg"
            unique_filename = f"prod_{uuid.uuid4().hex[:12]}{ext}"
            file_path = os.path.join(target_dir, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            saved_urls.append(f"/images/products/{unique_filename}")
            
        return saved_urls

    @staticmethod
    def get_all_categories(db: Session):
        return db.query(ProductCategory).all()
        
    @staticmethod
    def get_products_by_category(db: Session, category_id: str):
        category = db.query(ProductCategory).filter(ProductCategory.Id == category_id).first()
        if not category:
            return []
        return db.query(Product).filter(
            Product.Category == category.CategoryName,
            Product.Active == True
        ).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: str):
        return db.query(Product).filter(Product.Id == product_id).first()

    @staticmethod
    def get_product_by_reel_link(db: Session, reel_link: str):
        prod = db.query(Product).filter(Product.ReelLink == reel_link, Product.Active == True).first()
        if prod:
            return prod
        products = db.query(Product).filter(Product.Active == True).all()
        for p in products:
            if p.ReelLink and reel_link in p.ReelLink:
                return p
            p_data = p.ProductData or {}
            if isinstance(p_data, dict):
                if p_data.get("reel_link") == reel_link or p_data.get("reel_id") == reel_link or p_data.get("media_id") == reel_link or p_data.get("ReelLink") == reel_link:
                    return p
        return None

    @classmethod
    def get_product_by_reel_id(cls, db: Session, reel_id: str):
        return cls.get_product_by_reel_link(db, reel_id)

    @classmethod
    def get_product_by_media_id(cls, db: Session, media_id: str):
        """
        Look up a product by Instagram media/reel ID.
        First checks the DB (Product.ProductData['reel_id']), then falls back to reel_products.json.
        Returns a dict with {id, name, price} or None.
        """
        if not media_id:
            return None
            
        # Try DB first
        product = cls.get_product_by_reel_id(db, media_id)
        if product:
            return {
                "id": product.Id,
                "name": product.ProductName,
                "price": product.Price,
            }
        
        # Fallback to JSON config
        config = cls._load_reel_config()
        mapping = config.get("reel_id_mapping", {})
        if media_id in mapping:
            entry = mapping[media_id]
            return {
                "id": entry.get("product_id"),
                "name": entry.get("product_name", "Unknown Product"),
                "price": entry.get("product_price", 0),
            }
        
        return None

    @staticmethod
    def get_product_by_name_or_id(db: Session, identifier: str):
        """
        Try to find a product by ID (UUID), exact name, or partial name match.
        Used when parsing the WhatsApp ORDER: deep-link text.
        """
        if not identifier:
            return None

        # 1. Try by exact ID
        product = db.query(Product).filter(Product.Id == str(identifier), Product.Active == True).first()
        if product:
            return product

        # 2. Try by exact name (case-insensitive)
        product = db.query(Product).filter(
            Product.ProductName.ilike(identifier),
            Product.Active == True
        ).first()
        if product:
            return product
        
        # 3. Try by partial name match
        product = db.query(Product).filter(
            Product.ProductName.ilike(f"%{identifier}%"),
            Product.Active == True
        ).first()
        
        return product

    @staticmethod
    def get_variants_by_product_id(db: Session, product_id: str):
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product or not product.ProductData:
            return []
            
        variants = product.ProductData.get("variants", [])
        return [v for v in variants if v.get("active", True) and v.get("stock_quantity", 0) > 0]

    @staticmethod
    def create_product(db: Session, data):
        product_dict = data.model_dump() if hasattr(data, "model_dump") else data.dict()
        product = Product(**product_dict)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def list_products(
        db: Session,
        seller_id: str | None = None,
        category: str | None = None,
        active_only: bool = False
    ):
        q = db.query(Product)
        if seller_id:
            q = q.filter(Product.SellerId == seller_id)
        if category:
            q = q.filter(Product.Category == category)
        if active_only:
            q = q.filter(Product.Active == True)
        return q.order_by(Product.Id.desc()).all()

    @staticmethod
    def update_product(db: Session, product_id: str, data):
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product:
            return None
        update_data = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)
        if "ProductData" in update_data and update_data["ProductData"] is not None:
            curr_data = dict(product.ProductData or {})
            if isinstance(update_data["ProductData"], dict):
                curr_data.update(update_data["ProductData"])
                product.ProductData = curr_data
                del update_data["ProductData"]
        for key, val in update_data.items():
            setattr(product, key, val)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def add_images_to_product(db: Session, product_id: str, files: List[UploadFile]) -> Optional[Product]:
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product:
            return None
        new_urls = ProductService.save_uploaded_images(files)
        current_images = list(product.Images or [])
        current_images.extend(new_urls)
        product.Images = current_images
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: str):
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True

product_service = ProductService()
