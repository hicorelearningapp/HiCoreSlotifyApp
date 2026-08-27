from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
from backend_app.modules.doctor_appointment.services.customer_service import CustomerService

class ViewAppointmentsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        patients = CustomerService().get_profiles_by_phone(session.PhoneNumber)
        patient_ids = [p.PatientId for p in patients]
        
        all_appointments = []
        appt_service = AppointmentService()
        for pid in patient_ids:
            all_appointments.extend(appt_service.get_customer_appointments(pid))
            
        all_appointments.sort(key=lambda x: (x.Date, x.SlotTime))

        if not all_appointments:
            return WorkflowResult.finished(reply=Reply("text", session.translate("view_no_appointments")))
        
        msg = session.translate("view_upcoming_appointments")
        for idx, appt in enumerate(all_appointments, 1):
            pat_name = appt.patient.PatientName if appt.patient else "Unknown"
            doc_name = appt.doctor.FullName if appt.doctor else "Unknown Doctor"
            date_str = appt.Date.strftime('%A, %b %d, %Y') if appt.Date else 'Unknown Date'
            time_str = appt.SlotTime.strftime('%I:%M %p') if appt.SlotTime else 'Unknown Time'
            
            msg += session.translate("view_appointment_item", idx=idx, pat_name=pat_name, doc_name=doc_name, date_str=date_str, time_str=time_str)
            if getattr(appt, 'ConsultationType', None) == "Video": 
                msg += session.translate("view_video_consult")
                if getattr(appt, 'MeetingLink', None):
                    msg += f"🔗 Link: {appt.MeetingLink}\n"
                    
                email_to_use = getattr(appt.patient, 'EmailAddress', None) if appt.patient else None
                if not email_to_use and appt.patient:
                    primary_cust = CustomerService().get_customer_by_phone(appt.patient.PhoneNumber)
                    if primary_cust:
                        email_to_use = getattr(primary_cust, 'EmailAddress', None)
                        
                if email_to_use:
                    msg += session.translate("view_video_join_email", email=email_to_use)
            msg += "\n"
            
        msg += session.translate("view_return_main")
        return WorkflowResult.finished(reply=Reply("text", msg))
    def Process(self, session: ConversationSession, message: Message):
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
