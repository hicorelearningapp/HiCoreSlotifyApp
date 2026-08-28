from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from core.api_client import api_client as product_service

class SelectProductWorkflow:
    def Initialize(self, session):
        cat_id = session.WorkflowData.get("category_id")
        products = product_service.get_products_by_category(cat_id)
        
        if not products:
            session.state.WorkflowIndex = 0
            session.current_workflow = "SEQUENCE_CHANGED"
            session.state.Initialized = False
            return WorkflowResult.completed(Reply("text", "No products available in this category."))
            
        page = session.WorkflowData.get("product_page", 0)
        items_per_page = 9
        
        start_idx = page * items_per_page
        end_idx = start_idx + items_per_page
        
        paginated_products = products[start_idx:end_idx]
        has_more = len(products) > end_idx
            
        options = []
        for p in paginated_products:
            options.append({"id": f"PROD_{p.get('id')}", "title": p.get('name', '')[:24], "description": f"₹{p.get('price', 0)}"})
            
        if has_more:
            options.append({"id": "SHOW_MORE_PRODUCTS", "title": "Show more items ➡️", "description": "Tap to see more"})
            
        reply = Reply("list", "Please select a product:", options=options, sections=[{"title": f"Products (Page {page+1})", "rows": options}])
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        if message.InteractiveId == "SHOW_MORE_PRODUCTS":
            session.WorkflowData["product_page"] = session.WorkflowData.get("product_page", 0) + 1
            return self.Initialize(session)
            
        if message.InteractiveId and message.InteractiveId.startswith("PROD_"):
            session.WorkflowData["product_id"] = int(message.InteractiveId.split("_")[1])
            # Reset page for next time
            session.WorkflowData.pop("product_page", None)
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please select a product from the list."))

    def Complete(self, session):
        return WorkflowResult.completed()
