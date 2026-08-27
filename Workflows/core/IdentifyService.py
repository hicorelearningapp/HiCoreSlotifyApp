from dataclasses import dataclass, field
from config import ADMIN_PHONE_NUMBER

@dataclass
class IdentityResult:
    UserType: str | None = None
    AccountId: str | None = None
    ProfileId: str | None = None
    Sequence: str | None = None
    WorkflowIndex: int = 0
    WorkflowData: dict = field(default_factory=dict)
    IsRegistered: bool = False

class BaseIdentifyService:
    _identity_resolvers = []

    @classmethod
    def register_resolver(cls, resolver_func):
        cls._identity_resolvers.append(resolver_func)

    def identify_customer(self, phone_number: str, industry: str, mappings: dict) -> IdentityResult:
        raise NotImplementedError("Subclasses must implement identify_customer")

    def identify_user(self, phone_number: str, business_phone_number: str | None = None) -> IdentityResult:
        from core.config.BusinessManager import BusinessManager
        config = BusinessManager.get_config(business_phone_number) if business_phone_number else BusinessManager._load_default_config()
        industry = config.get("industry", "default")
        mappings = config.get("user_type_mappings", {})
        
        # 0. Check registered channel resolvers (e.g. Instagram)
        for resolver in self._identity_resolvers:
            result = resolver(phone_number, industry, mappings)
            if result:
                return result

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
        # Prevent completely invalid identifiers
        if not industry or not industry.isalnum():
            industry = "healthcare"
            
        try:
            module_name = f"industries.{industry}.services.{industry.capitalize()}IdentifyService"
            class_name = f"{industry.capitalize()}IdentifyService"
            
            # Dynamically import the industry's identify service module
            module = __import__(module_name, fromlist=[class_name])
            service_class = getattr(module, class_name)
            return service_class()
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Could not dynamically load IdentifyService for industry '{industry}'. Ensure the industry is configured correctly. Error: {e}")

