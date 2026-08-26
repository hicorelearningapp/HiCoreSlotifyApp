import logging
from datetime import date
from backend_app.core.database import db_session
from backend_app.modules.doctor_appointment.models.appointment import Appointment
from core.channels.whatsapp.services.whatsapp_service import whatsapp

logger = logging.getLogger("uvicorn")

class ReviewService:
    def __init__(self):
        self.db = db_session

    def process_reviews(self):
        try:
            today = date.today()
            # Find appointments with a ReviewDate scheduled for today or past due
            due_reviews = self.db.query(Appointment).filter(
                Appointment.ReviewDate.isnot(None),
                Appointment.ReviewDate <= today
            ).all()

            for appt in due_reviews:
                try:
                    patient_phone = appt.patient.PhoneNumber if appt.patient else None
                    if patient_phone:
                        msg = (
                            f"🩺 *Follow-Up Review Reminder*\n\n"
                            f"Dear {appt.Name or 'Patient'},\n"
                            f"This is a reminder for your scheduled follow-up review with Dr. {appt.DoctorName}.\n\n"
                            f"Review Date: {appt.ReviewDate}\n"
                            f"Please contact us if you need to schedule or reschedule your appointment."
                        )
                        whatsapp.send_text(patient_phone, msg)
                        logger.info(f"Sent review reminder to {patient_phone} for appointment {appt.Id}")
                except Exception as e:
                    logger.error(f"Error sending review notification for appointment {appt.Id}: {e}")
        except Exception as e:
            logger.error(f"Error processing review reminders: {e}")
            self.db.rollback()
