from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client

class ViewAppointmentsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        patients = api_client.get_profiles_by_phone(session.PhoneNumber) or []
        patient_ids = [p.get("PatientId") for p in patients]
        
        all_appointments = []
        for pid in patient_ids:
            res = api_client.list_appointments(patient_id=pid)
            if res and isinstance(res, dict) and "Appointments" in res:
                all_appointments.extend(res["Appointments"])
            elif res and isinstance(res, dict) and "items" in res:
                all_appointments.extend(res["items"])
            elif isinstance(res, list):
                all_appointments.extend(res)
            
        all_appointments.sort(key=lambda x: (x.get("Date", ""), x.get("SlotTime", "")))

        if not all_appointments:
            return WorkflowResult.finished(reply=Reply("text", session.translate("view_no_appointments")))
        
        msg = session.translate("view_upcoming_appointments")
        for idx, appt in enumerate(all_appointments, 1):
            pat_name = appt.get("patient", {}).get("PatientName") if appt.get("patient") else "Unknown"
            doc_name = appt.get("doctor", {}).get("FullName") if appt.get("doctor") else "Unknown Doctor"
            date_str = appt.get("Date", "Unknown Date")
            time_str = appt.get("SlotTime", "Unknown Time")
            
            msg += session.translate("view_appointment_item", idx=idx, pat_name=pat_name, doc_name=doc_name, date_str=date_str, time_str=time_str)
            if appt.get('ConsultationType') == "Video": 
                msg += session.translate("view_video_consult")
                if appt.get('MeetingLink'):
                    msg += f"🔗 Link: {appt.get('MeetingLink')}\n"
                    
                email_to_use = appt.get("patient", {}).get('EmailAddress') if appt.get("patient") else None
                if not email_to_use and appt.get("patient"):
                    primary_cust = api_client.get_customer_by_phone(appt.get("patient", {}).get("PhoneNumber"))
                    if primary_cust:
                        email_to_use = primary_cust.get('EmailAddress')
                        
                if email_to_use:
                    msg += session.translate("view_video_join_email", email=email_to_use)
            msg += "\n"
            
        msg += session.translate("view_return_main")
        return WorkflowResult.finished(reply=Reply("text", msg))
    def Process(self, session: ConversationSession, message: Message):
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
