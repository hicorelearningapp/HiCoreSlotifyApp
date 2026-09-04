from fastapi import APIRouter, Depends, status, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
import os
import shutil
import uuid
import json
from app.core.database import get_db
from app.core.config import settings
from app.modules.ecommerce.schemas import (
    ProductOut, ProductCreate, ProductUpdate, ProductWhatsAppLinkOut,
    ProductCustomerInfoOut, ProductCustomerOptionsOut
)
from app.modules.ecommerce.services.product_service import ProductService


router = APIRouter(prefix="/products", tags=["Ecommerce Products"])

def _save_product_image(photo: Any) -> Optional[str]:
    """Save an uploaded image file directly into Backend/images/products/."""
    if not hasattr(photo, "filename") or not photo.filename:
        return None
    images_dir = os.path.join(settings.IMAGES_DIR, "products")
    os.makedirs(images_dir, exist_ok=True)
    ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(images_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    return f"/images/products/{filename}"

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return ProductService.get_all_categories(db)

@router.get("/categories/{category_id}/products")
def get_products_by_category(category_id: str, db: Session = Depends(get_db)):
    return ProductService.get_products_by_category(db, category_id)

@router.get("/{product_id}/product-info", response_model=ProductCustomerInfoOut, summary="Get customer-facing product information for ordering")
@router.get("/product-info/{product_id}", response_model=ProductCustomerInfoOut, include_in_schema=False)
def get_product_customer_info(product_id: str, db: Session = Depends(get_db)):
    """
    Returns basic product details for customer view / WhatsApp message:
    Id, ProductName, Price, CompareAtPrice, Description, Images, InStock, and StoreName.
    """
    return ProductService.get_product_customer_info(db, product_id=product_id)

@router.get("/{product_id}/product-options", response_model=ProductCustomerOptionsOut, summary="Get product option values for placing order")
@router.get("/product-options/{product_id}", response_model=ProductCustomerOptionsOut, include_in_schema=False)
def get_product_customer_options(product_id: str, db: Session = Depends(get_db)):
    """
    Returns selectable option names and values for placing order:
    e.g. {"Color": ["Red", "Blue"], "Size": ["M", "L"]}
    """
    return ProductService.get_product_customer_options(db, product_id=product_id)

@router.get("/{product_id}/variants")
def get_product_variants(product_id: str, db: Session = Depends(get_db)):
    return ProductService.get_variants_by_product_id(db, product_id)

@router.get("/find/{identifier}")
def find_product(identifier: str, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_name_or_id(db, identifier)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/whatsapp-link", response_model=ProductWhatsAppLinkOut, summary="Generate WhatsApp chat link for a product by Reel link")
def get_product_whatsapp_link(
    reel_link: str = Query(..., description="Instagram or Video Reel URL / Shortcode"),
    db: Session = Depends(get_db)
):
    """
    Given a Reel link, lookup the product, retrieve the seller's registered business phone number
    from the businesses table, and generate a WhatsApp click-to-chat URL with product details.
    """
    return ProductService.get_whatsapp_link_by_reel(db, reel_link=reel_link)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, summary="Create a new product")
async def create_product(
    request: Request,
    ProductName: Optional[str] = Form(None, description="Product title / name"),
    SellerId: Optional[str] = Form(None, description="Seller / Business ID"),
    Category: Optional[str] = Form(None, description="Category classification"),
    Price: Optional[float] = Form(None, description="Selling price"),
    CompareAtPrice: Optional[float] = Form(None, description="Original / MRP price"),
    Sku: Optional[str] = Form(None, description="SKU code"),
    Description: Optional[str] = Form(None, description="Product description"),
    ReelLink: Optional[str] = Form(None, description="Associated Instagram / Video Reel URL"),
    Active: Optional[bool] = Form(True, description="Product visibility status"),
    ProductData: Optional[str] = Form(None, description="Dynamic JSON attributes (e.g. {'Fabric': 'Silk'})"),
    Images: List[Union[UploadFile, str]] = File(
        default=[],
        description="Choose one or multiple product images from your computer or provide URLs",
        json_schema_extra={"items": {"type": "string", "format": "binary"}}
    ),
    db: Session = Depends(get_db)
):
    """
    Create a new product. Supports uploading multiple image files directly from system as well as JSON payloads.
    """
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        form_data: Dict[str, Any] = {}
        uploaded_images: List[str] = []

        # Extract regular form fields
        for key, val in form.items():
            if not hasattr(val, "filename"):
                if val is not None and str(val).strip() != "":
                    form_data[key] = val

        # Extract uploaded image files / URLs
        for field_name in ["Images", "images", "files"]:
            for item in form.getlist(field_name):
                if hasattr(item, "filename") and item.filename:
                    photo_url = _save_product_image(item)
                    if photo_url:
                        uploaded_images.append(photo_url)
                elif isinstance(item, str) and item.strip():
                    uploaded_images.append(item.strip())

        if not uploaded_images:
            for key, val in form.items():
                if hasattr(val, "filename") and val.filename:
                    photo_url = _save_product_image(val)
                    if photo_url:
                        uploaded_images.append(photo_url)
                elif isinstance(val, str) and key.lower() in ["images", "image"] and val.strip():
                    uploaded_images.append(val.strip())

        if uploaded_images:
            form_data["Images"] = uploaded_images

        if "ProductData" in form_data and isinstance(form_data["ProductData"], str):
            try:
                form_data["ProductData"] = json.loads(form_data["ProductData"])
            except Exception:
                form_data["ProductData"] = {}

        parsed_data = ProductCreate(**form_data)
        return ProductService.create_product(db, parsed_data)

    elif "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            body = {}
        parsed_data = ProductCreate(**body)
        return ProductService.create_product(db, parsed_data)

    # Direct form parameters fallback
    form_dict: Dict[str, Any] = {
        "ProductName": ProductName or "",
        "SellerId": SellerId,
        "Category": Category,
        "Price": Price if Price is not None else 0.0,
        "CompareAtPrice": CompareAtPrice,
        "Sku": Sku,
        "Description": Description,
        "ReelLink": ReelLink,
        "Active": Active if Active is not None else True,
        "ProductData": {}
    }
    if Images:
        saved_urls = []
        for img in Images:
            if hasattr(img, "filename") and img.filename:
                photo_url = _save_product_image(img)
                if photo_url:
                    saved_urls.append(photo_url)
            elif isinstance(img, str) and img.strip():
                saved_urls.append(img.strip())
        if saved_urls:
            form_dict["Images"] = saved_urls
    if ProductData:
        try:
            form_dict["ProductData"] = json.loads(ProductData) if isinstance(ProductData, str) else ProductData
        except Exception:
            form_dict["ProductData"] = {}

    parsed_data = ProductCreate(**form_dict)
    return ProductService.create_product(db, parsed_data)

@router.get("", response_model=List[ProductOut])
def list_products(
    seller_id: Optional[str] = Query(None, description="Filter products by Seller / Merchant ID (Multi-Seller)"),
    category: Optional[str] = Query(None, description="Filter products by Category"),
    active_only: bool = Query(False, description="Filter active products only"),
    db: Session = Depends(get_db)
):
    return ProductService.list_products(db, seller_id=seller_id, category=category, active_only=active_only)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut, summary="Update an existing product")
