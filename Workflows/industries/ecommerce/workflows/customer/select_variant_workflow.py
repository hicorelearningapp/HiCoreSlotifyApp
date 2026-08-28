from core.models.workflow_models import WorkflowResult, Reply
from core.api_client import api_client as product_service

class SelectVariantWorkflow:
    def Initialize(self, session):
        product_id = session.WorkflowData.get("product_id")
        variants = product_service.get_variants_by_product_id(product_id)
        
        if not variants:
            # Should not happen if correctly routed, but fallback just in case
            return WorkflowResult.completed()
            
        rows = []
        for variant in variants:
            rows.append({
                "id": f"VAR_{variant.get('id')}",
                "title": variant.get('variant_name', '')[:24]
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
            variants = product_service.get_variants_by_product_id(product_id)
            selected_variant = next((v for v in variants if v.get('id') == variant_id), None)
            
            if selected_variant:
                session.WorkflowData["variant_id"] = selected_variant.get('id')
                session.WorkflowData["variant_name"] = selected_variant.get('variant_name')
                if selected_variant.get('price'):
                    session.WorkflowData["product_price"] = selected_variant.get('price') # Override price
                return WorkflowResult.completed()
                
        return WorkflowResult.waiting(Reply("text", "Please select a variation from the list."))

    def Complete(self, session):
        return WorkflowResult.completed()
