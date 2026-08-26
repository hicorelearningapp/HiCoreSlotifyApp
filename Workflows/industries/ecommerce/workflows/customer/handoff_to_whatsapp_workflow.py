from core.workflows.workflow_models import WorkflowResult, Reply, WorkflowStatus
from industries.ecommerce.services.handoff_service import handoff_service
from config import ADMIN_PHONE_NUMBER
from core.channels.identity import strip_prefix

class HandoffToWhatsAppWorkflow:
    def Initialize(self, session):
        product_id = session.WorkflowData.get("product_id")
        ig_id = strip_prefix(session.PhoneNumber)
        
        # Use ADMIN_PHONE_NUMBER as the WhatsApp bot number for the prototype
        wa_link = handoff_service.generate_wa_link(ADMIN_PHONE_NUMBER, product_id, ig_id)
        
        reply_text = f"Great choice! To complete your order securely, please click this link to continue on WhatsApp:\n\n{wa_link}"
        
        reply = Reply("text", reply_text)
        # We finish the workflow here because the user is moving to WhatsApp
        return WorkflowResult.finished(reply)

    def Process(self, session, message):
        pass

    def Complete(self, session):
        return WorkflowResult.finished()
