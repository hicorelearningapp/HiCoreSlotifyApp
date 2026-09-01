from core.services.IdentifyService import BaseIdentifyService, IdentityResult
from core.api_client import api_client

class HealthcareIdentifyService(BaseIdentifyService):
    def __init__(self):
        pass

    def identify_customer(self, phone_number: str, industry: str, mappings: dict) -> IdentityResult:
        customer = api_client.get_customer_by_phone(phone_number)
        fallback_role_key = "PATIENT"
        sequence = mappings.get(fallback_role_key, "DefaultCustomerSequence")
        
        if customer:
            has_name = bool(customer.get("PatientName") and customer.get("PatientName") != "Guest")
            wf_data = {
                "role": "customer",
                "name": customer.get("PatientName") if has_name else None,
                "industry": industry
            }
            return IdentityResult(
                UserType=fallback_role_key,
                AccountId=customer.get("CustomerId"),
                ProfileId=customer.get("PatientId"),
                Sequence=sequence,
                WorkflowIndex=0,
                WorkflowData=wf_data,
                IsRegistered=True
            )

        return IdentityResult(
            UserType=fallback_role_key,
            Sequence=sequence,
            WorkflowIndex=0,
            WorkflowData={"role": "customer", "industry": industry},
            IsRegistered=False
        )
