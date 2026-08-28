import sys
import os
from datetime import date, datetime

# Ensure Backend directory is in sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
sys.path = [p for p in sys.path if not p.endswith("\\db") and not p.endswith("/db")]
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password, generate_uuid
from app.modules.doctor_appointment.models.doctor import Doctor

# Ensure tables exist
Base.metadata.create_all(bind=engine)

SEED_DOCTORS = [
    {
        "FullName": "Dr. Priya Sharma",
        "UserName": "dr_priya_sharma",
        "Password": "Doctor@123",
        "Qualification": "MBBS, MD (Cardiology)",
        "Specialization": "Cardiology",
        "MedicalRegistrationNumber": "MCI-2015-00123",
        "YearsOfExperience": 11,
        "DateOfBirth": date(1986, 4, 12),
        "Gender": "Female",
        "MobileNumber": "+919876543210",
        "WhatsAppNumber": "+919876543210",
        "BusinessPhoneNumber": "+917550175964",
        "EmailAddress": "priya.sharma@cardiohealth.in",
        "ClinicName": "Pulse Heart & Vascular Care",
        "ClinicAddress": "Shop 4, Lotus Enclave, MG Road",
        "City": "Bengaluru",
        "State": "Karnataka",
        "Pincode": "560001",
        "Country": "India",
        "ClinicConsultationFee": 800.0,
        "VideoConsultationFee": 600.0,
        "SecondOpinionFee": 1000.0,
        "ConsultationDuration": 20,
        "MaximumPatientsPerDay": 25,
        "Monday": "09:00-17:00",
        "Tuesday": "09:00-17:00",
        "Wednesday": "09:00-17:00",
        "Thursday": "09:00-17:00",
        "Friday": "09:00-17:00",
        "Saturday": "09:00-14:00",
        "Sunday": "Closed",
        "UpiId": "priyasharma@okhdfcbank",
        "AccountHolderName": "Priya Sharma",
        "BankName": "HDFC Bank",
        "IfscCode": "HDFC0001234",
        "AccountNumber": "50100234567891",
        "Status": "Approved",
        "WhatsAppBusinessStatus": "Connected",
        "IsVerified": True
    },
    {
        "FullName": "Dr. Rajesh Kumar",
        "UserName": "dr_rajesh_kumar",
        "Password": "Doctor@123",
        "Qualification": "MBBS, DVD, MD (Dermatology)",
        "Specialization": "Dermatology",
        "MedicalRegistrationNumber": "MCI-2012-00456",
        "YearsOfExperience": 14,
        "DateOfBirth": date(1983, 8, 22),
        "Gender": "Male",
        "MobileNumber": "+919876543211",
        "WhatsAppNumber": "+919876543211",
        "BusinessPhoneNumber": "+917550175964",
        "EmailAddress": "rajesh.kumar@dermazone.in",
        "ClinicName": "DermaGlow Skin & Hair Clinic",
        "ClinicAddress": "Plot 18, Road No. 12, Jubilee Hills",
        "City": "Hyderabad",
        "State": "Telangana",
        "Pincode": "500033",
        "Country": "India",
        "ClinicConsultationFee": 600.0,
        "VideoConsultationFee": 500.0,
        "SecondOpinionFee": 800.0,
        "ConsultationDuration": 15,
        "MaximumPatientsPerDay": 35,
        "Monday": "10:00-18:00",
        "Tuesday": "10:00-18:00",
        "Wednesday": "10:00-18:00",
        "Thursday": "10:00-18:00",
        "Friday": "10:00-18:00",
        "Saturday": "10:00-14:00",
        "Sunday": "Closed",
        "UpiId": "rajeshkumar@icici",
        "AccountHolderName": "Rajesh Kumar",
        "BankName": "ICICI Bank",
        "IfscCode": "ICIC0000456",
        "AccountNumber": "045601567892",
        "Status": "Approved",
        "WhatsAppBusinessStatus": "Connected",
        "IsVerified": True
    },
    {
        "FullName": "Dr. Ananya Iyer",
        "UserName": "dr_ananya_iyer",
        "Password": "Doctor@123",
        "Qualification": "MBBS, DCH, DNB (Pediatrics)",
        "Specialization": "Pediatrics",
        "MedicalRegistrationNumber": "MCI-2018-00789",
        "YearsOfExperience": 8,
        "DateOfBirth": date(1989, 11, 5),
        "Gender": "Female",
        "MobileNumber": "+919876543212",
        "WhatsAppNumber": "+919876543212",
        "BusinessPhoneNumber": "+917550175964",
        "EmailAddress": "ananya.iyer@kidsfirst.in",
        "ClinicName": "Little Smiles Child Clinic",
        "ClinicAddress": "Flat 2A, Green Meadows, Anna Nagar",
        "City": "Chennai",
        "State": "Tamil Nadu",
        "Pincode": "600040",
        "Country": "India",
        "ClinicConsultationFee": 500.0,
        "VideoConsultationFee": 400.0,
        "SecondOpinionFee": 700.0,
        "ConsultationDuration": 15,
        "MaximumPatientsPerDay": 40,
        "Monday": "09:00-13:00; 16:00-20:00",
        "Tuesday": "09:00-13:00; 16:00-20:00",
        "Wednesday": "09:00-13:00; 16:00-20:00",
        "Thursday": "09:00-13:00; 16:00-20:00",
        "Friday": "09:00-13:00; 16:00-20:00",
        "Saturday": "09:00-13:00; 16:00-20:00",
        "Sunday": "Closed",
        "UpiId": "ananyaiyer@sbi",
        "AccountHolderName": "Ananya Iyer",
        "BankName": "State Bank of India",
        "IfscCode": "SBIN0000789",
        "AccountNumber": "304567890123",
        "Status": "Approved",
        "WhatsAppBusinessStatus": "Connected",
        "IsVerified": True
    },
    {
        "FullName": "Dr. Vikramaditya Reddy",
        "UserName": "dr_vikram_reddy",
        "Password": "Doctor@123",
        "Qualification": "MBBS, MS (Orthopaedics), M.Ch",
        "Specialization": "Orthopedics",
        "MedicalRegistrationNumber": "MCI-2010-00321",
        "YearsOfExperience": 16,
        "DateOfBirth": date(1981, 2, 18),
        "Gender": "Male",
        "MobileNumber": "+919876543213",
        "WhatsAppNumber": "+919876543213",
        "BusinessPhoneNumber": "+917550175964",
        "EmailAddress": "vikram.reddy@jointcare.in",
        "ClinicName": "Apex Bone & Joint Specialty Center",
        "ClinicAddress": "Tower B, Level 3, Health City, Gachibowli",
        "City": "Hyderabad",
        "State": "Telangana",
        "Pincode": "500032",
        "Country": "India",
        "ClinicConsultationFee": 750.0,
        "VideoConsultationFee": 600.0,
        "SecondOpinionFee": 1200.0,
        "ConsultationDuration": 20,
        "MaximumPatientsPerDay": 30,
        "Monday": "09:00-16:00",
        "Tuesday": "09:00-16:00",
        "Wednesday": "09:00-16:00",
        "Thursday": "09:00-16:00",
        "Friday": "09:00-16:00",
        "Saturday": "09:00-14:00",
        "Sunday": "Closed",
        "UpiId": "vikramreddy@axisbank",
        "AccountHolderName": "Vikramaditya Reddy",
        "BankName": "Axis Bank",
        "IfscCode": "UTIB0000321",
        "AccountNumber": "912010045678932",
        "Status": "Approved",
        "WhatsAppBusinessStatus": "Connected",
        "IsVerified": True
    },
    {
        "FullName": "Ramkumar",
        "UserName": "hicore",
        "Password": "hicore",
        "Qualification": "MBBS, MD (General Medicine)",
        "Specialization": "General Medicine",
        "MedicalRegistrationNumber": "MCI-2016-00654",
        "YearsOfExperience": 10,
        "DateOfBirth": date(1987, 7, 30),
        "Gender": "Female",
        "MobileNumber": "+919876543214",
        "WhatsAppNumber": "+919876543214",
        "BusinessPhoneNumber": "+917550175964",
        "EmailAddress": "sunita.patel@wellnessmed.in",
        "ClinicName": "Arogya Family Health Clinic",
        "ClinicAddress": "12 Shivam Complex, SG Highway",
        "City": "Ahmedabad",
        "State": "Gujarat",
        "Pincode": "380054",
        "Country": "India",
        "ClinicConsultationFee": 400.0,
        "VideoConsultationFee": 350.0,
        "SecondOpinionFee": 600.0,
        "ConsultationDuration": 15,
        "MaximumPatientsPerDay": 50,
        "Monday": "08:30-14:30; 17:00-20:30",
        "Tuesday": "08:30-14:30; 17:00-20:30",
        "Wednesday": "08:30-14:30; 17:00-20:30",
        "Thursday": "08:30-14:30; 17:00-20:30",
        "Friday": "08:30-14:30; 17:00-20:30",
        "Saturday": "08:30-14:30; 17:00-20:30",
        "Sunday": "09:00-13:00",
        "UpiId": "sunitapatel@kotak",
        "AccountHolderName": "Sunita Patel",
        "BankName": "Kotak Mahindra Bank",
        "IfscCode": "KKBK0000654",
        "AccountNumber": "654012345678",
        "Status": "Approved",
        "WhatsAppBusinessStatus": "Connected",
        "IsVerified": True
    }
]

