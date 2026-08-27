from core.IdentifyService import BaseIdentifyService, IdentityResult
from backend_app.modules.ecommerce.services.customer_service import CustomerService

class EcommerceIdentifyService(BaseIdentifyService):
    def __init__(self):
        self.customer_svc = CustomerService()

    def identify_customer(self, phone_number: str, industry: str, mappings: dict) -> IdentityResult:
        customer = self.customer_svc.get_customer_by_phone(phone_number)
        fallback_role_key = "CUSTOMER"
        sequence = mappings.get(fallback_role_key, "DefaultCustomerSequence")
        
        if customer:
            has_name = bool(customer.ProfileName and customer.ProfileName != "Guest")
            wf_data = {
                "role": "customer",
                "name": customer.ProfileName if has_name else None,
                "industry": industry
            }
            return IdentityResult(
                UserType=fallback_role_key,
                AccountId=customer.CustomerId,
                ProfileId=customer.ProfileId,
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
