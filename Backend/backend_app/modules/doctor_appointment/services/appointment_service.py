from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta, datetime, date, time
from typing import List, Optional
import core.models as models
import core.schemas as schemas

from fastapi import HTTPException
from backend_app.core.database import db_session
from core.channels.whatsapp.services.whatsapp_service import whatsapp
from backend_app.modules.doctor_appointment.services.google_oauth_service import GoogleOAuthService

class AppointmentService:
    def __init__(self):
        self.db = db_session

    def book_appointment(self, appointment: schemas.AppointmentCreate):
        # Verify doctor exists and is approved
        doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == appointment.DoctorId).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found.")
        if doctor.Status != "Approved":
            raise HTTPException(status_code=400, detail="Doctor is not approved for appointment booking.")


        # Check doctor schedule
        day_of_week = appointment.Date.weekday()
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_name = days[day_of_week]
        
        day_schedule_str = getattr(doctor, day_name)
        if not day_schedule_str:
            raise HTTPException(status_code=400, detail="Doctor is not working on this day.")

        req_time = appointment.SlotTime
        
        # Generate all slots for the day to validate
        all_slots = self._generate_all_slots_for_day(doctor, appointment.Date, day_schedule_str)
        if not any(slot.time() == req_time for slot in all_slots):
            raise HTTPException(status_code=400, detail="Requested time is not a valid slot for this doctor.")

        # Verify patient exists
        customer = self.db.query(models.Customer).filter(models.Customer.PatientId == appointment.PatientId).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Patient not found.")

        # Limit how many appointments one customer can have on the same day
        customer_day_count = self.db.query(models.Appointment).filter(
            models.Appointment.PatientId == appointment.PatientId,
            models.Appointment.Date == appointment.Date,
            models.Appointment.Status.notin_(['Cancelled', 'NotAvailable'])
        ).count()
        from core.Sequence import SequenceFactory
        max_bookings_per_day = SequenceFactory.get_setting(self.db, doctor.BusinessPhoneNumber, "max_bookings_per_day", None)
        if max_bookings_per_day is not None and customer_day_count >= max_bookings_per_day:
            raise HTTPException(
                status_code=400,
                detail=f"You already have {max_bookings_per_day} appointment(s) booked on this day.",
            )

        # Check for overlapping appointments within the buffer
        requested_dt = datetime.combine(appointment.Date, appointment.SlotTime)
        buffer_minutes = SequenceFactory.get_setting(self.db, doctor.BusinessPhoneNumber, "customer_appointment_buffer_minutes", 60)
        buffer_delta = timedelta(minutes=buffer_minutes)
        
        existing_appointments = self.db.query(models.Appointment).filter(
            models.Appointment.PatientId == appointment.PatientId,
            models.Appointment.Date == appointment.Date,
            models.Appointment.Status.notin_(['Cancelled', 'NotAvailable'])
        ).all()
        
        for existing in existing_appointments:
            existing_dt = datetime.combine(existing.Date, existing.SlotTime)
            if abs((requested_dt - existing_dt).total_seconds()) < buffer_delta.total_seconds():
                raise HTTPException(
                    status_code=400,
                    detail=f"You already have an appointment booked within {buffer_minutes} minutes of this time."
                )

        # Check if there is an existing available or cancelled slot
        available_slot = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == appointment.DoctorId,
            models.Appointment.Date == appointment.Date,
            models.Appointment.SlotTime == appointment.SlotTime,
            models.Appointment.Status.in_(["Available", "Cancelled"])
        ).first()

        if not available_slot:
            # Check if slots exist at all for this doctor and date
            day_has_slots = self.db.query(models.Appointment).filter(
                models.Appointment.DoctorId == appointment.DoctorId,
                models.Appointment.Date == appointment.Date
            ).first()

            if not day_has_slots:
                # Pre-generate all slots for the day
                slot_number = 1
                for slot_dt in all_slots:
                    new_slot = models.Appointment(
                        DoctorId=appointment.DoctorId,
                        PatientId=None,
                        Date=appointment.Date,
                        SlotTime=slot_dt.time(),
                        Slot=slot_number,
                        ConsultationType="Clinic",
                        Status="Available",
                        DoctorName=doctor.FullName,
                        PatientName=None
                    )
                    self.db.add(new_slot)
                    slot_number += 1
                try:
                    self.db.commit()
                except Exception:
                    self.db.rollback()

                # Re-query for the matching slot
                available_slot = self.db.query(models.Appointment).filter(
                    models.Appointment.DoctorId == appointment.DoctorId,
                    models.Appointment.Date == appointment.Date,
                    models.Appointment.SlotTime == appointment.SlotTime,
                    models.Appointment.Status.in_(["Available", "Cancelled"])
                ).first()

        if not available_slot:
            raise HTTPException(
                status_code=400,
                detail="This time slot is already fully booked for this doctor."
            )

        # Update the slot in place
        available_slot.PatientId = appointment.PatientId
        available_slot.Status = "Booked"
        available_slot.ConsultationType = appointment.ConsultationType
        available_slot.DoctorName = doctor.FullName
        available_slot.PatientName = customer.PatientName
        if hasattr(appointment, 'ReviewDate') and appointment.ReviewDate:
            available_slot.ReviewDate = appointment.ReviewDate
        if hasattr(appointment, 'MeetingLink') and appointment.MeetingLink:
            available_slot.MeetingLink = appointment.MeetingLink

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=409,
                detail="This time slot was just taken. Please pick another.",
            )
        self.db.refresh(available_slot)
        return available_slot

    def list_appointments(
        self,
        doctor_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        target_date: Optional[date] = None,
        status: Optional[str] = None,
        filter_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> dict:
        query = self.db.query(models.Appointment).filter(models.Appointment.Status != "Available")

        if doctor_id:
            query = query.filter(models.Appointment.DoctorId == doctor_id)
        if patient_id:
            query = query.filter(models.Appointment.PatientId == patient_id)
        if target_date:
            query = query.filter(models.Appointment.Date == target_date)
        if status:
            query = query.filter(models.Appointment.Status == status)

        today = date.today()
        if filter_type:
            ft = filter_type.lower().strip()
            if ft == "today":
                query = query.filter(models.Appointment.Date == today)
            elif ft == "weekly":
                start_of_week = today - timedelta(days=today.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                query = query.filter(models.Appointment.Date >= start_of_week, models.Appointment.Date <= end_of_week)
            elif ft == "monthly":
                start_of_month = date(today.year, today.month, 1)
                if today.month == 12:
                    end_of_month = date(today.year, 12, 31)
                else:
                    end_of_month = date(today.year, today.month + 1, 1) - timedelta(days=1)
                query = query.filter(models.Appointment.Date >= start_of_month, models.Appointment.Date <= end_of_month)

        all_matching = query.all()

        total_appts = len(all_matching)
        completed_count = sum(1 for a in all_matching if a.Status == "Completed")
        cancelled_count = sum(1 for a in all_matching if a.Status == "Cancelled")
        noshow_count = sum(1 for a in all_matching if a.Status == "NoShow")
        
        upcoming_count = sum(
            1 for a in all_matching
            if a.Status in ["Booked", "Confirmed", "Rescheduled"] or (a.Date and a.Date >= today and a.Status not in ["Completed", "Cancelled", "NoShow", "NotAvailable"])
        )

        paged_appts = all_matching[skip : skip + limit]

        return {
            "TotalAppointments": str(total_appts),
            "Completed": str(completed_count),
            "UpComming": str(upcoming_count),
            "Cancelled": str(cancelled_count),
            "NoShow": str(noshow_count),
            "Appointments": paged_appts
        }


    def get_appointment(self, appointment_id: str) -> Optional[models.Appointment]:
        return self.db.query(models.Appointment).filter(models.Appointment.Id == appointment_id).first()

    def update_appointment(self, appointment_id: str, appt_update: schemas.AppointmentUpdate) -> Optional[models.Appointment]:
        appointment = self.get_appointment(appointment_id)
        if not appointment:
            return None
        update_data = appt_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(appointment, key, value)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def update_review_date(self, appointment_id: str, review_date: date) -> Optional[models.Appointment]:
        appointment = self.get_appointment(appointment_id)
        if not appointment:
            return None
        appointment.ReviewDate = review_date
        self.db.commit()
        self.db.refresh(appointment)
        return appointment


    def _format_slot_time(self, slot_time):
        if not slot_time:
            return ""
        if hasattr(slot_time, "strftime"):
            return slot_time.strftime("%I:%M %p")
        if isinstance(slot_time, str):
            try:
                return datetime.strptime(slot_time, "%H:%M:%S").strftime("%I:%M %p")
            except Exception:
                try:
                    return datetime.strptime(slot_time, "%H:%M").strftime("%I:%M %p")
                except Exception:
                    return slot_time
        return str(slot_time)

    def update_appointment_status(self, appointment_id: str, status_str: str, remarks: Optional[str] = None) -> Optional[models.Appointment]:
        appointment = self.get_appointment(appointment_id)
        if not appointment:
            return None
        
        old_status = appointment.Status
        appointment.Status = status_str
        if remarks is not None:
            appointment.ReMarks = remarks
            
        if old_status not in ["Cancelled", "NotAvailable"] and status_str in ["Cancelled", "NotAvailable"] and appointment.patient:            
            try:
                time_formatted = self._format_slot_time(appointment.SlotTime)
                msg = f"Your appointment on {appointment.Date} at {time_formatted} has been {status_str}."
                if remarks:
                    msg += f" Remarks: {remarks}"
                whatsapp.send_text(appointment.patient.PhoneNumber, msg)
            except Exception as e:
                print(f"Error sending WhatsApp notification: {e}")
                
        if status_str in ["Cancelled", "NotAvailable"] and appointment.ConsultationType == "Video" and appointment.MeetingLink:
            try:
                GoogleOAuthService().delete_meet_event(appointment.MeetingLink)
            except Exception as e:
                print(f"Failed to delete Google Meet event: {e}")
            appointment.MeetingLink = None
            
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def update_multiple_appointments_status(self, appointment_ids: List[str], status_str: str, remarks: Optional[str] = None) -> List[models.Appointment]:
        appointments = self.db.query(models.Appointment).filter(models.appointment.PatientId.in_(appointment_ids)).all()
        if not appointments:
            return []
                    
        for appt in appointments:
            old_status = appt.Status
            appt.Status = status_str
            if remarks is not None:
                appt.ReMarks = remarks
                
            if old_status not in ["Cancelled", "NotAvailable"] and status_str in ["Cancelled", "NotAvailable"] and appt.patient:
                try:
                    time_formatted = self._format_slot_time(appt.SlotTime)
                    msg = f"Your appointment on {appt.Date} at {time_formatted} has been {status_str}."
                    if remarks:
                        msg += f" Remarks: {remarks}"
                    whatsapp.send_text(appt.patient.PhoneNumber, msg)
                except Exception as e:
                    print(f"Error sending WhatsApp notification: {e}")
                    
            if status_str in ["Cancelled", "NotAvailable"] and appt.ConsultationType == "Video" and appt.MeetingLink:
                try:
                    GoogleOAuthService().delete_meet_event(appt.MeetingLink)
                except Exception as e:
                    print(f"Failed to delete Google Meet event: {e}")
                appt.MeetingLink = None
                
        self.db.commit()
        for appt in appointments:
            self.db.refresh(appt)
        return appointments

    def reschedule_appointment(self, appointment_id: str, target_date: date, slot_time: time, slot: int) -> models.Appointment:
        appointment = self.get_appointment(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # If they are rescheduling to the exact same slot, return immediately
        if target_date == appointment.Date and slot_time == appointment.SlotTime and slot == appointment.Slot:
            return appointment

        doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == appointment.DoctorId).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        day_of_week = target_date.weekday()
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_schedule_str = getattr(doctor, days[day_of_week])
        if not day_schedule_str:
            raise HTTPException(status_code=400, detail="Doctor is not working on this rescheduled day.")

        all_slots = self._generate_all_slots_for_day(doctor, target_date, day_schedule_str)
        if not any(slot_dt.time() == slot_time for slot_dt in all_slots):
            raise HTTPException(status_code=400, detail="Requested rescheduled time slot is not valid.")

        # Check for overlapping appointments within the buffer
        requested_dt = datetime.combine(target_date, slot_time)
        from core.Sequence import SequenceFactory
        buffer_minutes = SequenceFactory.get_setting(self.db, doctor.BusinessPhoneNumber, "customer_appointment_buffer_minutes", 60)
        buffer_delta = timedelta(minutes=buffer_minutes)
        
        existing_appointments = self.db.query(models.Appointment).filter(
            models.Appointment.PatientId == appointment.PatientId,
            models.Appointment.Date == target_date,
            models.Appointment.Status.notin_(['Cancelled', 'NotAvailable']),
            models.appointment.PatientId != appointment_id
        ).all()
        
        for existing in existing_appointments:
            existing_dt = datetime.combine(existing.Date, existing.SlotTime)
            if abs((requested_dt - existing_dt).total_seconds()) < buffer_delta.total_seconds():
                raise HTTPException(
                    status_code=400,
                    detail=f"You already have another appointment booked within {buffer_minutes} minutes of this time."
                )

        # Keep track of old slot parameters
        old_date = appointment.Date
        old_time = appointment.SlotTime
        old_slot = appointment.Slot

        # Find the available/cancelled slot at the target time
        new_available_slot = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == appointment.DoctorId,
            models.Appointment.Date == target_date,
            models.Appointment.SlotTime == slot_time,
            models.Appointment.Slot == slot,
            models.Appointment.Status.in_(["Available", "Cancelled"])
        ).first()

        if not new_available_slot:
            # Check if slots exist at all for this doctor and date
            day_has_slots = self.db.query(models.Appointment).filter(
                models.Appointment.DoctorId == appointment.DoctorId,
                models.Appointment.Date == target_date
            ).first()

            if not day_has_slots:
                # Pre-generate all slots for the target day
                slot_number = 1
                for slot_dt in all_slots:
                    new_slot_row = models.Appointment(
                        DoctorId=appointment.DoctorId,
                        PatientId=None,
                        Date=target_date,
                        SlotTime=slot_dt.time(),
                        Slot=slot_number,
                        ConsultationType="Clinic",
                        Status="Available"
                    )
                    self.db.add(new_slot_row)
                    slot_number += 1
                try:
                    self.db.commit()
                except Exception:
                    self.db.rollback()

                # Re-query for the matching slot
                new_available_slot = self.db.query(models.Appointment).filter(
                    models.Appointment.DoctorId == appointment.DoctorId,
                    models.Appointment.Date == target_date,
                    models.Appointment.SlotTime == slot_time,
                    models.Appointment.Slot == slot,
                    models.Appointment.Status.in_(["Available", "Cancelled"])
                ).first()

        if not new_available_slot:
            raise HTTPException(status_code=400, detail="This rescheduled time slot is already fully booked for this doctor.")

        # Delete the new available slot row to prevent unique constraint violation
        self.db.delete(new_available_slot)
        self.db.flush()

        # Update the existing appointment details to reschedule it
        appointment.Date = target_date
        appointment.SlotTime = slot_time
        appointment.Slot = slot
        appointment.Status = "Rescheduled"

        # Create a new available slot row at the old slot time
        new_free_slot = models.Appointment(
            DoctorId=appointment.DoctorId,
            PatientId=None,
            Date=old_date,
            SlotTime=old_time,
            Slot=old_slot,
            ConsultationType="Clinic",
            Status="Available",
            DoctorName=doctor.FullName,
            PatientName=None
        )
        self.db.add(new_free_slot)

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=409,
                detail="This time slot was just taken. Please pick another rescheduled slot.",
            )
        
        self.db.refresh(appointment)
        return appointment

    def delete_appointment(self, appointment_id: str) -> bool:
        appointment = self.get_appointment(appointment_id)
        if not appointment:
            return False
        appointment.Status = "Cancelled"
        
        if appointment.ConsultationType == "Video" and appointment.MeetingLink:
            try:
                GoogleOAuthService().delete_meet_event(appointment.MeetingLink)
            except Exception as e:
                print(f"Failed to delete Google Meet event: {e}")
            appointment.MeetingLink = None
        
        # Check if refund is needed
        has_paid = any(p.Status == "Paid" for p in appointment.payments)
        if has_paid:
            appointment.RefundStatus = "Pending"
            # Notify doctor
            doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == appointment.DoctorId).first()
            if doctor and doctor.BusinessPhoneNumber:
                msg = f"⚠️ Patient {appointment.Name} has cancelled their appointment on {appointment.Date}. A refund is pending. Type 'refunds' to process it."
        
        self.db.commit()
        return True

    def get_customer_appointments(self, patient_id: str):
        return self.db.query(models.Appointment).filter(
            models.Appointment.PatientId == patient_id,
            models.Appointment.Status.notin_(["Cancelled", "NotAvailable"])
        ).order_by(models.Appointment.Date, models.Appointment.SlotTime).all()

    def get_all_appointments(self, skip: int = 0, limit: int = 100):
        return self.db.query(models.Appointment).offset(skip).limit(limit).all()

    def get_doctor_appointments_by_date(self, doctor_id: str, target_date: date):
        """Fetches all active appointments for a doctor on a specific date."""
        return self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Date == target_date,
            models.Appointment.Status != "Cancelled",
            models.Appointment.Status != "Available"
        ).order_by(models.Appointment.SlotTime).all()

    def get_upcoming_doctor_appointments(self, doctor_id: str, limit: int = 15):
        """Fetches upcoming active appointments for a doctor from today onwards."""
        today = date.today()
        return self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Date >= today,
            models.Appointment.Status != "Cancelled",
            models.Appointment.Status != "Available"
        ).order_by(models.Appointment.Date, models.Appointment.SlotTime).limit(limit).all()

    def get_past_doctor_appointments(self, doctor_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.Appointment]:
        """Fetches past appointments for a doctor (prior to current date/time), excluding unbooked slots."""
        now = datetime.now()
        today = now.date()
        current_time = now.time()

        query = self.db.query(models.Appointment).filter(
            models.Appointment.Status != "Available",
            (models.Appointment.Date < today) | 
            ((models.Appointment.Date == today) & (models.Appointment.SlotTime < current_time))
        )
        if doctor_id:
            query = query.filter(models.Appointment.DoctorId == doctor_id)

        return query.order_by(models.Appointment.Date.desc(), models.Appointment.SlotTime.desc()).offset(skip).limit(limit).all()

    def get_appointment_by_id(self, appointment_id: int):
        """Fetches a single appointment by its ID."""
        return self.db.query(models.Appointment).filter(
            models.Appointment.Id == appointment_id
        ).first()

    def cancel_appointment(self, appointment_id: str):
        """Marks an appointment as cancelled."""
        appointment = self.get_appointment(appointment_id)
        if appointment:
            appointment.Status = "Cancelled"
            
            if appointment.ConsultationType == "Video" and appointment.MeetingLink:
                try:
                    GoogleOAuthService().delete_meet_event(appointment.MeetingLink)
                except Exception as e:
                    print(f"Failed to delete Google Meet event: {e}")
                appointment.MeetingLink = None
                
            has_paid = any(p.Status == "Paid" for p in appointment.payments)
            if has_paid:
                appointment.RefundStatus = "Pending"
            self.db.commit()
            return True
        return False

    def get_available_slots(self, target_date: date, doctor_id: str):
        doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == doctor_id).first()
        if not doctor or doctor.Status != "Approved":
            return []


        day_of_week = target_date.weekday()
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_name = days[day_of_week]
        
        day_schedule_str = getattr(doctor, day_name)
        if not day_schedule_str or day_schedule_str.strip().lower() == 'closed':
            return []

        # Check if slots already exist for this doctor and date
        existing_slots = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == doctor_id,
            models.Appointment.Date == target_date
        ).all()

        # If no slots exist, create them
        if not existing_slots:
            generated_slots = self._generate_all_slots_for_day(doctor, target_date, day_schedule_str)
            slot_number = 1
            for slot_dt in generated_slots:
                new_slot = models.Appointment(
                    DoctorId=doctor_id,
                    PatientId=None,
                    Date=target_date,
                    SlotTime=slot_dt.time(),
                    Slot=slot_number,
                    ConsultationType="Clinic",
                    Status="Available",
                    DoctorName=doctor.FullName,
                    PatientName=None
                )
                self.db.add(new_slot)
                slot_number += 1
            self.db.commit()

            # Re-query to get the created slots
            existing_slots = self.db.query(models.Appointment).filter(
                models.Appointment.DoctorId == doctor_id,
                models.Appointment.Date == target_date
            ).all()

        # Return only available slots with slot number and timing
        available_slots = []
        now = datetime.now()
        for slot in existing_slots:
            if slot.Status in ["Available", "Cancelled"]:
                slot_dt = datetime.combine(target_date, slot.SlotTime)
                if slot_dt > now:
                    available_slots.append({
                        "Slot": slot.Slot,
                        "SlotTime": slot.SlotTime
                    })

        available_slots.sort(key=lambda x: x["Slot"])
        return available_slots

    def _generate_all_slots_for_day(self, doctor, target_date: date, schedule_str: str):
        slots = []
        shifts = [s.strip() for s in schedule_str.replace(',', ';').split(';') if s.strip()]
        for shift in shifts:
            try:
                start_str, end_str = shift.split('-')
                start_parts = start_str.strip().split(":")
                start_h, start_m = int(start_parts[0]), int(start_parts[1])
                start_s = int(start_parts[2]) if len(start_parts) > 2 else 0

                end_parts = end_str.strip().split(":")
                end_h, end_m = int(end_parts[0]), int(end_parts[1])
                end_s = int(end_parts[2]) if len(end_parts) > 2 else 0

                dt_current = datetime.combine(target_date, time(start_h, start_m, start_s))
                dt_end = datetime.combine(target_date, time(end_h, end_m, end_s))

                duration = doctor.ConsultationDuration if doctor.ConsultationDuration else 15
                while dt_current < dt_end:
                    slots.append(dt_current)
                    dt_current += timedelta(minutes=duration)
            except Exception:
                continue
        return slots

    def create_manual_appointment(self, appointment_data: schemas.ManualAppointmentCreate) -> models.Appointment:
        doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == appointment_data.DoctorId).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found.")
        
        # Normalize consultation type
        raw_type = (appointment_data.Type or "Clinic").strip()
        if "video" in raw_type.lower():
            c_type = "Video"
            if not appointment_data.MailId or not appointment_data.MailId.strip():
                raise HTTPException(
                    status_code=400,
                    detail="MailId is required for Video consultation."
                )
        elif "audio" in raw_type.lower():
            c_type = "Audio"
        elif "home" in raw_type.lower():
            c_type = "HomeVisit"
        else:
            c_type = "Clinic"

        # Customer/Patient handling
        phone = appointment_data.PhoneNumber.strip()
        customer = self.db.query(models.Customer).filter(models.Customer.PhoneNumber == phone).first()
        
        if not customer:
            from core.models.utils import generate_uuid
            patient_id = generate_uuid()
            customer = models.Customer(
                Id=patient_id,
                AccountId=patient_id,
                Name=appointment_data.Name.strip(),
                CustomerName=appointment_data.Name.strip(),
                PhoneNumber=phone,
                EmailAddress=appointment_data.MailId.strip() if appointment_data.MailId else None
            )
            self.db.add(customer)
            self.db.commit()
            self.db.refresh(customer)
        else:
            if appointment_data.Name and not customer.PatientName:
                customer.PatientName = appointment_data.Name.strip()
            if appointment_data.MailId and not customer.EmailAddress:
                customer.EmailAddress = appointment_data.MailId.strip()
            self.db.commit()

        # Meeting link for Video consultation
        meeting_link = None
        if c_type == "Video":
            try:
                dt_start = datetime.combine(appointment_data.Date, appointment_data.Time)
                dt_end = dt_start + timedelta(minutes=getattr(doctor, 'ConsultationDuration', 15) or 15)
                g_oauth = GoogleOAuthService()
                meet_link = g_oauth.create_event(
                    doctor_email=doctor.EmailAddress,
                    summary=f"Video Consultation with {appointment_data.Name}",
                    description=f"Reason: {appointment_data.Reason or 'Manual appointment'}",
                    start_time=dt_start.isoformat(),
                    end_time=dt_end.isoformat(),
                    attendee_email=appointment_data.MailId
                )
                if meet_link:
                    meeting_link = meet_link
            except Exception:
                pass

        # Check existing slot
        existing_slot = self.db.query(models.Appointment).filter(
            models.Appointment.DoctorId == appointment_data.DoctorId,
            models.Appointment.Date == appointment_data.Date,
            models.Appointment.SlotTime == appointment_data.Time
        ).first()

        if existing_slot:
            existing_slot.PatientId = customer.PatientId
            existing_slot.PatientName = appointment_data.Name.strip()
            existing_slot.DoctorName = doctor.FullName
            existing_slot.ConsultationType = c_type
            existing_slot.Status = "Booked"
            existing_slot.ReMarks = appointment_data.Reason
            if meeting_link:
                existing_slot.MeetingLink = meeting_link
            appointment_record = existing_slot
        else:
            appointment_record = models.Appointment(
                DoctorId=doctor.Id,
                DoctorName=doctor.FullName,
                Id=customer.PatientId,
                Name=appointment_data.Name.strip(),
                Date=appointment_data.Date,
                SlotTime=appointment_data.Time,
                Slot=1,
                ConsultationType=c_type,
                Status="Booked",
                ReMarks=appointment_data.Reason,
                MeetingLink=meeting_link
            )
            self.db.add(appointment_record)

        self.db.commit()
        self.db.refresh(appointment_record)

        # Payment handling if Fee is provided
        if appointment_data.Fee is not None and float(appointment_data.Fee) > 0:
            existing_payment = self.db.query(models.Payment).filter(
                models.Payment.AppointmentId == appointment_record.PatientId
            ).first()
            if not existing_payment:
                payment = models.Payment(
                    AppointmentId=appointment_record.PatientId,
                    DoctorId=doctor.Id,
                    AccountId=customer.PatientId,
                    Payment=float(appointment_data.Fee),
                    Status="Pending"
                )
                self.db.add(payment)
                self.db.commit()

        return appointment_record

