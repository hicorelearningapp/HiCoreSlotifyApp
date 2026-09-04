from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    # Common core fields in PascalCase
    ProductName: str = Field(..., description="Product title / name")
    SellerId: Optional[str] = Field(None, description="Seller / Business ID for multi-seller marketplace")
    Category: Optional[str] = Field(None, description="Category classification")
    Price: float = Field(0.0, ge=0.0, description="Selling price")
    CompareAtPrice: Optional[float] = Field(None, ge=0.0, description="Original / MRP / Compare at price")
    Sku: Optional[str] = Field(None, description="Stock Keeping Unit (SKU)")
    Description: Optional[str] = Field(None, description="Detailed product description")
    Images: Optional[List[str]] = Field(default_factory=list, description="List of all product image URLs")
    ReelLink: Optional[str] = Field(None, description="Associated Instagram / video reel link or URL")
    Active: bool = Field(True, description="Product visibility status")
    
    # Dynamic JSON payload for all other seller/product/category attributes
    ProductData: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Dynamic JSON data for all other seller/product attributes (brand, specifications, variants, tags, etc.)"
    )

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    ProductName: Optional[str] = None
    SellerId: Optional[str] = None
    Category: Optional[str] = None
    Price: Optional[float] = None
    CompareAtPrice: Optional[float] = None
    Sku: Optional[str] = None
    Description: Optional[str] = None
    Images: Optional[List[str]] = None
    ReelLink: Optional[str] = None
    Active: Optional[bool] = None
    ProductData: Optional[Dict[str, Any]] = None

class ProductOut(ProductBase):
    Id: str
    CreatedAt: Optional[datetime] = None
    UpdatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductWhatsAppLinkOut(BaseModel):
    WhatsAppLink: str = Field(..., description="Generated WhatsApp click-to-chat URL")

    class Config:
        from_attributes = True

class ProductCustomerInfoOut(BaseModel):
    Id: str = Field(..., description="Product ID")
    ProductName: str = Field(..., description="Product title / name")
    Price: float = Field(0.0, description="Current selling price")
    CompareAtPrice: Optional[float] = Field(None, description="Original / MRP price")
    Description: Optional[str] = Field(None, description="Detailed product description")
    Images: List[str] = Field(default_factory=list, description="Product image URLs")
    InStock: bool = Field(True, description="Whether the product is currently in stock")
    StoreName: Optional[str] = Field(None, description="Seller / Store business name")

    class Config:
        from_attributes = True

class ProductOptionItemOut(BaseModel):
    PropertyName: str = Field(..., description="Option / property name, e.g. Color, Size, ChainLengths")
    PropertyValues: List[str] = Field(default_factory=list, description="Available selectable values, e.g. ['Red', 'Blue']")

# ProductCustomerOptionsOut returns list of option items: [{"PropertyName": "Color", "PropertyValues": ["Red", "Blue"]}]
ProductCustomerOptionsOut = List[ProductOptionItemOut]




