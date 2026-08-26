import pytest
import uuid
from fastapi.testclient import TestClient
from backend_app.main import app

client = TestClient(app)

def test_ecommerce_product_and_order_flow():
    unique_id = uuid.uuid4().hex[:6]
    unique_sku = f"SILK-SAR-{unique_id}"
    unique_phone = f"9198{unique_id[:8]}"

    # 1. Create a product
    prod_data = {
        "name": f"Kanchipuram Silk Saree {unique_id}",
        "category": "Sarees",
        "product_type": "Traditional",
        "price": 2500.0,
        "compare_at_price": 3000.0,
        "sku": unique_sku,
        "stock_quantity": 50,
        "description": "Pure silk saree with golden border",
        "active": True
    }
    prod_resp = client.post("/api/v1/ecommerce/products", json=prod_data)
    assert prod_resp.status_code == 201
    product = prod_resp.json()
    assert product["name"] == f"Kanchipuram Silk Saree {unique_id}"
    product_id = product["id"]

    # 2. List products
    list_resp = client.get("/api/v1/ecommerce/products")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Add to cart
    cart_resp = client.post(f"/api/v1/ecommerce/cart/items?customer_phone={unique_phone}", json={
        "product_id": product_id,
        "quantity": 2
    })
    assert cart_resp.status_code == 200
    cart = cart_resp.json()
    assert cart["total_amount"] == 5000.0

    # 4. Create an order
    order_payload = {
        "customer_phone": unique_phone,
        "customer_name": "Anitha Raj",
        "customer_email": "anitha@example.com",
        "shipping_address": "45 Lakeview Rd",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600028",
        "payment_method": "COD",
        "items": [
            {
                "product_id": product_id,
                "quantity": 2,
                "unit_price": 2500.0
            }
        ]
    }
    order_resp = client.post("/api/v1/ecommerce/orders", json=order_payload)
    assert order_resp.status_code == 201
    order = order_resp.json()
    assert order["customer_name"] == "Anitha Raj"
    assert order["total"] == 5000.0
    assert order["status"] == "Pending"

    # 5. Update order status
    status_resp = client.put(f"/api/v1/ecommerce/orders/{order['id']}/status", json={
        "status": "Confirmed",
        "payment_status": "Paid"
    })
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "Confirmed"
    assert status_resp.json()["payment_status"] == "Paid"
