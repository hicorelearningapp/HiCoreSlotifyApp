import sys
import os
import datetime

# Add app to path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from app.core.database import SessionLocal
from app.modules.doctor_appointment.models.doctor import Doctor
from app.core.security import get_password_hash

def seed_doctors():
    db = SessionLocal()
    
    business_number = "917550175964"
    
    doctors_data = [
        {
            "FullName": "Dr. Sarah Jenkins",
            "Qualification": "MD, MBBS",
            "Specialization": "Cardiologist",
            "MedicalRegistrationNumber": "MED-CARD-001",
            "YearsOfExperience": 12,
            "DateOfBirth": datetime.date(1980, 5, 12),
            "Gender": "Female",
            "MobileNumber": "9876543210",
            "BusinessPhoneNumber": business_number,
            "EmailAddress": "sarah.jenkins@example.com",
            "ClinicName": "HeartCare Clinic",
            "ClinicAddress": "123 Heartbeat Way",
            "City": "New York",
            "State": "NY",
            "Pincode": "10001",
            "Country": "USA",
            "ClinicConsultationFee": 150.0,
            "ConsultationDuration": 30,
            "MaximumPatientsPerDay": 20,
            "Monday": "09:00-17:00",
            "Tuesday": "09:00-17:00",
            "Wednesday": "09:00-17:00",
            "Thursday": "09:00-17:00",
            "Friday": "09:00-17:00",
            "Status": "Approved",
            "IsVerified": True,
            "Password": get_password_hash("password123"),
            "UserName": "sarah_jenkins"
        },
        {
            "FullName": "Dr. Robert Smith",
            "Qualification": "MBBS, MS",
            "Specialization": "Orthopedics",
            "MedicalRegistrationNumber": "MED-ORTH-002",
            "YearsOfExperience": 8,
            "DateOfBirth": datetime.date(1985, 8, 22),
            "Gender": "Male",
            "MobileNumber": "9876543211",
            "BusinessPhoneNumber": business_number,
            "EmailAddress": "robert.smith@example.com",
            "ClinicName": "Bone & Joint Center",
            "ClinicAddress": "456 Skeleton St",
            "City": "New York",
            "State": "NY",
            "Pincode": "10002",
            "Country": "USA",
            "ClinicConsultationFee": 120.0,
            "ConsultationDuration": 20,
            "MaximumPatientsPerDay": 25,
            "Monday": "10:00-18:00",
            "Tuesday": "10:00-18:00",
            "Wednesday": "10:00-18:00",
            "Thursday": "10:00-18:00",
            "Friday": "10:00-18:00",
            "Status": "Approved",
            "IsVerified": True,
            "Password": get_password_hash("password123"),
            "UserName": "robert_smith"
        },
        {
            "FullName": "Dr. Emily Davis",
            "Qualification": "MBBS, MD",
            "Specialization": "Dermatologist",
            "MedicalRegistrationNumber": "MED-DERM-003",
            "YearsOfExperience": 5,
            "DateOfBirth": datetime.date(1990, 11, 5),
            "Gender": "Female",
            "MobileNumber": "9876543212",
            "BusinessPhoneNumber": business_number,
            "EmailAddress": "emily.davis@example.com",
            "ClinicName": "Skin Glow Clinic",
            "ClinicAddress": "789 Derma Blvd",
            "City": "New York",
            "State": "NY",
            "Pincode": "10003",
            "Country": "USA",
            "ClinicConsultationFee": 100.0,
            "ConsultationDuration": 15,
            "MaximumPatientsPerDay": 30,
            "Monday": "08:00-14:00",
            "Tuesday": "08:00-14:00",
            "Wednesday": "08:00-14:00",
            "Thursday": "08:00-14:00",
            "Friday": "08:00-14:00",
            "Status": "Approved",
            "IsVerified": True,
            "Password": get_password_hash("password123"),
            "UserName": "emily_davis"
        },
        {
            "FullName": "Dr. Michael Johnson",
            "Qualification": "MBBS, MD",
            "Specialization": "Pediatrician",
            "MedicalRegistrationNumber": "MED-PED-004",
            "YearsOfExperience": 15,
            "DateOfBirth": datetime.date(1975, 3, 30),
            "Gender": "Male",
            "MobileNumber": "9876543213",
            "BusinessPhoneNumber": business_number,
            "EmailAddress": "michael.johnson@example.com",
            "ClinicName": "Kids Health Hub",
            "ClinicAddress": "321 Toddler Ave",
            "City": "New York",
            "State": "NY",
            "Pincode": "10004",
            "Country": "USA",
            "ClinicConsultationFee": 130.0,
            "ConsultationDuration": 20,
            "MaximumPatientsPerDay": 20,
            "Monday": "09:00-16:00",
            "Tuesday": "09:00-16:00",
            "Wednesday": "09:00-16:00",
            "Thursday": "09:00-16:00",
            "Friday": "09:00-16:00",
            "Status": "Approved",
            "IsVerified": True,
            "Password": get_password_hash("password123"),
            "UserName": "michael_johnson"
        }
    ]
    
    for doc_data in doctors_data:
        # Check if exists
        existing = db.query(Doctor).filter(Doctor.MedicalRegistrationNumber == doc_data["MedicalRegistrationNumber"]).first()
        if not existing:
            doc = Doctor(**doc_data)
            db.add(doc)
    
    db.commit()
    print("Successfully added 4 doctors for BusinessPhoneNumber: 917550175964")
    db.close()

if __name__ == "__main__":
    seed_doctors()
