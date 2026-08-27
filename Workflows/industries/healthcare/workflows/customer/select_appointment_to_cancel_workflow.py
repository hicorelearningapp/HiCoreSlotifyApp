from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
from backend_app.modules.doctor_appointment.services.customer_service import CustomerService
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService


class SelectAppointmentToCancelWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        patients = CustomerService().get_profiles_by_phone(session.PhoneNumber)
        patient_ids = [p.PatientId for p in patients]
        
        all_appointments = []
        appt_service = AppointmentService()
        for pid in patient_ids:
            all_appointments.extend(appt_service.get_customer_appointments(pid))
            
        all_appointments.sort(key=lambda x: (x.Date, x.SlotTime))
        
        if not all_appointments:
            return WorkflowResult.finished(reply=Reply("text", session.translate("cancel_no_appointments")))
            
        rows = []
        for appt in all_appointments[:10]:
            doc_name = appt.DoctorName or (appt.doctor.FullName if appt.doctor else 'Unknown')
            pat_name = appt.patient.Name if appt.patient else 'Unknown'
            date_str = appt.Date.strftime('%b %d, %Y') if appt.Date else 'N/A'
            time_str = appt.SlotTime.strftime('%I:%M %p') if appt.SlotTime else 'N/A'
            
            title_str = f"{date_str} {time_str}"
            if len(title_str) > 24:
                title_str = title_str[:24]

            desc_str = f"{pat_name} w/ {doc_name}"
            if len(desc_str) > 72:
                desc_str = desc_str[:69] + "..."

            rows.append({
                "id": f"CANCEL_APPT_{appt.Id}",
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
