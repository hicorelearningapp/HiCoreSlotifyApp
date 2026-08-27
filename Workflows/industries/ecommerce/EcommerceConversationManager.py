from core.conversation.BaseConversationManager import BaseConversationManager


class EcommerceConversationManager(BaseConversationManager):
    """
    Ecommerce-specific conversation manager.

    The product deep-link handoff used to live here, which meant it only ran
    for businesses configured as ecommerce -- so a business sharing one
    WhatsApp number across both industries never saw it. It is now in
    BaseConversationManager and driven by the order_handoff_sequence and
    product_order_sequences settings, so every business gets it.
    """
    pass