async def update_product(
    product_id: str,
    request: Request,
    ProductName: Optional[str] = Form(None, description="Product title / name"),
    SellerId: Optional[str] = Form(None, description="Seller / Business ID"),
    Category: Optional[str] = Form(None, description="Category classification"),
    Price: Optional[float] = Form(None, description="Selling price"),
    CompareAtPrice: Optional[float] = Form(None, description="Original / MRP price"),
    Sku: Optional[str] = Form(None, description="SKU code"),
    Description: Optional[str] = Form(None, description="Product description"),
    ReelLink: Optional[str] = Form(None, description="Associated Instagram / Video Reel URL"),
    Active: Optional[bool] = Form(None, description="Product visibility status"),
    ProductData: Optional[str] = Form(None, description="Dynamic JSON attributes"),
    Images: List[Union[UploadFile, str]] = File(
        default=[],
        description="Choose one or multiple product images to add from your computer or provide URLs",
        json_schema_extra={"items": {"type": "string", "format": "binary"}}
    ),
    db: Session = Depends(get_db)
):
    """
    Update a product. Supports uploading multiple image files directly from system as well as JSON payloads.
    """
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        form_data: Dict[str, Any] = {}
        uploaded_images: List[str] = []

        # Extract regular form fields
        for key, val in form.items():
            if not hasattr(val, "filename"):
                if val is not None and str(val).strip() != "":
                    form_data[key] = val

        # Extract uploaded image files / URLs
        for field_name in ["Images", "images", "files"]:
            for item in form.getlist(field_name):
                if hasattr(item, "filename") and item.filename:
                    photo_url = _save_product_image(item)
                    if photo_url:
                        uploaded_images.append(photo_url)
                elif isinstance(item, str) and item.strip():
                    uploaded_images.append(item.strip())

        if not uploaded_images:
            for key, val in form.items():
                if hasattr(val, "filename") and val.filename:
                    photo_url = _save_product_image(val)
                    if photo_url:
                        uploaded_images.append(photo_url)
                elif isinstance(val, str) and key.lower() in ["images", "image"] and val.strip():
                    uploaded_images.append(val.strip())

        if uploaded_images:
            existing_prod = ProductService.get_product_by_id(db, product_id)
            curr_images = list(existing_prod.Images or []) if existing_prod else []
            curr_images.extend(uploaded_images)
            form_data["Images"] = curr_images

        if "ProductData" in form_data and isinstance(form_data["ProductData"], str):
            try:
                form_data["ProductData"] = json.loads(form_data["ProductData"])
            except Exception:
                form_data["ProductData"] = {}

        parsed_data = ProductUpdate(**form_data)
        product = ProductService.update_product(db, product_id, parsed_data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    elif "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            body = {}
        parsed_data = ProductUpdate(**body)
        product = ProductService.update_product(db, product_id, parsed_data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    # Direct form parameters fallback
    form_dict: Dict[str, Any] = {}
    if ProductName is not None:
        form_dict["ProductName"] = ProductName
    if SellerId is not None:
        form_dict["SellerId"] = SellerId
    if Category is not None:
        form_dict["Category"] = Category
    if Price is not None:
        form_dict["Price"] = Price
    if CompareAtPrice is not None:
        form_dict["CompareAtPrice"] = CompareAtPrice
    if Sku is not None:
        form_dict["Sku"] = Sku
    if Description is not None:
        form_dict["Description"] = Description
    if ReelLink is not None:
        form_dict["ReelLink"] = ReelLink
    if Active is not None:
        form_dict["Active"] = Active
    if Images:
        saved_urls = []
        for img in Images:
            if hasattr(img, "filename") and img.filename:
                photo_url = _save_product_image(img)
                if photo_url:
                    saved_urls.append(photo_url)
            elif isinstance(img, str) and img.strip():
                saved_urls.append(img.strip())
        if saved_urls:
            existing_prod = ProductService.get_product_by_id(db, product_id)
            curr_images = list(existing_prod.Images or []) if existing_prod else []
            curr_images.extend(saved_urls)
            form_dict["Images"] = curr_images
    if ProductData:
        try:
            form_dict["ProductData"] = json.loads(ProductData) if isinstance(ProductData, str) else ProductData
        except Exception:
            pass

    parsed_data = ProductUpdate(**form_dict)
    product = ProductService.update_product(db, product_id, parsed_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    success = ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None
