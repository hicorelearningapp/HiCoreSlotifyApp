import sys
import os

# Ensure this script is run from the SlotifyBackend folder on your server!
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from app.core.database import SessionLocal
from app.modules.ecommerce.models.category import Category
from app.modules.ecommerce.models.product import Product

def seed_ecommerce():
    db = SessionLocal()
    
    # This matches the Business Phone Number in your simulator
    store_id = "1234567890"

    print(f"Creating categories for store {store_id}...")
    cat1 = Category(name="Electronics", description="Gadgets and devices", store_id=store_id)
    cat2 = Category(name="Clothing", description="Apparel and fashion", store_id=store_id)
    
    db.add(cat1)
    db.add(cat2)
    db.commit()
    db.refresh(cat1)
    db.refresh(cat2)
    
    print("Creating products...")
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
            "options": [
                {"name": "Color", "values": ["Red", "Blue"]},
                {"name": "Size", "values": ["Small", "Large"]}
            ],
            "variants": [
                {"id": 1, "options": {"Color": "Red", "Size": "Small"}, "price": 19.99, "stock_quantity": 20, "active": True},
                {"id": 2, "options": {"Color": "Red", "Size": "Large"}, "price": 24.99, "stock_quantity": 10, "active": True},
                {"id": 3, "options": {"Color": "Blue", "Size": "Small"}, "price": 19.99, "stock_quantity": 5, "active": True}
            ]
        }
    )
    
    db.add(prod1)
    db.add(prod2)
    db.commit()
    
    print(f"Successfully seeded categories and products for store {store_id}!")
    db.close()

if __name__ == "__main__":
    seed_ecommerce()
