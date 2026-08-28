import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ecommerce_product_and_order_flow():
    unique_id = uuid.uuid4().hex[:6]
    unique_sku = f"SILK-SAR-{unique_id}"
    unique_phone = f"9198{unique_id[:8]}"

    # 1. Create a product with category field directly
    prod_data = {
        "name": f"Kanchipuram Silk Saree {unique_id}",
        "category": "Sarees",
        "product_type": "Traditional",
        "price": 2500.0,
        "compare_at_price": 3000.0,
        "sku": unique_sku,
        "stock_quantity": 50,
        "description": "Pure silk saree with golden border",
        "active": True,
        "product_data": {
            "fabric": "Silk",
            "border_type": "Zari"
        }
    }
    prod_resp = client.post("/ecommerce/products", json=prod_data)
    assert prod_resp.status_code == 201
    product = prod_resp.json()
    assert product["name"] == f"Kanchipuram Silk Saree {unique_id}"
    assert product["category"] == "Sarees"
    assert product["product_data"]["fabric"] == "Silk"
    product_id = product["id"]

    # 2. List products & filter by category
    list_resp = client.get("/ecommerce/products")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    cat_filter_resp = client.get("/ecommerce/products?category=Sarees")
    assert cat_filter_resp.status_code == 200
    assert any(p["id"] == product_id for p in cat_filter_resp.json())

    # 3. Create an order directly with items
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
    order_resp = client.post("/ecommerce/orders", json=order_payload)
    assert order_resp.status_code == 201
    order = order_resp.json()
    assert order["customer_name"] == "Anitha Raj"
    assert order["total"] == 5000.0
    assert order["status"] == "Pending"

    # 4. List orders
    list_orders_resp = client.get(f"/ecommerce/orders?customer_phone={unique_phone}")
    assert list_orders_resp.status_code == 200
    assert len(list_orders_resp.json()) >= 1

    # 5. Update order status
    status_resp = client.put(f"/ecommerce/orders/{order['id']}/status", json={
        "status": "Confirmed",
        "payment_status": "Paid"
    })
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "Confirmed"
    assert status_resp.json()["payment_status"] == "Paid"

    # 6. Product update & delete
    upd_resp = client.put(f"/ecommerce/products/{product_id}", json={"price": 2700.0})
    assert upd_resp.status_code == 200
    assert upd_resp.json()["price"] == 2700.0

    del_resp = client.delete(f"/ecommerce/products/{product_id}")
    assert del_resp.status_code == 204
