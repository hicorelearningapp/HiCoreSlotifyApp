from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
import os
import re
import backend_app.modules.doctor_appointment.models as models
import backend_app.modules.doctor_appointment.schemas as schemas
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
from backend_app.core.database import db_session
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
    if not plain_password or not hashed_password:
        return False
    pwd_bytes = plain_password.encode("utf-8")[:72]
    if hashed_password.startswith(("$2b$", "$2a$", "$2y$")):
        if HAS_BCRYPT:
            try:
                return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
            except Exception:
                pass
        try:
            from passlib.hash import bcrypt as passlib_bcrypt
            return passlib_bcrypt.verify(plain_password, hashed_password)
        except Exception:
            return False
    if hashed_password.startswith("pbkdf2:"):
        try:
            _, salt, hash_val = hashed_password.split(":")
            check_hash = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt.encode("utf-8"), 100000).hex()
            return check_hash == hash_val
        except Exception:
            return False
    return False


class DoctorService:
    def __init__(self):
        self.db = db_session

    def create_doctor(self, doctor: schemas.DoctorCreate) -> models.Doctor:
        existing = (
            self.db.query(models.Doctor)
            .filter(
                (models.Doctor.MobileNumber == doctor.MobileNumber)
                | (models.Doctor.EmailAddress == doctor.EmailAddress)
                | (models.Doctor.UserName == doctor.UserName)
            )
            .first()
        )
        if existing:
            if existing.MobileNumber == doctor.MobileNumber:
                raise ValueError("A doctor with this mobile number already exists.")
            if existing.EmailAddress == doctor.EmailAddress:
                raise ValueError("A doctor with this email address already exists.")
            if existing.UserName == doctor.UserName:
                raise ValueError("A doctor with this username already exists.")
            raise ValueError(
                "Doctor with this mobile number, email, or username already exists."
            )

        doctor_data = doctor.model_dump()
        if "Password" in doctor_data and doctor_data["Password"]:
            doctor_data["Password"] = hash_password(doctor_data["Password"])

        new_doctor = models.Doctor(**doctor_data)
        self.db.add(new_doctor)
        self.db.commit()
        self.db.refresh(new_doctor)
        return new_doctor

    def list_doctors(self, skip: int = 0, limit: int = 100, status: Optional[str] = None, approved_only: bool = False) -> List[models.Doctor]:
        query = self.db.query(models.Doctor)
        if status:
            query = query.filter(models.Doctor.Status == status)
        elif approved_only:
            query = query.filter(models.Doctor.Status == "Approved")
        return query.offset(skip).limit(limit).all()

    def list_doctors_by_business_phone(self, business_phone: str, skip: int = 0, limit: int = 100, status: Optional[str] = None, approved_only: bool = False) -> List[models.Doctor]:
        query = self.db.query(models.Doctor).filter(models.Doctor.BusinessPhoneNumber == business_phone)
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

        for key, value in update_data.items():
            setattr(doctor, key, value)

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

    def login_doctor(self, login_data: schemas.DoctorLogin) -> Optional[models.Doctor]:
        username = (login_data.UserName or "").strip()
        password = login_data.Password or ""
        if not username or not password:
            return None

        clean_phone = re.sub(r"[^\d+]", "", username) if username else ""

        query_filter = (
            (func.lower(models.Doctor.UserName) == username.lower()) |
            (func.lower(models.Doctor.EmailAddress) == username.lower())
        )
        if clean_phone:
            query_filter = query_filter | (models.Doctor.MobileNumber == clean_phone) | (models.Doctor.WhatsAppNumber == clean_phone)

        doctor = self.db.query(models.Doctor).filter(query_filter).first()

        if doctor:
            if verify_password(password.strip(), doctor.Password) or verify_password(password, doctor.Password):
                return doctor

        return None

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

    def get_admin_dashboard(self) -> dict:
        total_doctors = self.db.query(models.Doctor).count()
        pending_query = self.db.query(models.Doctor).filter(models.Doctor.Status == "Pending")
        pending_count = pending_query.count()
        pending_requests = pending_query.all()
        approved_count = self.db.query(models.Doctor).filter(models.Doctor.Status == "Approved").count()
        rejected_count = self.db.query(models.Doctor).filter(models.Doctor.Status == "Rejected").count()
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
                "PatientId": a.PatientId,
                "PatientName": a.PatientName or "Patient",
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
            weekly_list.append({"Day": day_abbr, "Count": count})

        # Monthly breakdown: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec for current year
        months_name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_list = []
        for m_idx, m_abbr in enumerate(months_name, start=1):
            count = sum(
                1 for a in lifetime_appts 
                if a.Date and a.Date.year == today.year and a.Date.month == m_idx
            )
            monthly_list.append({"Month": m_abbr, "Count": count})

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
            "TodayRevenue": float(today_revenue),
            "TotalLifetimeAppointments": total_lifetime_appts,
            "TotalLifetimePatients": total_lifetime_patients,
            "TotalLifetimeRevenue": float(total_lifetime_revenue),
            "TodayAppointmentsList": today_list,
            "Weekly": weekly_list,
            "Monthly": monthly_list
        }

    def get_doctor_analytics(self, doctor_id: str) -> Optional[dict]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        all_appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Status != "Available"
        ).all()

        total_valid = len(all_appts)
        cancelled_count = sum(1 for a in all_appts if a.Status == "Cancelled")
        no_show_count = sum(1 for a in all_appts if a.Status == "NoShow")

        if total_valid > 0:
            canc_rate_val = round((cancelled_count / total_valid) * 100)
            cancellation_rate_str = f"{canc_rate_val}%"
        else:
            cancellation_rate_str = "0%"

        patient_appt_counts = {}
        for a in all_appts:
            if a.PatientId:
                patient_appt_counts[a.PatientId] = patient_appt_counts.get(a.PatientId, 0) + 1

        total_patients = len(patient_appt_counts)
        returning_patients = sum(1 for count in patient_appt_counts.values() if count > 1)

        if total_patients > 0:
            retention_val = round((returning_patients / total_patients) * 100)
            retention_str = f"{retention_val}%"
        else:
            retention_str = "0%"

        appt_months = {f"{m:02d}": "0" for m in range(1, 13)}
        for a in all_appts:
            if a.Date:
                m_str = f"{a.Date.month:02d}"
                appt_months[m_str] = str(int(appt_months[m_str]) + 1)

        rev_months = {f"{m:02d}": "0" for m in range(1, 13)}
        payments = self.db.query(models.Payment).filter(
            models.Payment.DoctorId == doctor_id,
            models.Payment.Status == "Paid"
        ).all()

        for p in payments:
            if p.DateTime:
                m_str = f"{p.DateTime.month:02d}"
                curr_rev = float(rev_months[m_str])
                rev_months[m_str] = str(int(round(curr_rev + (p.Payment or 0.0))))

        return {
            "CancellationRate": cancellation_rate_str,
            "NoShow": no_show_count,
            "PatientRetention": retention_str,
            "Appointments": [appt_months],
            "Revenue": [rev_months]
        }

    def get_doctor_patients(self, doctor_id: str) -> Optional[schemas.DoctorPatientsResponse]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        appointments = (
            self.db.query(models.Appointment)
            .filter(
                models.Appointment.DoctorId == doctor_id,
                models.Appointment.PatientId.isnot(None),
                models.Appointment.Status != "Available"
            )
            .all()
        )

        patient_appts = {}
        for appt in appointments:
            if appt.PatientId not in patient_appts:
                patient_appts[appt.PatientId] = []
            patient_appts[appt.PatientId].append(appt)

        patient_items = []
        follow_up_due_count = 0
        new_patients_count = 0
        returning_patients_count = 0

        today = date.today()

        for pid, appts_list in patient_appts.items():
            customer = self.db.query(models.Customer).filter(models.Customer.PatientId == pid).first()
            
            name = customer.PatientName if (customer and customer.PatientName) else (customer.CustomerName if customer else appts_list[0].PatientName or "Unknown")
            mobile = customer.PhoneNumber if customer else None

            age = None
            if customer and customer.DateOfBirth:
                dob = customer.DateOfBirth
                if isinstance(dob, str):
                    try:
                        from datetime import datetime
                        dob = datetime.strptime(dob, "%Y-%m-%d").date()
                    except Exception:
                        dob = None
                if dob and hasattr(dob, "year"):
                    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

            appts_list_sorted = sorted(appts_list, key=lambda a: (a.Date, str(a.SlotTime) if a.SlotTime else ""))
            latest_appt = appts_list_sorted[-1]

            last_visit = max(a.Date for a in appts_list if a.Date) if appts_list else None

            review_dates = [a.ReviewDate for a in appts_list if a.ReviewDate]
            next_review = max(review_dates) if review_dates else None
            if next_review:
                follow_up_due_count += 1

            status_val = latest_appt.Status

            if len(appts_list) == 1:
                new_patients_count += 1
            else:
                returning_patients_count += 1

            gender = customer.Gender if customer else None
            blood_group = customer.BloodGroup if customer else None

            patient_items.append(
                schemas.DoctorPatientItem(
                    PatientId=pid,
                    Name=name,
                    Age=age,
                    Gender=gender,
                    BloodGroup=blood_group,
                    Mobile=mobile,
                    LastVisit=last_visit,
                    NextReview=next_review,
                    Status=status_val
                )
            )

        total_patients = len(patient_items)

        return schemas.DoctorPatientsResponse(
            TotalPatients=total_patients,
            NewPatients=new_patients_count,
            ReturningPatients=returning_patients_count,
            FollowUpDue=follow_up_due_count,
            Patients=patient_items
        )

    def get_doctor_appointment_analytics(
        self,
        doctor_id: str,
        filter_type: Optional[str] = "all",
        year: Optional[int] = None
    ) -> Optional[schemas.DoctorAppointmentAnalyticsOut]:
        from datetime import date, timedelta

        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None

        today = date.today()
        target_year = year if year is not None else today.year

        # Base query for doctor's booked/valid appointments
        all_appts = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Status.notin_(["Available", "NotAvailable"])
        ).all()

        # Overall totals
        total_valid = len(all_appts)
        completed_count = sum(1 for a in all_appts if a.Status == "Completed")
        cancelled_count = sum(1 for a in all_appts if a.Status == "Cancelled")
        noshow_count = sum(1 for a in all_appts if a.Status == "NoShow")
        pending_count = sum(1 for a in all_appts if a.Status in ["Booked", "Rescheduled"])

        # Weekly breakdown: Mon, Tue, Wed, Thu, Fri, Sat, Sun for current week
        days_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        start_of_week = today - timedelta(days=today.weekday())
        
        weekly_list: List[schemas.WeeklyDayAnalyticsItem] = []
        for i, day_abbr in enumerate(days_name):
            day_date = start_of_week + timedelta(days=i)
            count = sum(1 for a in all_appts if a.Date and a.Date == day_date)
            weekly_list.append(schemas.WeeklyDayAnalyticsItem(Day=day_abbr, Count=count))

        # Monthly breakdown: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec for target_year
        months_name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        monthly_list: List[schemas.MonthlyAnalyticsItem] = []
        for m_idx, m_abbr in enumerate(months_name, start=1):
            count = sum(
                1 for a in all_appts 
                if a.Date and a.Date.year == target_year and a.Date.month == m_idx
            )
            monthly_list.append(schemas.MonthlyAnalyticsItem(Month=m_abbr, Count=count))

        filter_val = (filter_type or "all").lower().strip()

        return schemas.DoctorAppointmentAnalyticsOut(
            DoctorId=doctor_id,
            FilterType=filter_val,
            Year=target_year,
            TotalAppointments=total_valid,
            CompletedAppointments=completed_count,
            PendingAppointments=pending_count,
            CancelledAppointments=cancelled_count,
            NoShowAppointments=noshow_count,
            Weekly=weekly_list if filter_val in ["weekly", "all"] else [],
            Monthly=monthly_list if filter_val in ["monthly", "all"] else []
        )

    def update_whatsapp_business_status(
        self, doctor_id: str, status_data: schemas.DoctorWhatsAppStatusUpdate
    ) -> Optional[models.Doctor]:
        doctor = self.get_doctor(doctor_id)
        if not doctor:
            return None
        doctor.WhatsAppBusinessStatus = status_data.WhatsAppBusinessStatus
        self.db.commit()
        self.db.refresh(doctor)
        return doctor
