import requests
from sqlalchemy.orm import Session
from backend_app.modules.ecommerce.models.product import Product, ProductVariant
from backend_app.modules.doctor_appointment.schemas.admin_schemas import ProductCreate, ProductUpdate, VariantCreate, StockUpdate
from config import (
    INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_HTTP_TIMEOUT,
)
from backend_app.modules.ecommerce.models.category import Category
from backend_app.modules.doctor_appointment.schemas.admin_schemas import CategoryCreate, CategoryUpdate

class AdminService:
    @staticmethod
    def get_all_products_with_variants(db: Session):
        products = db.query(Product).all()
        result = []
        for p in products:
            variants = db.query(ProductVariant).filter(ProductVariant.product_id == p.id).all()
            result.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "reel_id": p.reel_id,
                "active": p.active,
                "variants": [
                    {
                        "id": v.id,
                        "variant_name": v.variant_name,
                        "sku": v.sku,
                        "price": v.price,
                        "stock_quantity": v.stock_quantity,
                        "active": v.active
                    } for v in variants
                ]
            })
        return result

    @staticmethod
    def create_category(db: Session, payload: CategoryCreate):
        new_category = Category(
            name=payload.name,
            description=payload.description
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category

    @staticmethod
    def update_category(db: Session, category_id: int, payload: CategoryUpdate):
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return None
            
        if payload.name is not None:
            category.name = payload.name
        if payload.description is not None:
            category.description = payload.description
            
        db.commit()
        return category

    @staticmethod
    def create_product(db: Session, payload: ProductCreate):
        new_product = Product(
            name=payload.name,
            description=payload.description,
            price=payload.price,
            category_id=payload.category_id,
            active=True
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product

    @staticmethod
    def update_product(db: Session, product_id: int, payload: ProductUpdate):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
            
        if payload.reel_id is not None:
            product.reel_id = payload.reel_id
        if payload.active is not None:
            product.active = payload.active
            
        db.commit()
        return product

    @staticmethod
    def create_variant(db: Session, product_id: int, payload: VariantCreate):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
            
        new_variant = ProductVariant(
            product_id=product.id,
            variant_name=payload.variant_name,
            sku=payload.sku,
            price=payload.price,
            stock_quantity=payload.stock_quantity,
            active=True
        )
        db.add(new_variant)
        db.commit()
        db.refresh(new_variant)
        return new_variant

    @staticmethod
    def update_variant_stock(db: Session, variant_id: int, payload: StockUpdate):
        variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
        if not variant:
            return None
            
        variant.stock_quantity = payload.stock_quantity
        db.commit()
        return variant

    @staticmethod
    def fetch_instagram_media(instagram_account_id: str = None, limit: int = 20):
        """List recent media for one connected Instagram account.

        Each vendor has its own token, so the account whose media is wanted has
        to be named. The old global INSTAGRAM_ACCESS_TOKEN is only a fallback
        for a single-account install; it is blank once vendors are connected.

        The returned `id` of each item is what goes in Product.reel_id -- it is
        the media ID the comment webhook sends, not the permalink.
        """
        access_token = None
        if instagram_account_id:
            # Imported here: this ecommerce service is loaded early and the
            # connection service pulls in the model layer.
            from backend_app.core.database import db_session
            from core.channels.instagram.services.instagram_connection_service import (
                instagram_connection_service,
            )
            access_token = instagram_connection_service.get_access_token(
                db_session, instagram_account_id
            )
            if not access_token:
                raise ValueError(
                    f"No active Instagram connection for account {instagram_account_id}"
                )
        else:
            access_token = INSTAGRAM_ACCESS_TOKEN
            if not access_token:
                raise ValueError(
                    "instagram_account_id is required (no global "
                    "INSTAGRAM_ACCESS_TOKEN is configured)"
                )

        url = f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/me/media"
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {access_token}"},
            params={
                "fields": "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp",
                "limit": limit,
            },
            timeout=INSTAGRAM_HTTP_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()

admin_service = AdminService()
