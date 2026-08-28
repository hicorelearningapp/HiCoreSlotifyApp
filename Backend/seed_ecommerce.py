import sys
import os

# Add Backend to path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend_app")))

from backend_app.core.database import SessionLocal
from backend_app.modules.ecommerce.models.category import Category
from backend_app.modules.ecommerce.models.product import Product

def seed_data():
    db = SessionLocal()
    
    store_id = "1234567890"

    # Create Categories
    cat1 = Category(name="Electronics", description="Gadgets and electronics", store_id=store_id)
    cat2 = Category(name="Clothing", description="Apparel and fashion", store_id=store_id)
    
    db.add(cat1)
    db.add(cat2)
    db.commit()
    db.refresh(cat1)
    db.refresh(cat2)
    
    # Create Products
    prod1 = Product(
        name="Wireless Headphones", 
        category=cat1.name, 
        price=99.99, 
        stock_quantity=50, 
        store_id=store_id, 
        active=True
    )
    prod2 = Product(
        name="T-Shirt", 
        category=cat2.name, 
        price=19.99, 
        stock_quantity=100, 
        store_id=store_id, 
        active=True,
        product_data={
            "variants": [
                {"id": 1, "variant_name": "Small / Red", "price": 19.99, "stock_quantity": 20, "active": True},
                {"id": 2, "variant_name": "Large / Red", "price": 24.99, "stock_quantity": 10, "active": True}
            ]
        }
    )
    
    db.add(prod1)
    db.add(prod2)
    db.commit()
    
    print("Successfully seeded categories and products for store 1234567890!")
    db.close()

if __name__ == "__main__":
    seed_data()
