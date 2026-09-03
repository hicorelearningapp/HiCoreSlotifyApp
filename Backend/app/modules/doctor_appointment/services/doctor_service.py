from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os
import app.modules.doctor_appointment.models as models
import app.modules.doctor_appointment.schemas as schemas
from app.modules.doctor_appointment.services.appointment_service import AppointmentService
from app.core.database import db_session
import hashlib

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    if HAS_BCRYPT:
        return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt.encode("utf-8"), 100000).hex()
    return f"pbkdf2:{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    pwd_bytes = plain_password.encode("utf-8")[:72]
    if hashed_password.startswith(("$2b$", "$2a$", "$2y$")):
        if HAS_BCRYPT:
            try:
                return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
            except Exception:
                return False
        return False
    if hashed_password.startswith("pbkdf2:"):
        try:
            _, salt, hash_val = hashed_password.split(":")
            check_hash = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt.encode("utf-8"), 100000).hex()
            return check_hash == hash_val
        except Exception:
            return False
    return plain_password == hashed_password


class DoctorService:
    def __init__(self):
        self.db = db_session

    def list_doctors(self, skip: int = 0, limit: int = 100, status: Optional[str] = None, approved_only: bool = False) -> List[models.Doctor]:
        query = self.db.query(models.Doctor).filter(
            (models.Doctor.IndustryType == "DoctorAppointment") |
            (models.Doctor.IndustryType.ilike("%doctor%"))
        )
        if status:
            query = query.filter(models.Doctor.Status == status)
        elif approved_only:
            query = query.filter(models.Doctor.Status == "Approved")
        return query.offset(skip).limit(limit).all()

    def list_doctors_by_business_phone(self, business_phone: str, skip: int = 0, limit: int = 100, status: Optional[str] = None, approved_only: bool = False) -> List[models.Doctor]:
        query = self.db.query(models.Doctor).filter(
            (models.Doctor.IndustryType == "DoctorAppointment") |
            (models.Doctor.IndustryType.ilike("%doctor%")),
            models.Doctor.BusinessPhoneNumber == business_phone
        )
        if status:
            query = query.filter(models.Doctor.Status == status)
        elif approved_only:
            query = query.filter(models.Doctor.Status == "Approved")
        return query.offset(skip).limit(limit).all()

    def get_doctor(self, doctor_id: str) -> Optional[models.Doctor]:
        return (
            self.db.query(models.Doctor).filter(models.Doctor.Id == doctor_id).first()
        )

    def get_doctor_first_name(self, doctor_id: str) -> str:
        doc = self.get_doctor(doctor_id)
        if not doc or not doc.FullName:
            return "Doctor"
        
        name = doc.FullName.strip()
        prefixes = ["Dr. ", "Dr.", "Dr ", "Doctor "]
        for prefix in prefixes:
            if name.lower().startswith(prefix.lower()):
                name = name[len(prefix):].strip()
                break
                
        if not name:
            return "Doctor"
            
        return f"Dr. {name.split()[0]}"

    def get_doctor_by_phone(self, phone_id: str) -> Optional[models.Doctor]:
        return (
            self.db.query(models.Doctor).filter(models.Doctor.MobileNumber == phone_id).first()
        )

    def _delete_photo_file(self, photo_path: Optional[str]):
        if not photo_path or photo_path.startswith(("http://", "https://")):
            return
        clean_path = photo_path.lstrip("/\\")
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        full_path = os.path.join(base_dir, clean_path)
        if os.path.isfile(full_path):
            try:
                os.remove(full_path)
            except OSError:
                pass

    def update_doctor(
        self, doctor_id: str, doctor_update: schemas.DoctorUpdate
    ) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        update_data = doctor_update.model_dump(exclude_unset=True)
        # Ensure UserName and Password are not updated via general update
        update_data.pop("UserName", None)
        update_data.pop("Password", None)

        if "MobileNumber" in update_data:
            existing = (
                self.db.query(models.Doctor)
                .filter(models.Doctor.MobileNumber == update_data["MobileNumber"])
                .first()
            )
            if existing and existing.Id != doctor_id:
                raise ValueError("Another doctor is already using this mobile number.")
        if "EmailAddress" in update_data:
            existing = (
                self.db.query(models.Doctor)
                .filter(models.Doctor.EmailAddress == update_data["EmailAddress"])
                .first()
            )
            if existing and existing.Id != doctor_id:
                raise ValueError("Another doctor is already using this email address.")

        if update_data.get("Status") == "Approved":
            wb_status = update_data.get("WhatsAppBusinessStatus", getattr(doctor, "WhatsAppBusinessStatus", None))
            if wb_status != "Connected":
                raise ValueError("Cannot approve doctor: WhatsApp Business status is not connected.")

        if "ProfilePhoto" in update_data and update_data["ProfilePhoto"] != doctor.ProfilePhoto:
            self._delete_photo_file(doctor.ProfilePhoto)

        biz_columns = {
            "FullName", "MobileNumber", "BusinessPhoneNumber", "EmailAddress",
            "Address", "City", "State", "Pincode", "Country", "Status", "IsVerified"
        }

        current_bdata = dict(doctor.BusinessData or {})
        for key, value in update_data.items():
            if key == "ClinicName":
                doctor.BusinessName = value
            elif key == "ClinicAddress":
                doctor.Address = value
            elif key == "ProfilePhoto":
                doctor.ProfilePic = value
            elif key in biz_columns:
                setattr(doctor, key, value)
            else:
                current_bdata[key] = value

        doctor.BusinessData = current_bdata
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update_doctor_username(self, doctor_id: str, new_username: str) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        existing = (
            self.db.query(models.Doctor)
            .filter(models.Doctor.UserName == new_username)
            .first()
        )
        if existing and existing.Id != doctor_id:
            raise ValueError("Another doctor is already using this username.")
        doctor.UserName = new_username
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update_doctor_password(self, doctor_id: str, new_password: str, old_password: Optional[str] = None) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        if old_password:
            if not verify_password(old_password, doctor.Password):
                raise ValueError("Incorrect current password.")
        doctor.Password = hash_password(new_password)
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def get_available_slots(self, doctor_id: str, target_date: date):
        appt_svc = AppointmentService()
        return appt_svc.get_available_slots(
            target_date=target_date, doctor_id=doctor_id
        )

    def delete_doctor(self, doctor_id: str) -> bool:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return False

        if doctor.ProfilePhoto:
            self._delete_photo_file(doctor.ProfilePhoto)

        self.db.delete(doctor)
        self.db.commit()
        return True

    def approve_doctor(self, doctor_id: str) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        if getattr(doctor, "WhatsAppBusinessStatus", None) != "Connected":
            raise ValueError("Cannot approve doctor: WhatsApp Business status is not connected.")
        doctor.Status = "Approved"
        doctor.IsVerified = True
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def reject_doctor(self, doctor_id: str) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        doctor.Status = "Rejected"
        doctor.IsVerified = False
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update_doctor_status(self, doctor_id: str, status: str, is_verified: Optional[bool] = None) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        if status == "Approved" and getattr(doctor, "WhatsAppBusinessStatus", None) != "Connected":
            raise ValueError("Cannot approve doctor: WhatsApp Business status is not connected.")
        doctor.Status = status
        if is_verified is not None:
            doctor.IsVerified = is_verified
        elif status == "Approved":
            doctor.IsVerified = True
        elif status in ["Pending", "Rejected"]:
            doctor.IsVerified = False
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update_whatsapp_business_status(
        self, doctor_id: str, status_update: schemas.DoctorWhatsAppStatusUpdate
    ) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        val = status_update.WhatsAppBusinessStatus.value if hasattr(status_update.WhatsAppBusinessStatus, "value") else str(status_update.WhatsAppBusinessStatus)
        doctor.WhatsAppBusinessStatus = val
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def get_admin_dashboard(self) -> dict:
        doc_query = self.db.query(models.Doctor).filter(
            (models.Doctor.IndustryType == "DoctorAppointment") |
            (models.Doctor.IndustryType.ilike("%doctor%"))
        )
        total_doctors = doc_query.count()
        pending_query = doc_query.filter(models.Doctor.Status == "Pending")
        pending_count = pending_query.count()
        pending_requests = pending_query.all()
        approved_count = doc_query.filter(models.Doctor.Status == "Approved").count()
        rejected_count = doc_query.filter(models.Doctor.Status == "Rejected").count()
        return {
            "Total": total_doctors,
            "Pending": pending_count,
            "Approved": approved_count,
            "Rejected": rejected_count,
            "PendingRequest": pending_requests
        }

    def get_doctor_dashboard(self, doctor_id: str) -> Optional[dict]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        today = date.today()

        today_appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Date == today,
            models.Appointment.Status != "Available"
        ).all()

        today_total = len(today_appts)
        today_completed = sum(1 for a in today_appts if a.Status == "Completed")
        today_pending = sum(1 for a in today_appts if a.Status in ["Booked", "Rescheduled"])
        today_cancelled = sum(1 for a in today_appts if a.Status == "Cancelled")

        today_appt_ids = [a.Id for a in today_appts]
        today_payments = []
        if today_appt_ids:
            today_payments = self.db.query(models.Payment).filter(
                models.Payment.AppointmentId.in_(today_appt_ids),
                models.Payment.Status == "Paid"
            ).all()
        today_revenue = sum(p.Payment for p in today_payments)

        lifetime_appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Status != "Available"
        ).all()
        total_lifetime_appts = len(lifetime_appts)

        unique_patients = set(a.PatientId for a in lifetime_appts if a.PatientId)
        total_lifetime_patients = len(unique_patients)

        all_payments = self.db.query(models.Payment).filter(
            models.Payment.DoctorId == doctor_id,
            models.Payment.Status == "Paid"
        ).all()
        total_lifetime_revenue = sum(p.Payment for p in all_payments)

        today_list = []
        for a in today_appts:
            today_list.append({
                "AppointmentId": a.Id,
                "PatientId": a.PatientId or a.Id,
                "PatientName": a.PatientName or (a.patient.PatientName if a.patient else "Patient"),
                "SlotTime": str(a.SlotTime),
                "ConsultationType": a.ConsultationType,
                "Status": a.Status,
                "MeetingLink": a.MeetingLink
            })

        # Weekly breakdown: Mon, Tue, Wed, Thu, Fri, Sat, Sun for current week
        from datetime import timedelta
        days_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        start_of_week = today - timedelta(days=today.weekday())
        
        weekly_list = []
        for i, day_abbr in enumerate(days_name):
            day_date = start_of_week + timedelta(days=i)
            count = sum(1 for a in lifetime_appts if a.Date and a.Date == day_date)
            weekly_list.append({
                "Day": day_abbr,
                "Count": count
            })

        return {
            "DoctorId": doctor.Id,
            "DoctorName": doctor.FullName,
            "Specialization": doctor.Specialization,
            "ClinicName": doctor.ClinicName,
            "Status": doctor.Status,
            "IsVerified": doctor.IsVerified,
            "TodayTotalAppointments": today_total,
            "TodayCompletedAppointments": today_completed,
            "TodayPendingAppointments": today_pending,
            "TodayCancelledAppointments": today_cancelled,
            "TodayRevenue": today_revenue,
            "TotalLifetimeAppointments": total_lifetime_appts,
            "TotalLifetimePatients": total_lifetime_patients,
            "TotalLifetimeRevenue": total_lifetime_revenue,
            "TodayAppointmentsList": today_list,
            "Weekly": weekly_list,
            "Monthly": []
        }

    def get_doctor_analytics(self, doctor_id: str) -> Optional[dict]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        today = date.today()
        from datetime import timedelta

        s_date = today.replace(day=1)
        next_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
        e_date = next_month - timedelta(days=1)

        appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Date >= s_date,
            models.Appointment.Date <= e_date,
            models.Appointment.Status != "Available"
        ).all()

        total = len(appts)
        completed = sum(1 for a in appts if a.Status == "Completed")
        cancelled = sum(1 for a in appts if a.Status == "Cancelled")
        no_show = sum(1 for a in appts if a.Status == "NoShow")

        unique_patient_ids = set(a.PatientId for a in appts if a.PatientId)
        returning_patients = 0
        for pid in unique_patient_ids:
            prior_count = self.db.query(models.Appointment).filter(
                models.Appointment.DoctorId == doctor_id,
                models.Appointment.PatientId == pid,
                models.Appointment.Date < s_date,
                models.Appointment.Status != "Available"
            ).count()
            if prior_count > 0:
                returning_patients += 1

        days_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_pattern = []
        for d_idx, day_name in enumerate(days_name):
            count = sum(1 for a in appts if a.Date and a.Date.weekday() == d_idx)
            weekly_pattern.append({
                "Day": day_name,
                "Count": count
            })

        cancellation_rate = f"{(cancelled / total * 100):.1f}%" if total > 0 else "0%"
        retention_rate = f"{(returning_patients / len(unique_patient_ids) * 100):.1f}%" if unique_patient_ids else "0%"

        appts_chart = [{"label": item["Day"], "value": str(item["Count"])} for item in weekly_pattern]
        rev_chart = [{"label": item["Day"], "value": str(int(item["Count"] * (doctor.ClinicConsultationFee or 500)))} for item in weekly_pattern]

        return {
            "CancellationRate": cancellation_rate,
            "NoShow": no_show,
            "PatientRetention": retention_rate,
            "Appointments": appts_chart,
            "Revenue": rev_chart
        }

    def get_doctor_patients(self, doctor_id: str, search: Optional[str] = None, skip: int = 0, limit: int = 50) -> Optional[dict]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.PatientId.isnot(None),
            models.Appointment.Status != "Available"
        ).all()

        patient_map = {}
        for a in appts:
            pid = a.PatientId
            if pid not in patient_map:
                patient_map[pid] = {
                    "PatientId": pid,
                    "Appointments": []
                }
            patient_map[pid]["Appointments"].append(a)

        patient_list = []
        for pid, data in patient_map.items():
            customer = self.db.query(models.Customer).filter(models.Customer.PatientId == pid).first()
            p_appts = data["Appointments"]
            total_visits = len(p_appts)
            sorted_appts = sorted(p_appts, key=lambda x: x.Date, reverse=True)
            last_visit = sorted_appts[0].Date if sorted_appts else None

            patient_name = customer.PatientName if customer else (sorted_appts[0].PatientName or "Unknown")
            phone = customer.PhoneNumber if customer else ""
            gender = customer.Gender if customer else None

            if search:
                s_lower = search.lower()
                if s_lower not in patient_name.lower() and s_lower not in phone.lower():
                    continue

            patient_list.append({
                "PatientId": pid,
                "Name": patient_name,
                "Mobile": phone,
                "Gender": gender,
                "LastVisit": last_visit,
                "Status": "Active"
            })

        total_patients = len(patient_list)
        paged_patients = patient_list[skip : skip + limit]

        return {
            "TotalPatients": total_patients,
            "NewPatients": total_patients,
            "ReturningPatients": 0,
            "FollowUpDue": 0,
            "Patients": paged_patients
        }
