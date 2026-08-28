import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_multi_industry_business_registration_and_login():
    unique_id = uuid.uuid4().hex[:6]

    # 1. Register a Healthcare / Doctor Appointment Business
    health_payload = {
        "BusinessName": f"Apollo Health Center {unique_id}",
        "IndustryType": "doctor_appointment",
        "OwnerName": "Dr. V. Raman",
        "EmailAddress": f"apollo_{unique_id}@example.com",
        "MobileNumber": f"91981{unique_id[:5]}",
        "BusinessPhoneNumber": f"91981{unique_id[:5]}",
        "Address": "100 Hospital Rd",
        "City": "Chennai",
        "State": "Tamil Nadu",
        "Pincode": "600001",
        "Country": "India",
        "UserName": f"apollo_clinic_{unique_id}",
        "Password": "securepassword123",
        "IndustryData": {
            "specialization": "Multi-Speciality",
            "departments": ["Cardiology", "Neurology", "Pediatrics"],
            "consultation_fee": 700.0,
            "appointment_slot_duration": 15,
            "has_emergency_service": True
        }
    }

    reg_resp = client.post("/businesses/register", json=health_payload)
    assert reg_resp.status_code == 201
    business_out = reg_resp.json()
    assert business_out["BusinessName"] == f"Apollo Health Center {unique_id}"
    assert business_out["IndustryType"] == "doctor_appointment"
    assert business_out["Status"] == "Pending"
    assert business_out["IndustryData"]["consultation_fee"] == 700.0
    assert business_out["IndustryData"]["departments"] == ["Cardiology", "Neurology", "Pediatrics"]
    business_id = business_out["Id"]

    # 2. Register an E-Commerce Business
    ecom_payload = {
        "BusinessName": f"Royal Silk Boutique {unique_id}",
        "IndustryType": "ecommerce",
        "OwnerName": "Meena Kumari",
        "EmailAddress": f"royalsilk_{unique_id}@example.com",
        "MobileNumber": f"91982{unique_id[:5]}",
        "BusinessPhoneNumber": f"91982{unique_id[:5]}",
        "Address": "24 Silk Bazaar",
        "City": "Kanchipuram",
        "State": "Tamil Nadu",
        "Pincode": "631501",
        "Country": "India",
        "UserName": f"royalsilk_{unique_id}",
        "Password": "securepassword123",
        "IndustryData": {
            "store_type": "Apparel & Textiles",
            "supported_currencies": ["INR", "USD"],
            "free_shipping_threshold": 1999.0,
            "gst_number": f"33AAACL{unique_id.upper()}1Z5"
        }
    }
    ecom_resp = client.post("/businesses/register", json=ecom_payload)
    assert ecom_resp.status_code == 201
    ecom_out = ecom_resp.json()
    assert ecom_out["IndustryType"] == "ecommerce"
    assert ecom_out["IndustryData"]["gst_number"].startswith("33AAACL")

    # 3. Test duplicate registration rejection
    dup_resp = client.post("/businesses/register", json=health_payload)
    assert dup_resp.status_code == 400

    # 4. Test Business Login
    login_resp = client.post("/businesses/login", json={
        "UserName": f"apollo_clinic_{unique_id}",
        "Password": "securepassword123"
    })
    assert login_resp.status_code == 200
    login_out = login_resp.json()
    assert login_out["status"] == "success"
    assert "access_token" in login_out
    assert login_out["business"]["Id"] == business_id

    # 5. List businesses filterable by industry
    list_all = client.get("/businesses")
    assert list_all.status_code == 200
    assert len(list_all.json()) >= 2

    filter_health = client.get("/businesses?industry_type=doctor_appointment")
    assert filter_health.status_code == 200
    assert all(b["IndustryType"] == "doctor_appointment" for b in filter_health.json())

    filter_ecom = client.get("/businesses?industry_type=ecommerce")
    assert filter_ecom.status_code == 200
    assert all(b["IndustryType"] == "ecommerce" for b in filter_ecom.json())

    # 6. Get single business
    get_resp = client.get(f"/businesses/{business_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["Id"] == business_id

    # 7. Update business profile and industry JSON data
    update_resp = client.put(f"/businesses/{business_id}", json={
        "Status": "Approved",
        "IsVerified": True,
        "IndustryData": {
            "consultation_fee": 850.0,
            "weekend_hours": "09:00-13:00"
        }
    })
    assert update_resp.status_code == 200
    updated_out = update_resp.json()
    assert updated_out["Status"] == "Approved"
    assert updated_out["IsVerified"] is True
    assert updated_out["IndustryData"]["consultation_fee"] == 850.0
    # verify merged fields
    assert updated_out["IndustryData"]["departments"] == ["Cardiology", "Neurology", "Pediatrics"]
    assert updated_out["IndustryData"]["weekend_hours"] == "09:00-13:00"

    # 8. Delete business
    del_resp = client.delete(f"/businesses/{business_id}")
    assert del_resp.status_code == 200
    del_check = client.get(f"/businesses/{business_id}")
    assert del_check.status_code == 404
