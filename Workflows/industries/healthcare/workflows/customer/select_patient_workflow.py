from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.customer_service import CustomerService
from core.services.language_manager import LanguageManager
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
import time



class SelectPatientWorkflow(Workflow):
    
    def Initialize(self, session: ConversationSession):
        
        sequence = session.state.SequenceName
        text = session.translate("select_patient_book")
        if sequence == "PatientViewSequence": text = session.translate("select_patient_view")
        elif sequence == "PatientCancelSequence": text = session.translate("select_patient_cancel")

        customer_service = CustomerService()
        cust = customer_service.get_customer_by_phone(session.PhoneNumber)
        patients = customer_service.get_profiles_by_phone(session.PhoneNumber)
        
        rows = []
        if cust:
            rows.append({"id": "SELF", "title": session.translate("select_patient_myself", name=cust.CustomerName[:15]), "description": session.translate("select_patient_myself_desc")})
            
        other_patients = [p for p in patients if p.Name != (cust.CustomerName if cust else "")][:7]
        
        if sequence in ["PatientViewSequence", "PatientCancelSequence"] and not other_patients and cust:
            session.WorkflowData["patient_id"] = cust.Id
            return WorkflowResult.completed()
            
        for p in other_patients:
            rows.append({"id": f"PATIENT_{p.Id}", "title": p.Name[:24], "description": session.translate("select_patient_saved")})
            
        if sequence in ["PatientRegisterAndBookSequence"]:
            rows.append({"id": "ADD_NEW_PERSON", "title": session.translate("select_patient_add"), "description": session.translate("select_patient_add_desc")})
        
        sections = [{"title": session.translate("section_select_patient"), "rows": rows}, {"title": session.translate("section_options"), "rows": [{"id": "CANCEL_FLOW", "title": session.translate("btn_cancel"), "description": session.translate("btn_cancel_desc")}]}]
            
        return WorkflowResult.waiting(reply=Reply("list", text, sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        patients = session.WorkflowData.get("patients", [])
        
        if message.InteractiveId == "ADD_NEW_PERSON":
            session.WorkflowData["is_adding_new_person"] = True
            return WorkflowResult.waiting(reply=Reply("text", session.translate("prompt_add_person")))

        if session.WorkflowData.get("is_adding_new_person"):
            if message.Text and message.Text.strip().lower() in ["cancel", "quit", "abort", "back"]:
                session.WorkflowData["is_adding_new_person"] = False
                return self.Initialize(session)
            if not message.Text:
                return WorkflowResult.waiting(reply=Reply("text", session.translate("prompt_add_person_invalid")))
            new_name = message.Text.strip()
            new_patient = CustomerService().add_patient_by_phone(session.PhoneNumber, new_name)
            session.WorkflowData["patient_id"] = new_patient.Id
            session.WorkflowData["is_adding_new_person"] = False
            return WorkflowResult.completed()
            
        if message.InteractiveId == "SELF":
            cust = CustomerService().get_customer_by_phone(session.PhoneNumber)
            if cust: session.WorkflowData["patient_id"] = cust.Id

        elif message.InteractiveId and message.InteractiveId.startswith("PATIENT_"):
            session.WorkflowData["patient_id"] = message.InteractiveId.replace("PATIENT_", "")
            
        elif message.Text:
            text_lower = message.Text.strip().lower()
            if text_lower in ["self", "myself", "for myself", "me"]:
                cust = CustomerService().get_customer_by_phone(session.PhoneNumber)
                if cust: session.WorkflowData["patient_id"] = cust.Id
            else:
                patients = CustomerService().get_profiles_by_phone(session.PhoneNumber)
                matched_patient = next((p for p in patients if p.Name.lower() == text_lower), None)
                if matched_patient:
                    session.WorkflowData["patient_id"] = matched_patient.Id

        if "patient_id" in session.WorkflowData:
            return WorkflowResult.completed()

        WhatsAppService.send_text(session.PhoneNumber, session.translate("invalid_option"))
        time.sleep(1.5)
        return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
