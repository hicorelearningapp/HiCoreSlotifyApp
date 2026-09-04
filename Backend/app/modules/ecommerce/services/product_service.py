import json
import os
import shutil
import uuid
import re
import urllib.parse
from typing import List, Optional, Union
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.modules.ecommerce.models.product import Product
from app.modules.ecommerce.models.category import Category as ProductCategory
from app.modules.ecommerce.models.inventory import Inventory
from app.common.models.business import Business
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
    def _extract_reel_shortcode(reel_str: str) -> Optional[str]:
        if not reel_str:
            return None
        clean = str(reel_str).split('?')[0].split('#')[0].strip().rstrip('/')
        match = re.search(r'/(?:reel|reels|p|share/reel)/([A-Za-z0-9_-]+)', clean, re.IGNORECASE)
        if match:
            return match.group(1)
        if re.match(r'^[A-Za-z0-9_-]+$', clean):
            return clean
        return None

    @classmethod
    def get_product_by_reel_link(cls, db: Session, reel_link: str) -> Optional[Product]:
        if not reel_link:
            return None

        clean_input = str(reel_link).strip()
        base_input = clean_input.split('?')[0].split('#')[0].rstrip('/')
        input_code = cls._extract_reel_shortcode(clean_input)

        # 1. Exact match on ReelLink
        prod = db.query(Product).filter(Product.ReelLink == clean_input, Product.Active == True).first()
        if prod:
            return prod

        if base_input and base_input != clean_input:
            prod = db.query(Product).filter(Product.ReelLink == base_input, Product.Active == True).first()
            if prod:
                return prod

        # 2. Iterate active products for normalized matching, shortcode match, substring, or ProductData json
        products = db.query(Product).filter(Product.Active == True).all()
        for p in products:
            if p.ReelLink:
                p_clean = str(p.ReelLink).strip()
                p_base = p_clean.split('?')[0].split('#')[0].rstrip('/')
                p_code = cls._extract_reel_shortcode(p_clean)

                if clean_input.lower() == p_clean.lower() or (base_input and base_input.lower() == p_base.lower()):
                    return p
                if input_code and p_code and input_code == p_code:
                    return p
                if (clean_input in p_clean) or (p_clean in clean_input) or (base_input and base_input in p_clean) or (p_base and p_base in clean_input):
                    return p

            p_data = p.ProductData or {}
            if isinstance(p_data, dict):
                for key in ["reel_link", "reel_id", "media_id", "ReelLink", "ReelId", "shortcode"]:
                    val = p_data.get(key)
                    if val is not None:
                        val_str = str(val).strip()
                        if val_str == clean_input or val_str == base_input:
                            return p
                        if input_code and (val_str == input_code or cls._extract_reel_shortcode(val_str) == input_code):
                            return p
        return None

    @classmethod
    def get_whatsapp_link_by_reel(cls, db: Session, reel_link: str) -> dict:
        """
        Lookup product by reel link, retrieve registered seller's business phone number,
        and generate a WhatsApp click-to-chat URL with product details.
        """
        if not reel_link or not str(reel_link).strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reel link parameter is required."
            )

        product = cls.get_product_by_reel_link(db, reel_link)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found for the provided Reel link: '{reel_link}'."
            )

        if not product.SellerId:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{product.ProductName}' (ID: {product.Id}) does not have an associated Seller ID."
            )

        # Lookup business in business register table
        business = db.query(Business).filter(Business.Id == product.SellerId).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Registered business/seller with ID '{product.SellerId}' not found for product '{product.ProductName}'."
            )

        # Extract business phone number
        phone = business.BusinessPhoneNumber or getattr(business, "WhatsAppNumber", None) or business.MobileNumber
        if not phone or not str(phone).strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Business '{business.BusinessName}' does not have a registered phone number."
            )

        # Format phone number for WhatsApp link (digits only, e.g. 919876543210)
        clean_digits = re.sub(r"\D", "", str(phone).strip())
        if clean_digits.startswith("0"):
            clean_digits = clean_digits[1:]
        if len(clean_digits) == 10:
            clean_digits = f"91{clean_digits}"

        # Message contains product id only
        msg = str(product.Id)

        encoded_msg = urllib.parse.quote(msg)
        whatsapp_link = f"https://wa.me/{clean_digits}?text={encoded_msg}"

        return {
            "WhatsAppLink": whatsapp_link
        }

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

    @classmethod
    def get_product_customer_info(cls, db: Session, product_id: str) -> dict:
        """
        Returns only necessary customer-facing details of a product needed for placing an order:
        Product ID, title, selling price, MRP (CompareAtPrice), description, images,
        in-stock status, and store name.
        """
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' not found."
            )

        # Store name lookup
        store_name = None
        if product.SellerId:
            business = db.query(Business).filter(Business.Id == product.SellerId).first()
            if business:
                store_name = business.BusinessName

        # Stock check
        inv_items = db.query(Inventory).filter(Inventory.ProductId == product_id).all()
        p_data = product.ProductData or {}
        if not isinstance(p_data, dict):
            p_data = {}

        if inv_items:
            stock_qty = sum(item.StockQuantity for item in inv_items)
        elif "stock_quantity" in p_data:
            try:
                stock_qty = int(p_data["stock_quantity"])
            except (ValueError, TypeError):
                stock_qty = 0
        elif "variants" in p_data and isinstance(p_data["variants"], list):
            stock_qty = sum(
                int(v.get("stock_quantity", 0))
                for v in p_data["variants"]
                if isinstance(v, dict) and v.get("active", True)
            )
        else:
            stock_qty = 10 if product.Active else 0

        in_stock = stock_qty > 0 and bool(product.Active)

        return {
            "Id": product.Id,
            "ProductName": product.ProductName,
            "Price": float(product.Price or 0.0),
            "CompareAtPrice": float(product.CompareAtPrice) if product.CompareAtPrice is not None else None,
            "Description": product.Description,
            "Images": list(product.Images or []),
            "InStock": in_stock,
            "StoreName": store_name
        }

    @classmethod
    def get_product_customer_options(cls, db: Session, product_id: str) -> dict:
        """
        Returns only the selectable options and their available values where data is present for placing an order:
        e.g. {"Colors": ["Red", "Green", "Pink", "Black"], "Sizes": ["S", "M", "L", "XL"]}
        Excludes empty lists, empty strings, and internal non-option attributes.
        """
        product = db.query(Product).filter(Product.Id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' not found."
            )

        p_data = product.ProductData or {}
        if not isinstance(p_data, dict):
            p_data = {}

        options_map: dict = {}

        # 1. Process explicit 'options' or 'Options' field if present
        raw_options = p_data.get("options") or p_data.get("Options")
        if isinstance(raw_options, dict):
            for opt_name, vals in raw_options.items():
                if isinstance(vals, list):
                    clean_vals = [str(v).strip() for v in vals if v is not None and str(v).strip() != ""]
                    if clean_vals:
                        options_map[opt_name] = clean_vals
                elif isinstance(vals, str) and vals.strip():
                    options_map[opt_name] = [vals.strip()]
        elif isinstance(raw_options, list):
            for opt in raw_options:
                if isinstance(opt, dict) and ("name" in opt or "Name" in opt):
                    group_name = opt.get("name") or opt.get("Name")
                    vals = opt.get("values") or opt.get("Values") or opt.get("options") or opt.get("Options") or []
                    if isinstance(vals, list):
                        clean_vals = [str(v).strip() for v in vals if v is not None and str(v).strip() != ""]
                        if group_name and clean_vals:
                            options_map[group_name] = clean_vals
                    elif isinstance(vals, str) and vals.strip():
                        if group_name:
                            options_map[group_name] = [vals.strip()]

        # 2. Process all top-level list keys in ProductData (e.g. Colors, Sizes, ChainLengths, PendantDesigns)
        non_option_keys = {
            "tags", "tag", "highlights", "highlight", "images", "image",
            "photos", "features", "key_features", "specifications",
            "variants", "options", "internal_notes", "seo_keywords"
        }
        for key, val in p_data.items():
            if str(key).lower() in non_option_keys:
                continue
            if isinstance(val, list):
                clean_vals = [str(v).strip() for v in val if v is not None and str(v).strip() != ""]
                # Only include where data is present (non-empty)
                if clean_vals and key not in options_map:
                    options_map[key] = clean_vals

        # 3. Process variants (if any variants have options not yet captured)
        raw_variants = p_data.get("variants") or p_data.get("Variants")
        if isinstance(raw_variants, list) and len(raw_variants) > 0:
            for v in raw_variants:
                if not isinstance(v, dict):
                    continue
                var_options = v.get("options") or v.get("Options")
                if isinstance(var_options, dict):
                    for ok, ov in var_options.items():
                        if ov is not None and str(ov).strip() != "":
                            val_str = str(ov).strip()
                            if ok not in options_map:
                                options_map[ok] = []
                            if val_str not in options_map[ok]:
                                options_map[ok].append(val_str)
                else:
                    for k, val in v.items():
                        if k.lower() in {"id", "variant_id", "sku", "price", "stock_quantity", "stock", "active", "image", "image_url"}:
                            continue
                        if val is not None and str(val).strip() != "":
                            val_str = str(val).strip()
                            if k not in options_map:
                                options_map[k] = []
                            if val_str not in options_map[k]:
                                options_map[k].append(val_str)

        # Final pass: guarantee only non-empty option lists are returned as [{"PropertyName": ..., "PropertyValues": [...]}]
        result = []
        for prop_name, prop_vals in options_map.items():
            if isinstance(prop_vals, list) and len(prop_vals) > 0:
                result.append({
                    "PropertyName": prop_name,
                    "PropertyValues": prop_vals
                })
        return result

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
