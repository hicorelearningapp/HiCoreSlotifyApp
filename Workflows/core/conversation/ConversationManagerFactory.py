from core.config.BusinessManager import BusinessManager

class ConversationManagerFactory:
    """
    Spawns the correct conversation manager based on the industry determined by the business configuration.
    """
    @staticmethod
    def get_manager(db_session, business_phone: str = None):
        industry = BusinessManager.get_industry(db_session, business_phone)
        
        if industry == "ecommerce":
            from industries.ecommerce.conversation.EcommerceConversationManager import EcommerceConversationManager
            return EcommerceConversationManager()
        else:
            # Default to healthcare
            from industries.healthcare.conversation.HealthcareConversationManager import HealthcareConversationManager
            return HealthcareConversationManager()
