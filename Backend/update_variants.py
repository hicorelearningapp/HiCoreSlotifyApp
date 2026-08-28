import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend_app")))

from backend_app.core.database import SessionLocal
from backend_app.modules.ecommerce.models.product import Product

def update_product_variants():
    db = SessionLocal()
    
    prod = db.query(Product).filter(Product.name == "T-Shirt").first()
    if prod:
        prod.product_data = {
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
        db.commit()
        print("Updated T-Shirt product with multi-dimensional variants.")
    else:
        print("T-Shirt not found.")
        
    db.close()

if __name__ == "__main__":
    update_product_variants()
