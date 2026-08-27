from core.config.BusinessManager import BusinessManager

class ConversationManagerFactory:
    """
    Spawns the correct conversation manager based on the industry determined by the business configuration.
    """
    @staticmethod
    def get_manager(business_phone: str | None = None):
        industry = BusinessManager.get_industry(business_phone)
        
        if industry == "ecommerce":
            from industries.ecommerce.EcommerceConversationManager import EcommerceConversationManager
            return EcommerceConversationManager()
        else:
            # Default to healthcare
            from industries.healthcare.HealthcareConversationManager import HealthcareConversationManager
            return HealthcareConversationManager()
