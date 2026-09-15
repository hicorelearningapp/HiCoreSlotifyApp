from core.workflow_factory.workflow_factory_base import Workflow

from industries.ecommerce.workflows.common.GreetingMessageWorkflow import GreetingMessageWorkflow
from industries.ecommerce.workflows.customer.get_param_workflow import create_get_param_workflow
from industries.ecommerce.workflows.customer.select_quantity_workflow import SelectQuantityWorkflow
from industries.ecommerce.workflows.customer.collect_address_workflow import CollectAddressWorkflow
from industries.ecommerce.workflows.customer.order_workflow import OrderWorkFlow
from industries.ecommerce.workflows.customer.select_payment_workflow import SelectPaymentWorkflow
from industries.ecommerce.workflows.customer.confirm_order_workflow import ConfirmOrderWorkflow
from industries.ecommerce.workflows.common.ExitWorkflow import ExitWorkflow


class EcommerceWorkflow(Workflow):

    WORKFLOW = {
        "GreetingWorkflow": GreetingMessageWorkflow,
        "QuantityWorkflow": SelectQuantityWorkflow,
        "AddressWorkflow": CollectAddressWorkflow,
        "OrderWorkflow": OrderWorkFlow,
        "PaymentWorkflow": SelectPaymentWorkflow,
        "ConfirmWorkflow": ConfirmOrderWorkflow,
        "ExitWorkflow": ExitWorkflow,
    }

    @classmethod
    def get_param_workflow(cls, name: str):
        _, param, options = (name.split(";", 2) + ["", ""])[:3]
        return create_get_param_workflow(
            param or "Option",
            [x.strip() for x in options.split(",") if x.strip()],
        )

    @classmethod
    def get_workflow(cls, name: str):
        if not name:
            return None

        name = name.strip()

        if name.startswith("GetParam;"):
            return cls.get_param_workflow(name)

        return cls.WORKFLOW.get(name)


