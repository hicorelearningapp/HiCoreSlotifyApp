from core.workflow_factory.workflow_factory_base import WorkflowFactory

from industries.ecommerce.workflows.common.GreetingMessageWorkflow import GreetingMessageWorkflow
from industries.ecommerce.workflows.customer.get_param_workflow import create_get_param_workflow
from industries.ecommerce.workflows.customer.select_quantity_workflow import SelectQuantityWorkflow
from industries.ecommerce.workflows.customer.collect_address_workflow import CollectAddressWorkflow
from industries.ecommerce.workflows.customer.order_workflow import OrderWorkFlow
from industries.ecommerce.workflows.customer.select_payment_workflow import SelectPaymentWorkflow
from industries.ecommerce.workflows.customer.confirm_order_workflow import ConfirmOrderWorkflow
from industries.ecommerce.workflows.common.ExitWorkflow import ExitWorkflow


class EcommerceWorkflowFactory(WorkflowFactory):

    WORKFLOW_REGISTRY = {}
    _INITIALIZED = False

    @classmethod
    def register_workflows(cls):
        if cls._INITIALIZED:
            return

        cls.register("GreetingWorkFlow", GreetingMessageWorkflow)
        cls.register("QuantityWorkFlow", SelectQuantityWorkflow)
        cls.register("AddressWorkFlow", CollectAddressWorkflow)
        cls.register("OrderWorkFlow", OrderWorkFlow)
        cls.register("PaymentWorkFlow", SelectPaymentWorkflow)
        cls.register("ConfirmWorkFLow", ConfirmOrderWorkflow)
        cls.register("ExitWorkflow", ExitWorkflow)

        cls._INITIALIZED = True

    @classmethod
    def get_workflow(cls, name: str):
        cls.register_workflows()

        if not name:
            return None

        # Clean prefix if industry namespace is prepended (e.g. 'Ecommerce.GreetingWorkFlow')
        clean_name = name
        if clean_name.startswith("Ecommerce."):
            clean_name = clean_name[len("Ecommerce."):]

        # Handle dynamic GetParam workflow: GetParam;{ParamName};{Options}
        if clean_name.startswith("GetParam;") or clean_name.startswith("GetParam:"):
            parts = clean_name.split(";", 2) if ";" in clean_name else clean_name.split(":", 2)
            param_name = parts[1].strip() if len(parts) > 1 else "Option"
            options = [x.strip() for x in parts[2].split(",") if x.strip()] if len(parts) > 2 else []
            return create_get_param_workflow(param_name, options)

        # Direct registry lookup
        if clean_name in cls.WORKFLOW_REGISTRY:
            return cls.WORKFLOW_REGISTRY[clean_name]

        # Case-insensitive / normalized lookup
        for reg_key, wf_class in cls.WORKFLOW_REGISTRY.items():
            if reg_key.lower().replace("_", "") == clean_name.lower().replace("_", ""):
                return wf_class

        print(f"[WARNING] Workflow '{name}' (cleaned: '{clean_name}') not found in Ecommerce registry.")
        return None


# Auto-register upon import
from core.workflow_factory.workflow_factory_base import WorkflowFactoryProvider
EcommerceWorkflowFactory.register_workflows()
WorkflowFactoryProvider.register("Ecommerce", EcommerceWorkflowFactory)