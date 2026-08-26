from dataclasses import dataclass, field
from config import ADMIN_PHONE_NUMBER
from backend_app.core.database import db_session

@dataclass
class IdentityResult:
    UserType: str = None
    AccountId: str = None
    ProfileId: str = None
    Sequence: str = None
    WorkflowIndex: int = 0
    WorkflowData: dict = field(default_factory=dict)
    IsRegistered: bool = False

class BaseIdentifyService:
    def identify_customer(self, phone_number: str, industry: str, mappings: dict) -> IdentityResult:
        raise NotImplementedError("Subclasses must implement identify_customer")

    def identify_user(self, phone_number: str, business_phone_number: str = None) -> IdentityResult:
        from core.config.BusinessManager import BusinessManager
        config = BusinessManager.get_config(db_session, business_phone_number) if business_phone_number else BusinessManager._load_default_config()
        industry = config.get("industry", "default")
        mappings = config.get("user_type_mappings", {})
        
        # 0. Instagram check
        if phone_number.startswith("ig_"):
            return IdentityResult(
                UserType="INSTAGRAM_DM",
                Sequence=mappings.get("INSTAGRAM_DM", "InstagramHandoffSequence"),
                WorkflowIndex=0,
                IsRegistered=True,
                WorkflowData={"role": "customer", "industry": industry}
            )

        numbers = config.get("number", {})
        
        # 1. Dynamic Role Matching (e.g. admin, doctor, owner)
        for role, phone_list in numbers.items():
            if phone_number in phone_list:
                user_type_key = role.upper()
                return IdentityResult(
                    UserType=user_type_key,
                    Sequence=mappings.get(user_type_key, f"{role.capitalize()}Sequence"),
                    WorkflowIndex=0,
                    IsRegistered=True,
                    WorkflowData={"role": role.lower(), "industry": industry}
                )
                
        # Fallback to legacy global admin if none defined in config
        if phone_number == ADMIN_PHONE_NUMBER:
            return IdentityResult(
                UserType="ADMIN",
                Sequence=mappings.get("ADMIN", "AdminFlow"),
                WorkflowIndex=0,
                IsRegistered=True,
                WorkflowData={"role": "admin", "industry": industry}
            )

        # 2. Check Customer/Profile (General User)
        return self.identify_customer(phone_number, industry, mappings)


class IdentifyServiceFactory:
    @staticmethod
    def get_service(industry: str) -> BaseIdentifyService:
        if industry == "healthcare":
            from industries.healthcare.services.HealthcareIdentifyService import HealthcareIdentifyService
            return HealthcareIdentifyService()
        elif industry == "ecommerce":
            from industries.ecommerce.services.EcommerceIdentifyService import EcommerceIdentifyService
            return EcommerceIdentifyService()
        else:
            # Fallback to healthcare for default/legacy behavior
            from industries.healthcare.services.HealthcareIdentifyService import HealthcareIdentifyService
            return HealthcareIdentifyService()
