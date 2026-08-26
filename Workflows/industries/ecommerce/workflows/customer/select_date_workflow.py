from datetime import datetime, date, timedelta
from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import (
    ConversationSession,
    Message,
    WorkflowResult,
    Reply,
    WorkflowStatus
)

class SelectDateWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        sections = [{"title": "Upcoming Dates", "rows": []}]
        
        current_date = date.today()
        for i in range(7):
            dt = current_date + timedelta(days=i)
            sections[0]["rows"].append(
                {
                    "id": f"DATE_{dt.strftime('%Y-%m-%d')}",
                    "title": dt.strftime("%b %d, %Y")[:24],
                    "description": dt.strftime("%A")[:72],
                }
            )

        sections.append(
            {
                "title": "Options",
                "rows": [
                    {"id": "CANCEL_FLOW", "title": "Cancel Booking", "description": "Cancel"}
                ],
            }
        )

        interactive_data = {
            "type": "list",
            "header": {"type": "text", "text": "Select Booking Date"},
            "body": {"text": "Please select a date for your vehicle booking:"},
            "footer": {"text": "Select from the list"},
            "action": {"button": "Dates", "sections": sections},
        }

        reply = Reply(message_type="interactive", text="", interactive_data=interactive_data)
        return WorkflowResult.waiting(reply)

    def Process(self, session: ConversationSession, message: Message):
        if not message.InteractiveId or not message.InteractiveId.startswith("DATE_"):
            reply = Reply("text", "Please select a valid date from the menu.")
            return WorkflowResult.waiting(reply)

        selected_date = message.InteractiveId.replace("DATE_", "")
        session.WorkflowData["date"] = selected_date
        session.WorkflowData["booking_date"] = selected_date
        
        reply = Reply("text", f"Great! We've saved your date: {selected_date}.")
        return WorkflowResult.completed(reply)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.finished()
