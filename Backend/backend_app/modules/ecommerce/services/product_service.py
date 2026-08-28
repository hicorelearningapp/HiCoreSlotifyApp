import json
import os
from backend_app.modules.ecommerce.models.product import Product
from backend_app.modules.ecommerce.models.category import Category as ProductCategory
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
    def get_all_categories(db: Session, store_id: str = "default"):
        return db.query(ProductCategory).filter(ProductCategory.store_id == store_id).all()
        
    @staticmethod
    def get_products_by_category(db: Session, category_id: int):
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            return []
        return db.query(Product).filter(
            Product.category == category.name,
            Product.store_id == category.store_id,
            Product.active == True
        ).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: int):
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_product_by_reel_id(db: Session, reel_id: str):
        return db.query(Product).filter(Product.reel_id == reel_id, Product.active == True).first()

    @classmethod
    def get_product_by_media_id(cls, db: Session, media_id: str):
        """
        Look up a product by Instagram media/reel ID.
        First checks the DB (Product.reel_id), then falls back to reel_products.json.
        Returns a dict with {id, name, price} or None.
        """
        if not media_id:
            return None
            
        # Try DB first
        product = db.query(Product).filter(
            Product.reel_id == media_id, 
            Product.active == True
        ).first()
        
        if product:
            return {
                "id": product.id,
                "name": product.name,
                "price": product.price,
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
        Try to find a product by name (case-insensitive) or by ID.
        Used when parsing the WhatsApp ORDER: deep-link text.
        """
        # Try by ID first
        try:
            product_id = int(identifier)
            product = db.query(Product).filter(Product.id == product_id, Product.active == True).first()
            if product:
                return product
        except (ValueError, TypeError):
            pass
        
        # Try by exact name (case-insensitive)
        product = db.query(Product).filter(
            Product.name.ilike(identifier),
            Product.active == True
        ).first()
        if product:
            return product
        
        # Try by partial name match
        product = db.query(Product).filter(
            Product.name.ilike(f"%{identifier}%"),
            Product.active == True
        ).first()
        
        return product

    @staticmethod
    def get_variants_by_product_id(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or not product.product_data:
            return []
            
        variants = product.product_data.get("variants", [])
        return [v for v in variants if v.get("active", True) and v.get("stock_quantity", 0) > 0]

    @staticmethod
    def create_product(db: Session, data):
        product = Product(
            name=data.name,
            category=data.category,
            product_type=data.product_type,
            price=data.price,
            compare_at_price=data.compare_at_price,
            sku=data.sku,
            stock_quantity=data.stock_quantity,
            unit=data.unit,
            description=data.description,
            image_url=data.image_url,
            images=data.images,
            reel_id=data.reel_id,
            active=data.active,
            store_id=data.store_id or "default",
            product_data=data.product_data or {},
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def list_products(db: Session, store_id: str = "default", category: str | None = None):
        q = db.query(Product)
        if store_id:
            q = q.filter(Product.store_id == store_id)
        if category:
            q = q.filter(Product.category == category)
        return q.all()

    @staticmethod
    def update_product(db: Session, product_id: int, data):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        update_data = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)
        for key, val in update_data.items():
            setattr(product, key, val)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True

product_service = ProductService()
