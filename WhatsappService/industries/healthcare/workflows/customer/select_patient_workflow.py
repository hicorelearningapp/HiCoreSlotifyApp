from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client
# from core.services.language_manager import LanguageManager
from core.services.whatsapp_service import whatsapp as WhatsAppService
import time



class SelectPatientWorkflow(Workflow):
    
    def Initialize(self, session: ConversationSession):
        
        sequence = session.state.SequenceName
        text = "Who is this appointment for?"
        if sequence == "PatientViewSequence": text = "Whose appointments are you viewing?"
        elif sequence == "PatientCancelSequence": text = "Whose appointment are you cancelling?"

        cust = api_client.get_customer_by_phone(session.PhoneNumber)
        patients = api_client.get_profiles_by_phone(session.PhoneNumber) or []
        
        rows = []
        if cust:
            rows.append({"id": "SELF", "title": f"Myself ({cust.get('CustomerName', '')[:15]})", "description": "Book for yourself"})
            
        other_patients = [p for p in patients if p.get("PatientName") != (cust.get("CustomerName") if cust else "")][:7]
        
        if sequence in ["PatientViewSequence", "PatientCancelSequence"] and not other_patients and cust:
            session.WorkflowData["patient_id"] = cust.get("PatientId")
            return WorkflowResult.completed()
            
        for p in other_patients:
            rows.append({"id": f"PATIENT_{p.get('PatientId')}", "title": p.get("PatientName", "")[:24], "description": "Saved Patient"})
            
        if sequence in ["PatientRegisterAndBookSequence"]:
            rows.append({"id": "ADD_NEW_PERSON", "title": "+ Add New Person", "description": "Register someone else"})
        
        sections = [{"title": "Select Patient", "rows": rows}, {"title": "Options", "rows": [{"id": "CANCEL_FLOW", "title": "❌ Cancel", "description": "Return to main menu"}]}]
            
        return WorkflowResult.waiting(reply=Reply("list", text, sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        patients = session.WorkflowData.get("patients", [])
        
        if message.InteractiveId == "ADD_NEW_PERSON":
            session.WorkflowData["is_adding_new_person"] = True
            return WorkflowResult.waiting(reply=Reply("text", "Please type the full name of the new person you are booking for:"))

        if session.WorkflowData.get("is_adding_new_person"):
            if message.Text and message.Text.strip().lower() in ["cancel", "quit", "abort", "back"]:
                session.WorkflowData["is_adding_new_person"] = False
                return self.Initialize(session)
            if not message.Text:
                return WorkflowResult.waiting(reply=Reply("text", "Please type a valid name for the new person."))
            new_name = message.Text.strip()
            new_patient = api_client.add_patient_by_phone(session.PhoneNumber, {"PatientName": new_name})
            session.WorkflowData["patient_id"] = new_patient.get("PatientId")
            session.WorkflowData["is_adding_new_person"] = False
            return WorkflowResult.completed()
            
        if message.InteractiveId == "SELF":
            cust = api_client.get_customer_by_phone(session.PhoneNumber)
            if cust: session.WorkflowData["patient_id"] = cust.get("PatientId")

        elif message.InteractiveId and message.InteractiveId.startswith("PATIENT_"):
            session.WorkflowData["patient_id"] = message.InteractiveId.replace("PATIENT_", "")
            
        elif message.Text:
            text_lower = message.Text.strip().lower()
            if text_lower in ["self", "myself", "for myself", "me"]:
                cust = api_client.get_customer_by_phone(session.PhoneNumber)
                if cust: session.WorkflowData["patient_id"] = cust.get("PatientId")
            else:
                patients = api_client.get_profiles_by_phone(session.PhoneNumber) or []
                matched_patient = next((p for p in patients if p.get("Name", "").lower() == text_lower), None)
                if matched_patient:
                    session.WorkflowData["patient_id"] = matched_patient.get("PatientId")

        if "patient_id" in session.WorkflowData:
            return WorkflowResult.completed()

        WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.", business_phone_id=session.state.BusinessPhoneNumberId)
        time.sleep(1.5)
        return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
