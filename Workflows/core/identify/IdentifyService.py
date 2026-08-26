from dataclasses import dataclass, field

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
    def identify_user(self, phone_number: str, business_phone_number: str = None) -> IdentityResult:
        raise NotImplementedError("identify_user must be implemented by industry-specific services")

class IdentifyServiceFactory:
    _services = {}

    @classmethod
    def register_service(cls, industry: str, service: BaseIdentifyService):
        cls._services[industry] = service

    @classmethod
    def get_service(cls, industry: str) -> BaseIdentifyService:
        # Default to a generic implementation or raise an error if not found
        service = cls._services.get(industry)
        if not service:
            raise ValueError(f"No IdentifyService registered for industry: {industry}")
        return service
