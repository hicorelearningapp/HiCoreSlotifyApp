from core.models.workflow_models import WorkflowResult, Reply
from core.api_client import api_client as product_service

class SelectVariantWorkflow:
    def Initialize(self, session):
        product_id = session.WorkflowData.get("product_id")
        
        # Fetch full product to access JSON structure
        product = product_service.get_product(product_id)
        if not product:
            return WorkflowResult.completed()
            
        product_data = product.get("product_data") or {}
        options = product_data.get("options", [])
        variants = product_data.get("variants", [])
        
        # Legacy/Flat variant fallback
        if not options or not variants:
            legacy_variants = product_service.get_variants_by_product_id(product_id)
            if not legacy_variants:
                return WorkflowResult.completed()
            rows = [{"id": f"VAR_{v.get('id')}", "title": v.get('variant_name', '')[:24]} for v in legacy_variants]
            sections = [{"title": "Variations", "rows": rows}]
            return WorkflowResult.waiting(Reply("list", "Great choice! Which variation would you like?", sections=sections))

        # Dynamic multi-dimensional option mode
        selected_options = session.WorkflowData.get("selected_options", {})
        
        # Find first unselected option
        next_option = None
        for opt in options:
            if opt["name"] not in selected_options:
                next_option = opt
                break
                
        if not next_option:
            # All options selected! Match variant.
            matching_variant = None
            for var in variants:
                if var.get("options", {}) == selected_options:
                    matching_variant = var
                    break
                    
            if matching_variant:
                session.WorkflowData["variant_id"] = matching_variant.get('id')
                session.WorkflowData["variant_name"] = " / ".join(selected_options.values())
                if matching_variant.get('price'):
                    session.WorkflowData["product_price"] = matching_variant.get('price')
            
            session.WorkflowData.pop("selected_options", None)
            return WorkflowResult.completed()
            
        # Present the next option
        option_name = next_option["name"]
        available_values = next_option.get("values", [])
        
        # Filter values based on stock for already selected options
        valid_rows = []
        for val in available_values:
            potential_match = {**selected_options, option_name: val}
            for var in variants:
                var_options = var.get("options", {})
                
                # Check if var_options contains all items from potential_match
                is_match = all(var_options.get(k) == v for k, v in potential_match.items())
                        
                if is_match and var.get("active", True) and var.get("stock_quantity", 0) > 0:
                    valid_rows.append({
                        "id": f"OPT_{option_name}_{val}",
                        "title": val[:24]
                    })
                    break 
                    
        if not valid_rows:
            session.WorkflowData.pop("selected_options", None)
            return WorkflowResult.waiting(Reply("text", "Sorry, that combination is out of stock. Please type something to start over."))
            
        sections = [
            {
                "title": f"Select {option_name}",
                "rows": valid_rows
            }
        ]
        
        reply = Reply("list", f"Please select {option_name}:", sections=sections)
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        # Handle dynamic option selection
        if message.InteractiveId and message.InteractiveId.startswith("OPT_"):
            parts = message.InteractiveId.split("_", 2)
            if len(parts) == 3:
                opt_name = parts[1]
                opt_val = parts[2]
                
                selected_options = session.WorkflowData.get("selected_options", {})
                selected_options[opt_name] = opt_val
                session.WorkflowData["selected_options"] = selected_options
                
                return self.Initialize(session)
                
        # Handle legacy flat variants
        elif message.InteractiveId and message.InteractiveId.startswith("VAR_"):
            variant_id = int(message.InteractiveId.split("_")[1])
            product_id = session.WorkflowData.get("product_id")
            legacy_variants = product_service.get_variants_by_product_id(product_id)
            selected_variant = next((v for v in legacy_variants if v.get('id') == variant_id), None)
            
            if selected_variant:
                session.WorkflowData["variant_id"] = selected_variant.get('id')
                session.WorkflowData["variant_name"] = selected_variant.get('variant_name')
                if selected_variant.get('price'):
                    session.WorkflowData["product_price"] = selected_variant.get('price')
                return WorkflowResult.completed()
                
        return WorkflowResult.waiting(Reply("text", "Please make a selection from the list."))

    def Complete(self, session):
        return WorkflowResult.completed()
