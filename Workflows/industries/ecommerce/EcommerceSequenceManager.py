from typing import Dict, Any, List
from core.SequenceFactory import Sequence, BaseSequenceManager, SequenceFactory
from core.workflow_factory.workflow_factory_base import WorkflowFactoryProvider
from core.api_client import BackendAPIClient
from core.models import ConversationSession
from industries.ecommerce.workflows.customer.get_param_workflow import create_get_param_workflow
from industries.ecommerce.workflows.common.GreetingMessageWorkflow import GreetingMessageWorkflow


class EcommerceSequenceManager(BaseSequenceManager):
    """
    Sequence Manager for Ecommerce WhatsApp order booking.
    Fetches the product config by product ID:
    - If valid product: constructs the dynamic sequence and continues the booking flow.
    - If invalid product ID: returns GreetingMessageWorkflow which sends a warning message.
    """

    @classmethod
    def GetSequence(cls, sessionData: ConversationSession) -> Sequence:
        product_key = str(sessionData.state.ProductKey or sessionData.WorkflowData.get("product_id") or "").strip()
        config: Dict[str, Any] = sessionData.WorkflowData.get("product_config") or {}

        # 1. Fetch product config from backend if not already cached in session
        if not config and product_key:
            client = BackendAPIClient()
            try:
                # Primary: /ecommerce/products/{product_id}/product-workflow
                config = client.get_product_config_by_phone(product_key) or {}
            except Exception as e:
                print(f"[EcommerceSequenceManager] Error fetching product workflow config: {e}")

            # Fallback: /businesses/config/{product_key}
            if not config:
                try:
                    config = client.get_industry_config_by_phone(product_key) or {}
                except Exception as e:
                    print(f"[EcommerceSequenceManager] Fallback industry config fetch error: {e}")

            # Fallback to business phone number config if needed
            if not config and sessionData.state.BusinessPhoneNumber:
                try:
                    config = client.get_industry_config_by_phone(str(sessionData.state.BusinessPhoneNumber)) or {}
                except Exception:
                    pass

        industry = config.get("industry") or "Ecommerce"
        product_info = config.get("product_info") or {}

        # 2. Populate session WorkflowData
        if product_info:
            sessionData.WorkflowData.setdefault("product_info", product_info)
            if product_info.get("name"):
                sessionData.WorkflowData.setdefault("product_name", product_info.get("name"))
            if product_info.get("price") is not None:
                sessionData.WorkflowData.setdefault("product_price", product_info.get("price"))

        if product_key:
            sessionData.WorkflowData.setdefault("product_id", product_key)

        if config:
            sessionData.WorkflowData["product_config"] = config
            sessionData.WorkflowData["industry"] = industry

        # Sync with state.WorkflowData
        if hasattr(sessionData, "state") and hasattr(sessionData.state, "WorkflowData"):
            for k, v in sessionData.WorkflowData.items():
                sessionData.state.WorkflowData.setdefault(k, v)

        # 3. If Product Info was NOT found (invalid/wrong Product ID)
        # Return GreetingMessageWorkflow which sends the warning and finishes session
        if not product_info:
            return Sequence(sessionData.state.SequenceName or "MainWorkSequence", [GreetingMessageWorkflow])

        # 4. Retrieve sequence list from config
        sequences_dict = config.get("sequences", {}) if isinstance(config.get("sequences"), dict) else {}
        seq_name = sessionData.state.SequenceName or "MainWorkSequence"
        workflow_names = sequences_dict.get(seq_name) or sequences_dict.get("MainWorkSequence")

        # Default standard sequence if not provided in config
        if not workflow_names:
            workflow_names = [
                "GreetingWorkFlow",
                "QuantityWorkFlow",
                "AddressWorkFlow",
                "OrderWorkFlow",
                "PaymentWorkFlow",
                "ConfirmWorkFLow",
            ]

        # 5. Resolve workflow classes
        workflows = []
        factory = WorkflowFactoryProvider.get_factory("Ecommerce")

        for w_name in workflow_names:
            if not w_name:
                continue

            # Dynamic Parameter step: "GetParam;{ParamName};{Options}"
            if w_name.startswith("GetParam;") or w_name.startswith("GetParam:"):
                parts = w_name.split(";", 2) if ";" in w_name else w_name.split(":", 2)
                param_name = parts[1].strip() if len(parts) > 1 else "Option"
                options = [x.strip() for x in parts[2].split(",") if x.strip()] if len(parts) > 2 else []
                wf_class = create_get_param_workflow(param_name, options)
                workflows.append(wf_class)
            else:
                wf_class = factory.get_workflow(w_name)
                if wf_class:
                    workflows.append(wf_class)
                else:
                    print(f"[EcommerceSequenceManager WARNING] Could not resolve workflow class for '{w_name}'")

        if not workflows:
            workflows = [GreetingMessageWorkflow]

        return Sequence(seq_name, workflows)
