from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus

class SelectQuantityWorkflow:
    def Initialize(self, session):
        rows = [
            {"id": "QTY_1", "title": "1"},
            {"id": "QTY_2", "title": "2"},
            {"id": "QTY_3", "title": "3"},
            {"id": "QTY_4", "title": "4"},
            {"id": "QTY_5", "title": "5"}
        ]
        
        sections = [
            {
                "title": "Select Quantity",
                "rows": rows
            }
        ]
        
        reply = Reply("list", "How many would you like?", sections=sections)
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        quantity = None
        if message.InteractiveId and message.InteractiveId.startswith("QTY_"):
            quantity = int(message.InteractiveId.split("_")[1])
        elif message.Text and message.Text.isdigit():
            quantity = int(message.Text)
            
        if quantity is not None and quantity > 0:
            from backend_app.modules.ecommerce.services.product_service import product_service
            from backend_app.core.database import db_session
            
            product_id = session.WorkflowData.get("product_id")
            variant_id = session.WorkflowData.get("variant_id")
            
            if variant_id:
                variants = product_service.get_variants_by_product_id(db_session, product_id)
                selected_variant = next((v for v in variants if v.id == variant_id), None)
                if selected_variant and quantity > selected_variant.stock_quantity:
                    return WorkflowResult.waiting(Reply("text", f"Sorry, only {selected_variant.stock_quantity} units of this variation are currently in stock. Please enter a lower quantity."))
                    
            session.WorkflowData["quantity"] = quantity
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please enter a valid positive number or select from the options."))

    def Complete(self, session):
        return WorkflowResult.completed()
