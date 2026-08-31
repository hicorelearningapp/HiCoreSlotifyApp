import requests

API_URL = "http://151.185.41.194:8003/doctors/register"
business_number = "917550175964"

doctors_data = [
    {
        "FullName": "Dr. Sarah Jenkins",
        "Qualification": "MD, MBBS",
        "Specialization": "Cardiologist",
        "MedicalRegistrationNumber": "MED-CARD-001",
        "YearsOfExperience": 12,
        "DateOfBirth": "1980-05-12",
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
        "Password": "password123",
        "UserName": "sarah_jenkins"
    },
    {
        "FullName": "Dr. Robert Smith",
        "Qualification": "MBBS, MS",
        "Specialization": "Orthopedics",
        "MedicalRegistrationNumber": "MED-ORTH-002",
        "YearsOfExperience": 8,
        "DateOfBirth": "1985-08-22",
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
        "Password": "password123",
        "UserName": "robert_smith"
    },
    {
        "FullName": "Dr. Emily Davis",
        "Qualification": "MBBS, MD",
        "Specialization": "Dermatologist",
        "MedicalRegistrationNumber": "MED-DERM-003",
        "YearsOfExperience": 5,
        "DateOfBirth": "1990-11-05",
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
        "Password": "password123",
        "UserName": "emily_davis"
    },
    {
        "FullName": "Dr. Michael Johnson",
        "Qualification": "MBBS, MD",
        "Specialization": "Pediatrician",
        "MedicalRegistrationNumber": "MED-PED-004",
        "YearsOfExperience": 15,
        "DateOfBirth": "1975-03-30",
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
        "Password": "password123",
        "UserName": "michael_johnson"
    }
]

for doctor in doctors_data:
    try:
        response = requests.post(API_URL, json=doctor)
        if response.status_code == 201 or response.status_code == 200:
            print(f"✅ Successfully registered: {doctor['FullName']}")
        else:
            print(f"❌ Failed to register {doctor['FullName']}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error connecting to API for {doctor['FullName']}: {e}")
