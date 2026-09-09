from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from core.api_client import api_client as product_service

class MainMenuWorkflow:
    def Initialize(self, session):
        options = [
            {"id": "BUY_PRODUCTS", "title": "Buy Products", "description": "Browse our catalog"},
            {"id": "TRACK_ORDER", "title": "Track Order", "description": "Check order status"}
        ]
        
        reply = Reply("list", "Welcome! What would you like to do?", sections=[{"title": "Menu", "rows": options}])
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        if message.InteractiveId == "BUY_PRODUCTS":
            return WorkflowResult.completed()
        elif message.InteractiveId == "TRACK_ORDER":
            session.state.SequenceName = "TrackOrderSequence"
            session.state.WorkflowIndex = -1 # to start at 0
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please select a valid option."))

    def Complete(self, session):
        return WorkflowResult.completed()
