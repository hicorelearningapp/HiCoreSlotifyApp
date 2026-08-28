import pytest
import uuid
from fastapi.testclient import TestClient
from datetime import date, timedelta
from app.main import app

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
        "Monday": "09:00-17:00",
        "Tuesday": "09:00-17:00",
        "Wednesday": "09:00-17:00",
        "Thursday": "09:00-17:00",
        "Friday": "09:00-17:00",
        "Saturday": "09:00-17:00",
        "Sunday": "09:00-17:00",
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

def test_appointment_booking_buffer_and_reschedule():
    # 1. Register & Approve doctor
    doc_out = create_test_doctor()
    doctor_id = doc_out["Id"]
    # Connect WhatsApp business status first
    wa_resp = client.patch(f"/doctors/{doctor_id}/whatsapp-status", json={"WhatsAppBusinessStatus": "Connected"})
    assert wa_resp.status_code == 200
    approve_resp = client.post(f"/admin/doctors/{doctor_id}/approve", headers={"X-Admin-Key": "admin_access_token_2026"})
    assert approve_resp.status_code == 200

    # 2. Create customer / patient
    unique_phone = f"9188{uuid.uuid4().hex[:8]}"
    cust_resp = client.post("/customers", json={
        "CustomerName": "Ananya Sharma",
        "PatientName": "Ananya Sharma",
        "PhoneNumber": unique_phone,
        "EmailAddress": f"ananya_{uuid.uuid4().hex[:6]}@example.com",
        "Gender": "Female"
    })
    assert cust_resp.status_code == 201
    cust_out = cust_resp.json()
    patient_id = cust_out["PatientId"]

    # 3. Get available slots (use tomorrow so slots are always in future regardless of time of day)
    target_date = (date.today() + timedelta(days=1)).isoformat()
    slots_resp = client.get(f"/doctors/{doctor_id}/available-slots?target_date={target_date}")
    assert slots_resp.status_code == 200
    slots = slots_resp.json()
    assert len(slots) >= 2

    first_slot = slots[0]
    second_slot = slots[1]

    # 4. Book appointment using pure API endpoint
    book_payload = {
        "DoctorId": doctor_id,
        "PatientId": patient_id,
        "Date": target_date,
        "SlotTime": first_slot["SlotTime"],
        "Slot": first_slot["Slot"],
        "ConsultationType": "Clinic",
        "Status": "Booked"
    }
    book_resp = client.post("/appointments", json=book_payload)
    assert book_resp.status_code == 201
    book_out = book_resp.json()
    assert book_out["DoctorId"] == doctor_id
    assert book_out["PatientId"] == patient_id
    assert book_out["Status"] == "Booked"
    appointment_id = book_out["Id"]

    # 5. Verify buffer rule prevents booking another slot within 60 mins for same patient
    overlap_payload = {
        "DoctorId": doctor_id,
        "PatientId": patient_id,
        "Date": target_date,
        "SlotTime": second_slot["SlotTime"],
        "Slot": second_slot["Slot"],
        "ConsultationType": "Clinic",
        "Status": "Booked"
    }
    overlap_resp = client.post("/appointments", json=overlap_payload)
    assert overlap_resp.status_code == 400
    assert "buffer" in overlap_resp.json()["detail"].lower() or "within 60 minutes" in overlap_resp.json()["detail"].lower()

    # 6. Verify rescheduling works cleanly
    # Find a slot later in the day (e.g. 5th slot)
    if len(slots) > 4:
        reschedule_slot = slots[4]
        resched_resp = client.put(f"/appointments/{appointment_id}/reschedule", json={
            "Date": target_date,
            "SlotTime": reschedule_slot["SlotTime"],
            "Slot": reschedule_slot["Slot"]
        })
        assert resched_resp.status_code == 200
        resched_out = resched_resp.json()
        assert resched_out["Status"] == "Rescheduled"
        assert resched_out["SlotTime"] == reschedule_slot["SlotTime"]

