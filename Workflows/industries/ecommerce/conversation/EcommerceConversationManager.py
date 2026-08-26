from core.conversation.BaseConversationManager import BaseConversationManager
from backend_app.core.database import db_session
from core.sequence.Sequence import SequenceFactory

class EcommerceConversationManager(BaseConversationManager):
    """
    Ecommerce-specific conversation manager.
    Injects global handoff interception logic specific to ecommerce products and ordering.
    """
    
    async def apply_industry_interceptions(self, session, message, customer_phone: str):
        # --- GLOBAL HANDOFF INTERCEPTION ---
        # Note: Imports are inside to avoid circular dependencies if needed
        from industries.ecommerce.services.handoff_service import handoff_service
        from industries.ecommerce.services.product_service import product_service
        
        if message and message.Text and not session.workflow_initialized:
            handoff_data = handoff_service.parse_order_text(message.Text)
            if handoff_data and "product_name" in handoff_data:
                # An id in the deep link wins over the name -- names can collide
                # across vendors, ids cannot.
                identifier = handoff_data.get("product_id") or handoff_data["product_name"]
                product = product_service.get_product_by_name_or_id(db_session, identifier)

                if product:
                    session.WorkflowData["product_id"] = product.id
                    session.WorkflowData["category_id"] = product.category_id
                    
                    # We will find the target workflow to jump to in the sequence later down below.
                    session.WorkflowData["_handoff_pending"] = True
                    
        return False # Do not stop processing

    async def execute_industry_handoff_jump(self, session, message, customer_phone: str):
        # --- EXECUTE HANDOFF JUMP ---
        if session.WorkflowData.pop("_handoff_pending", False):
            product_id = session.WorkflowData.get("product_id")
            
            # Determine which sequence to load based on product_id
            if product_id in [1, 2, 3]:
                session.state.SequenceName = "SareeOrderSequence"
            elif product_id in [7, 8]:
                session.state.SequenceName = "RingOrderSequence"
            else:
                session.state.SequenceName = "SareeOrderSequence" # Default fallback
                
            # Reload Sequence with the newly selected SequenceName
            self.Sequence = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
            self.Workflows = self.Sequence.GetAll()

            target_idx = self.Sequence.IndexOfName("SelectVariantWorkflow")
            if target_idx == -1:
                target_idx = self.Sequence.IndexOfName("SelectQuantityWorkflow")
                
            if target_idx != -1:
                session.state.WorkflowIndex = target_idx
                return None # Clear the message
                
        return message
