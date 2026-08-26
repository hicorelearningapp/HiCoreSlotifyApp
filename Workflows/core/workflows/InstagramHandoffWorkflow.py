"""
Hands an Instagram conversation over to WhatsApp.

Instagram is a funnel, not a place where business gets done: comments get a
public reply and a DM, and everything past that happens on WhatsApp. This
workflow is the last step of any Instagram sequence -- it sends the wa.me link
and finishes, so the conversation resumes on the WhatsApp side.

Two shapes of link, matching InstagramHandoffService:
  a product is known -> an order link whose prefill carries the product id, so
                        the WhatsApp side resolves the exact row
  no product         -> a plain booking link, so WhatsApp starts on the normal
                        greeting flow
"""
from config import INSTAGRAM_HANDOFF_PREFILL_TEXT, INSTAGRAM_HANDOFF_WA_NUMBER
from core.channels.identity import strip_prefix
from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import Reply, WorkflowResult
from industries.ecommerce.services.handoff_service import handoff_service


class InstagramHandoffWorkflow(Workflow):
    def Initialize(self, session):
        product_id = session.WorkflowData.get("product_id")
        product_name = session.WorkflowData.get("product_name") or "your order"

        if product_id:
            wa_link = handoff_service.generate_wa_link(
                INSTAGRAM_HANDOFF_WA_NUMBER,
                product_name,
                strip_prefix(session.PhoneNumber),
                product_id=product_id,
            )
            body = session.translate("instagram_handoff_order")
        else:
            wa_link = handoff_service.generate_booking_link(
                INSTAGRAM_HANDOFF_WA_NUMBER,
                INSTAGRAM_HANDOFF_PREFILL_TEXT,
            )
            body = session.translate("instagram_handoff_booking")

        # finished() rather than completed(): the conversation continues on
        # WhatsApp under a different id, so this session has nothing left to do.
        return WorkflowResult.finished(Reply("text", f"{body}\n\n{wa_link}"))

    def Process(self, session, message):
        return WorkflowResult.finished()

    def Complete(self, session):
        return WorkflowResult.finished()
