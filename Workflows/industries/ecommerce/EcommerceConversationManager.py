import logging
from core.Sequence import SequenceFactory
from core.conversation.BaseConversationManager import BaseConversationManager
from backend_app.core.database import db_session

class EcommerceConversationManager(BaseConversationManager):
    """
    Ecommerce-specific conversation manager.
    """
    pass

async def ecommerce_deep_link_interceptor(manager: BaseConversationManager, session, message, customer_phone: str) -> bool:
    """Spot a product deep link arriving from Instagram or a QR code and jump to the order flow."""
    if not (message and message.Text and not session.workflow_initialized):
        return False

    from backend_app.modules.ecommerce.services.handoff_service import handoff_service
    from backend_app.modules.ecommerce.services.product_service import product_service

    handoff_data = handoff_service.parse_order_text(message.Text)
    if not (handoff_data and "product_name" in handoff_data):
        return False

    identifier = handoff_data.get("product_id") or handoff_data["product_name"]
    product = product_service.get_product_by_name_or_id(db_session, identifier)
    if not product:
        return False

    # Deep link matched a product! Find the sequence to jump to.
    sequence_name = manager._resolve_order_sequence(session, product.id)
    if not sequence_name:
        logging.getLogger("uvicorn").warning(
            "Product deep link received for business %s but no "
            "order_handoff_sequence is configured; ignoring the jump.",
            session.state.BusinessPhoneNumber or "<default>",
        )
        return False

    try:
        manager.Sequence = SequenceFactory.Get(
            sequence_name, db_session, session.state.BusinessPhoneNumber
        )
    except ValueError:
        logging.getLogger("uvicorn").warning(
            "order_handoff_sequence '%s' is not defined for business %s.",
            sequence_name, session.state.BusinessPhoneNumber or "<default>",
        )
        return False

    manager.Workflows = manager.Sequence.GetAll()
    session.state.SequenceName = sequence_name
    
    session.WorkflowData["product_id"] = product.id
    session.WorkflowData["category_id"] = product.category_id

    # Catalogues that carry variants start at the variant picker; the rest at quantity
    target_idx = manager.Sequence.IndexOfName("SelectVariantWorkflow")
    if target_idx == -1:
        target_idx = manager.Sequence.IndexOfName("SelectQuantityWorkflow")

    if target_idx != -1:
        session.state.WorkflowIndex = target_idx
        # We successfully intercepted, tell the core manager to skip processing this message further
        # by returning True. The manager will evaluate the new Sequence on the next iteration.
        
        # Actually, wait. BaseConversationManager process() does:
        # stop_processing = await self.apply_industry_interceptions(session, message, customer_phone)
        # if stop_processing:
        #     return
        # If we return True, it exits process() entirely.
        # Previously execute_industry_handoff_jump did: `return None` which set message=None and let it continue.
        # If we just change the session state and set message.Text = None (or return False but set state),
        # Wait, if interceptor returns True, it stops. But we want it to process the next workflow step!
        # If we return False but modify the session, the manager will continue to `message = None`.
        pass
    
    # Let's adjust interceptor to return False so it continues executing the new Sequence immediately
    # We must ensure `message` is cleared so it doesn't try to pass the deep link text as a reply.
    message.Text = None
    message.InteractiveId = None
    return False

# Register the global interceptor
BaseConversationManager.register_interceptor(ecommerce_deep_link_interceptor)
