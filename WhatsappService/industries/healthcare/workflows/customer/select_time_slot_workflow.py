from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.whatsapp_service import whatsapp as WhatsAppService
import time

class SelectTimeSlotWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        date_str = session.WorkflowData.get("date")
        slots = session.WorkflowData.get("slots", [])
        page = session.WorkflowData.get("page", 0)
        
        start_idx = page * 8
        current_slots = slots[start_idx:start_idx+8]
        has_more = len(slots) > start_idx + 8
            
        rows = [{"id": f"SLOT_{s}", "title": s} for s in current_slots]
        if has_more:
            rows.append({"id": f"MORE_SLOTS_{page+1}", "title": "More Slots ->"})
            
        sections = [{"title": "Available Times", "rows": rows}, {"title": "Options", "rows": [{"id": "CANCEL_FLOW", "title": "❌ Cancel", "description": "Return to main menu"}]}]
        text = f"Great, {date_str} has {len(slots)} slots available. Choose a time:" if page == 0 else "Please select a time:"
        
        return WorkflowResult.waiting(reply=Reply("list", text, sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        # if message.InteractiveId == "CANCEL_FLOW":
        #     print("Your booking flow has been cancelled")
        slots = session.WorkflowData.get("slots", [])
        time_str = ""
        
        if message.InteractiveId and message.InteractiveId.startswith("SLOT_"):
            time_str = message.InteractiveId.replace("SLOT_", "")
        elif message.Text:
            time_str = message.Text.strip()

        if time_str in slots:
            session.WorkflowData["time"] = time_str
            return WorkflowResult.completed()

        if message.InteractiveId and message.InteractiveId.startswith("MORE_SLOTS_"):
            session.WorkflowData["page"] = session.WorkflowData.get("page", 0) + 1
            return self.Initialize(session)

        WhatsAppService.send_text(session.PhoneNumber, "Invalid slot. Please select from the menu.")
        
        time.sleep(1.5)
        return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
