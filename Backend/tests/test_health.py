import pytest
from fastapi.testclient import TestClient
from backend_app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "supported_domains" in data
    assert "doctor_appointment" in data["supported_domains"]
    assert "ecommerce" in data["supported_domains"]

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_system_status():
    response = client.get("/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["modules"]["doctor_appointment"] == "active"
    assert data["modules"]["ecommerce"] == "active"
