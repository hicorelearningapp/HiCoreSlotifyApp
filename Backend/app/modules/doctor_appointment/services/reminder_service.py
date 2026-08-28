import logging
from datetime import datetime, timedelta
from app.core.database import db_session
from app.modules.doctor_appointment.models.appointment import Appointment
REMINDER_TIMINGS_HOURS = [24, 2, 1]

logger = logging.getLogger("uvicorn")

class ReminderService:
    def __init__(self):
        self.db = db_session
        
    def process_reminders(self):
        if not REMINDER_TIMINGS_HOURS:
            return
            
        now = datetime.now()
        
        # Get all upcoming confirmed or booked appointments
        upcoming_appointments = self.db.query(Appointment).filter(
            Appointment.Status.in_(["Booked", "Confirmed"]),
            Appointment.Date >= now.date()
        ).all()
        
        for appointment in upcoming_appointments:
            try:
                # Calculate the exact datetime of the appointment
                appointment_time = datetime.combine(appointment.Date, appointment.SlotTime)
                
                # If appointment is in the past, skip
                if appointment_time <= now:
                    continue
                    
                sent_reminders = appointment.RemindersSent.split(',') if appointment.RemindersSent else []
                
                for hours_before in REMINDER_TIMINGS_HOURS:
                    if str(hours_before) in sent_reminders:
                        continue
                        
                    reminder_threshold = appointment_time - timedelta(hours=hours_before)
                    
                    # If it's time to send this reminder
                    if now >= reminder_threshold:
                        
                        # Check if the appointment was booked after the threshold time.
                        # CreatedAt is UTC, so add 5:30 for IST local time comparison
                        created_at_local = appointment.CreatedAt + timedelta(hours=5, minutes=30) if appointment.CreatedAt else None
                        
                        if created_at_local and created_at_local > reminder_threshold:
                            min_hours = min(REMINDER_TIMINGS_HOURS)
                            
                            # If they booked so late that they missed the final reminder entirely
                            if hours_before == min_hours:
                                time_diff = appointment_time - now
                                mins_remaining = int(time_diff.total_seconds() / 60)
                                
                                if mins_remaining > 0:
                                    if mins_remaining >= 60:
                                        rem_hrs = mins_remaining // 60
                                        rem_mins = mins_remaining % 60
                                        time_str = f"{rem_hrs} hours and {rem_mins} minutes" if rem_mins > 0 else f"{rem_hrs} hours"
                                    else:
                                        time_str = f"{mins_remaining} minutes"
                                        
                                    patient_phone = appointment.patient.PhoneNumber if appointment.patient else None
                                    if patient_phone:
                                        logger.info(f"Processed late booking ({time_str}) reminder for {patient_phone} for appointment {appointment.Id}")
                                        
                                    doctor_phone = appointment.doctor.MobileNumber if appointment.doctor else None
                                    if doctor_phone:
                                        logger.info(f"Processed late booking ({time_str}) reminder for doctor {doctor_phone} for appointment {appointment.Id}")
                                        
                            # Mark it as skipped/sent by adding to sent_reminders
                            sent_reminders.append(str(hours_before))
                            appointment.RemindersSent = ",".join(sent_reminders)
                            self.db.commit()
                            continue
                            
                        # Reminder notification
                        patient_phone = appointment.patient.PhoneNumber if appointment.patient else None
                        if patient_phone:
                            logger.info(f"Processed {hours_before}hr reminder for {patient_phone} for appointment {appointment.Id}")
                            
                        doctor_phone = appointment.doctor.MobileNumber if appointment.doctor else None
                        if doctor_phone:
                            logger.info(f"Processed {hours_before}hr reminder for doctor {doctor_phone} for appointment {appointment.Id}")
                            
                        # Mark as sent
                        sent_reminders.append(str(hours_before))
                        appointment.RemindersSent = ",".join(sent_reminders)
                        self.db.commit()
                        
            except Exception as e:
                logger.error(f"Error processing reminders for appointment {appointment.Id}: {e}")
                self.db.rollback()
