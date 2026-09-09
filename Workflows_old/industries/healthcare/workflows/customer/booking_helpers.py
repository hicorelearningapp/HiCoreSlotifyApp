from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
import core.models as models
import core.schemas as schemas
from core.services.whatsapp_service import whatsapp
from core.api_client import api_client

class BookingHelpers:
    @staticmethod
    def send_paginated_dates(phone: str, db: Session, doctor_id: int, consultation_type: str, page: int = 0):
        start_idx = page * 7
        target_count = start_idx + 7
        
        today = datetime.now().date()
        available_dates = []
        max_lookahead = 60 # Check up to 60 days ahead
        
        for i in range(max_lookahead):
            d = today + timedelta(days=i)
            slots = api_client.get_available_slots(target_date=d, doctor_id=doctor_id)
            if slots:
                available_dates.append(d)
            if len(available_dates) == target_count:
                break
                
        dates_list = available_dates[start_idx:target_count]
        
        if not dates_list:
            if page == 0:
                whatsapp.send_text(phone, "Sorry, this doctor has no available dates in the near future.")
                from core.services.session_service import SessionService
                SessionService().reset_session(phone)
                whatsapp.send_text(phone, "Booking process cancelled.")
            else:
                whatsapp.send_text(phone, "No more available dates found.")
            return
        
        rows = []
        for d in dates_list:
            if d == today:
                title = "Today"
            elif d == today + timedelta(days=1):
                title = "Tomorrow"
            else:
                title = d.strftime("%a, %b %d")
                
            rows.append({
                "id": f"DATE_{d.strftime('%Y-%m-%d')}",
                "title": title,
                "description": "Select this date"
            })
            
        if len(available_dates) == target_count:
            rows.append({
                "id": f"MORE_DATES_{page + 1}",
                "title": "More Dates...",
                "description": "See later dates"
            })
            
        sections = [{
            "title": "Available Dates",
            "rows": rows
        }, {
            "title": "Options",
            "rows": [
                {"id": "CHANGE_DOCTOR", "title": "Change Doctor", "description": "Select another doctor"},
                {"id": "CANCEL_PROCESS", "title": "Cancel Booking", "description": "Stop booking process"}
            ]
        }]
        
        whatsapp.send_list_message(
            phone=phone,
            body_text="Please select a date for your appointment.",
            button_text="Select Date",
            sections=sections,
            header_text="Select Date"
        )

    @staticmethod
    def send_paginated_slots(phone: str, slots_str_list: list, page: int):
        start_idx = page * 7
        end_idx = start_idx + 7
        current_slots = slots_str_list[start_idx:end_idx]
        
        rows = []
        for slot in current_slots:
            dt = datetime.strptime(slot, "%H:%M")
            display_time = dt.strftime("%I:%M %p").lstrip("0")
            rows.append({
                "id": f"SLOT_{slot}",
                "title": display_time,
                "description": "Available time slot"
            })
            
        if end_idx < len(slots_str_list):
            rows.append({
                "id": "MORE_SLOTS",
                "title": "Show more slots...",
                "description": "View next available times"
            })
            
        sections = [{
            "title": "Available Times",
            "rows": rows
        }, {
            "title": "Options",
            "rows": [
                {"id": "CHANGE_DOCTOR", "title": "Change Doctor", "description": "Select another doctor"},
                {"id": "CANCEL_PROCESS", "title": "Cancel Booking", "description": "Stop booking process"}
            ]
        }]
        
        whatsapp.send_list_message(
            phone=phone,
            body_text="Please select an available time slot.",
            button_text="Select Time",
            sections=sections,
            header_text="Available Slots"
        )

    @staticmethod
    def finalize_booking(phone: str, patient_id: str, db: Session,
                          doctor_id, start_datetime, consultation_type: str):
        """Persist the booking, notify the doctor, thank the customer."""
        app_create = schemas.AppointmentCreate(
            Date=start_datetime.date(),
            SlotTime=start_datetime.time(),
            Slot=0, # The service will calculate the actual slot number
            notes="Booked via WhatsApp",
            Id=patient_id,
            DoctorId=doctor_id,
            ConsultationType=consultation_type
        )
        try:
            api_client.book_appointment(app_create)
            whatsapp.send_text(phone, f"Success! Your appointment is confirmed for {start_datetime.strftime('%Y-%m-%d %I:%M %p')}.")
            
            patient = api_client.get_customer(patient_id)
            patient_name = patient.patient_name if patient else "Unknown"

            doctor = db.query(models.Doctor).filter(models.Doctor.Id == doctor_id).first()
            if doctor and doctor.MobileNumber:
                whatsapp.send_text(doctor.MobileNumber, f"New appointment booked for {patient_name} for {start_datetime.strftime('%Y-%m-%d %I:%M %p')}.")

            whatsapp.send_text(phone, "Thank you for booking your appointment with HiCore! We hope you have a great experience.")
            
            from core.services.session_service import SessionService
            SessionService().reset_session(phone)
        except Exception as e:
            error_msg = getattr(e, 'detail', str(e))
            whatsapp.send_text(phone, f"❌ Failed to book appointment: {error_msg}")
            from core.services.session_service import SessionService
            SessionService().reset_session(phone)
            whatsapp.send_text(phone, "Booking process cancelled.")