def seed_doctors():
    db = SessionLocal()
    seeded_count = 0
    updated_count = 0

    try:
        print("[SEED] Seeding 5 doctors into the database...")
        for doc_info in SEED_DOCTORS:
            data = doc_info.copy()
            plain_pwd = data.pop("Password")
            user_name = data["UserName"]
            email = data["EmailAddress"]
            reg_no = data["MedicalRegistrationNumber"]

            # Check if doctor already exists
            existing_doc = db.query(Doctor).filter(
                (Doctor.UserName == user_name) |
                (Doctor.EmailAddress == email) |
                (Doctor.MedicalRegistrationNumber == reg_no)
            ).first()

            if existing_doc:
                for key, val in data.items():
                    setattr(existing_doc, key, val)
                existing_doc.Password = hash_password(plain_pwd)
                existing_doc.UpdatedAt = datetime.utcnow()
                updated_count += 1
                print(f"  [UPDATED] {existing_doc.FullName} ({existing_doc.UserName})")
            else:
                new_doc = Doctor(
                    Id=generate_uuid(),
                    Password=hash_password(plain_pwd),
                    **data
                )
                db.add(new_doc)
                seeded_count += 1
                print(f"  [ADDED] {new_doc.FullName} ({new_doc.UserName})")

        db.commit()
        print(f"\n[SUCCESS] Finished! Added: {seeded_count}, Updated: {updated_count}. Total seeded doctors: {len(SEED_DOCTORS)}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding doctors: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_doctors()
