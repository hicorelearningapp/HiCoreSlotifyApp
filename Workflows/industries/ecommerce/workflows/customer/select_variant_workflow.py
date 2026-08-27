from core.workflows.workflow_models import WorkflowResult, Reply
from backend_app.modules.ecommerce.services.product_service import product_service
from backend_app.core.database import db_session

class SelectVariantWorkflow:
    def Initialize(self, session):
        product_id = session.WorkflowData.get("product_id")
        variants = product_service.get_variants_by_product_id(db_session, product_id)
        
        if not variants:
            # Should not happen if correctly routed, but fallback just in case
            return WorkflowResult.completed()
            
        rows = []
        for variant in variants:
            rows.append({
                "id": f"VAR_{variant.id}",
                "title": variant.variant_name[:24]
            })
            
        sections = [
            {
                "title": "Variations",
                "rows": rows
            }
        ]
            
        reply = Reply("list", "Great choice! Which variation would you like?", sections=sections)
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        if message.InteractiveId and message.InteractiveId.startswith("VAR_"):
            variant_id = int(message.InteractiveId.split("_")[1])
            product_id = session.WorkflowData.get("product_id")
            
            # Fetch to get the price override
            variants = product_service.get_variants_by_product_id(db_session, product_id)
            selected_variant = next((v for v in variants if v.id == variant_id), None)
            
            if selected_variant:
                session.WorkflowData["variant_id"] = selected_variant.id
                session.WorkflowData["variant_name"] = selected_variant.variant_name
                if selected_variant.price:
                    session.WorkflowData["product_price"] = selected_variant.price # Override price
                return WorkflowResult.completed()
                
        return WorkflowResult.waiting(Reply("text", "Please select a variation from the list."))

    def Complete(self, session):
        return WorkflowResult.completed()
