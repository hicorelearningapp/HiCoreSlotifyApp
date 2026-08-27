from core.IdentifyService import BaseIdentifyService, IdentityResult
from core.api_client import api_client

class EcommerceIdentifyService(BaseIdentifyService):
    def __init__(self):
        pass

    def identify_customer(self, phone_number: str, industry: str, mappings: dict) -> IdentityResult:
        customer = api_client.get_ecommerce_customer(phone_number)
        fallback_role_key = "CUSTOMER"
        sequence = mappings.get(fallback_role_key, "DefaultCustomerSequence")
        
        if customer:
            has_name = bool(customer.get("ProfileName") and customer.get("ProfileName") != "Guest")
            wf_data = {
                "role": "customer",
                "name": customer.get("ProfileName") if has_name else None,
                "industry": industry
            }
            return IdentityResult(
                UserType=fallback_role_key,
                AccountId=customer.get("CustomerId"),
                ProfileId=customer.get("ProfileId"),
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
