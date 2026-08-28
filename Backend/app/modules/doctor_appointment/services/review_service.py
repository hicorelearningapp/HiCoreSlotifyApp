import logging
from datetime import date
from app.core.database import db_session
from app.modules.doctor_appointment.models.appointment import Appointment
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
                        logger.info(f"Processed review reminder for {patient_phone} for appointment {appt.Id}")
                except Exception as e:
                    logger.error(f"Error sending review notification for appointment {appt.Id}: {e}")
        except Exception as e:
            logger.error(f"Error processing review reminders: {e}")
            self.db.rollback()
