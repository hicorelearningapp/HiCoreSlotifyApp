from core.workflows.workflow_models import WorkflowResult, Reply, WorkflowStatus
from backend_app.modules.ecommerce.services.product_service import product_service
from backend_app.core.database import db_session

class SelectCategoryWorkflow:
    def Initialize(self, session):
        store_id = session.state.BusinessPhoneNumber if session.state.BusinessPhoneNumber else "default"
        categories = product_service.get_all_categories(db_session, store_id)
        options = []
        for cat in categories:
            options.append({"id": f"CAT_{cat.id}", "title": cat.name[:24], "description": cat.description or ""})
            
        if not options:
            session.state.WorkflowIndex = 0
            session.current_workflow = "SEQUENCE_CHANGED"
            session.state.Initialized = False
            return WorkflowResult.completed(Reply("text", "No categories available at the moment."))
            
        reply = Reply("list", "Please select a category:", sections=[{"title": "Categories", "rows": options}])
        return WorkflowResult.waiting(reply)
        
    def Process(self, session, message):
        if message.InteractiveId and message.InteractiveId.startswith("CAT_"):
            session.WorkflowData["category_id"] = int(message.InteractiveId.split("_")[1])
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please select a category from the list."))

    def Complete(self, session):
        return WorkflowResult.completed()
