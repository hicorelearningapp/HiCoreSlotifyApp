import pytest
import uuid
from fastapi.testclient import TestClient
from datetime import date
from backend_app.main import app

client = TestClient(app)

def create_test_doctor():
    unique_id = uuid.uuid4().hex[:8]
    doc_data = {
        "FullName": f"Dr. Ramesh {unique_id}",
        "Qualification": "MBBS, MD",
        "Specialization": "Cardiology",
        "MedicalRegistrationNumber": f"REG-{unique_id}",
        "YearsOfExperience": 12,
        "DateOfBirth": "1985-05-15",
        "Gender": "Male",
        "MobileNumber": f"91987{unique_id[:7]}",
        "EmailAddress": f"doctor_{unique_id}@example.com",
        "ClinicName": "Heart Care Clinic",
        "ClinicAddress": "123 Main St, Anna Nagar",
        "City": "Chennai",
        "State": "Tamil Nadu",
        "Pincode": "600040",
        "Country": "India",
        "ClinicConsultationFee": 500.0,
        "ConsultationDuration": 15,
        "MaximumPatientsPerDay": 30,
        "Password": "password123",
        "UserName": f"dr_ramesh_{unique_id}"
    }
    resp = client.post("/doctors/register", json=doc_data)
    assert resp.status_code == 201
    return resp.json()

def test_doctor_registration_and_login():
    doc_out = create_test_doctor()
    assert "Dr. Ramesh" in doc_out["FullName"]

    # Test login
    login_resp = client.post("/doctors/login", json={"UserName": doc_out["UserName"], "Password": "password123"})
    assert login_resp.status_code == 200
    assert login_resp.json()["Id"] == doc_out["Id"]

def test_available_slots_and_manual_appointment():
    doc_out = create_test_doctor()
    doctor_id = doc_out["Id"]

    # Check available slots
    target_date = date.today().isoformat()
    slots_resp = client.get(f"/doctors/{doctor_id}/available-slots?target_date={target_date}")
    assert slots_resp.status_code == 200
    slots = slots_resp.json()
    assert isinstance(slots, list)

    # Book a manual appointment
    unique_phone = f"9199{uuid.uuid4().hex[:8]}"
    apt_payload = {
        "DoctorId": doctor_id,
        "PatientName": "Test Patient",
        "PhoneNumber": unique_phone,
        "Date": target_date,
        "Time": "10:00:00",
        "SlotTime": "10:00:00",
        "ConsultationType": "Clinic",
        "Remarks": "Regular Checkup"
    }

    apt_resp = client.post("/appointments/manual", json=apt_payload)
    assert apt_resp.status_code == 201
    apt_out = apt_resp.json()
    assert apt_out["PatientName"] == "Test Patient"
    assert apt_out["Status"] == "Booked"

def test_admin_login():
    response = client.post("/admin/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    assert response.json()["status"] == "success"
