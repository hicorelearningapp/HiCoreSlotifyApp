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
    prod_resp = client.post("/ecommerce/products", json=prod_data)
    assert prod_resp.status_code == 201
    product = prod_resp.json()
    assert product["name"] == f"Kanchipuram Silk Saree {unique_id}"
    product_id = product["id"]

    # 2. List products
    list_resp = client.get("/ecommerce/products")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Add to cart
    cart_resp = client.post(f"/ecommerce/cart/items?customer_phone={unique_phone}", json={
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
    order_resp = client.post("/ecommerce/orders", json=order_payload)
    assert order_resp.status_code == 201
    order = order_resp.json()
    assert order["customer_name"] == "Anitha Raj"
    assert order["total"] == 5000.0
    assert order["status"] == "Pending"

    # 5. List orders
    list_orders_resp = client.get(f"/ecommerce/orders?customer_phone={unique_phone}")
    assert list_orders_resp.status_code == 200
    assert len(list_orders_resp.json()) >= 1

    # 6. Update order status
    status_resp = client.put(f"/ecommerce/orders/{order['id']}/status", json={
        "status": "Confirmed",
        "payment_status": "Paid"
    })
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "Confirmed"
    assert status_resp.json()["payment_status"] == "Paid"

    # 7. Category creation and listing
    cat_resp = client.post("/ecommerce/categories", json={
        "name": f"Category {unique_id}",
        "description": "Test Category"
    })
    assert cat_resp.status_code == 201
    cats_resp = client.get("/ecommerce/categories")
    assert cats_resp.status_code == 200
    assert any(c["name"] == f"Category {unique_id}" for c in cats_resp.json())

    # 8. Product update & delete
    upd_resp = client.put(f"/ecommerce/products/{product_id}", json={"price": 2700.0})
    assert upd_resp.status_code == 200
    assert upd_resp.json()["price"] == 2700.0

    del_resp = client.delete(f"/ecommerce/products/{product_id}")
    assert del_resp.status_code == 204

