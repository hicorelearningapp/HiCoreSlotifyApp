from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client
from core.services.whatsapp_service import whatsapp as WhatsAppService


class SelectAppointmentToCancelWorkflow(Workflow):
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
            return WorkflowResult.finished(reply=Reply("text", session.translate("cancel_no_appointments")))
            
        rows = []
        for appt in all_appointments[:10]:
            doc_name = appt.get("DoctorName") or (appt.get("doctor", {}).get("FullName") if appt.get("doctor") else 'Unknown')
            pat_name = appt.get("patient", {}).get("Name") if appt.get("patient") else 'Unknown'
            date_str = appt.get("Date") if appt.get("Date") else 'N/A'
            time_str = appt.get("SlotTime") if appt.get("SlotTime") else 'N/A'
            
            title_str = f"{date_str} {time_str}"
            if len(title_str) > 24:
                title_str = title_str[:24]

            desc_str = f"{pat_name} w/ {doc_name}"
            if len(desc_str) > 72:
                desc_str = desc_str[:69] + "..."

            rows.append({
                "id": f"CANCEL_APPT_{appt.get('Id')}",
                "title": title_str,
                "description": desc_str
            })
            
        sections = [{"title": session.translate("section_select_appointment"), "rows": rows}]
        
        return WorkflowResult.waiting(
            reply=Reply(
                message_type="list", 
                text=session.translate("prompt_select_cancel"), 
                sections=sections
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId and message.InteractiveId.startswith("CANCEL_APPT_"):
            session.WorkflowData["appointment_id_to_cancel"] = message.InteractiveId.replace("CANCEL_APPT_", "")
            return WorkflowResult.completed()

        WhatsAppService.send_text(session.PhoneNumber, session.translate("error_invalid_appointment"))
        return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
