from core.workflow_factory.workflow_factory_base import WorkflowFactory

from industries.ecommerce.workflows.customer.main_menu_workflow import (
    MainMenuWorkflow as EcommerceMainMenuWorkflow
)
from industries.ecommerce.workflows.customer.select_category_workflow import (
    SelectCategoryWorkflow
)
from industries.ecommerce.workflows.customer.select_product_workflow import (
    SelectProductWorkflow
)
from industries.ecommerce.workflows.customer.select_variant_workflow import (
    SelectVariantWorkflow
)
from industries.ecommerce.workflows.customer.select_quantity_workflow import (
    SelectQuantityWorkflow
)
from industries.ecommerce.workflows.customer.collect_name_workflow import (
    CollectNameWorkflow
)
from industries.ecommerce.workflows.customer.collect_phone_workflow import (
    CollectPhoneWorkflow
)
from industries.ecommerce.workflows.customer.collect_address_workflow import (
    CollectAddressWorkflow
)
from industries.ecommerce.workflows.customer.select_delivery_slot_workflow import (
    SelectDeliverySlotWorkflow
)
from industries.ecommerce.workflows.customer.select_date_workflow import (
    SelectDateWorkflow as EcommerceSelectDateWorkflow
)
from industries.ecommerce.workflows.customer.select_payment_workflow import (
    SelectPaymentWorkflow
)
from industries.ecommerce.workflows.customer.confirm_order_workflow import (
    ConfirmOrderWorkflow
)
from industries.ecommerce.workflows.customer.track_order_workflow import (
    TrackOrderWorkflow
)
from industries.ecommerce.workflows.customer.handoff_to_whatsapp_workflow import (
    HandoffToWhatsAppWorkflow
)

from industries.ecommerce.workflows.owner.owner_menu_workflow import (
    OwnerMenuWorkflow
)
from industries.ecommerce.workflows.owner.view_pending_orders_workflow import (
    ViewPendingOrdersWorkflow
)
from industries.ecommerce.workflows.owner.update_order_status_workflow import (
    UpdateOrderStatusWorkflow
)

from industries.ecommerce.workflows.common.GreetingMessageWorkflow import (
    GreetingMessageWorkflow
)
from industries.ecommerce.workflows.common.ExitWorkflow import (
    ExitWorkflow
)


class EcommerceWorkflowFactory(WorkflowFactory):

    WORKFLOW_REGISTRY = {}

    @classmethod
    def register_workflows(cls):

        cls.register(
            "OrderingMainMenuWorkflow",
            EcommerceMainMenuWorkflow
        )

        cls.register(
            "SelectCategoryWorkflow",
            SelectCategoryWorkflow
        )

        cls.register(
            "SelectProductWorkflow",
            SelectProductWorkflow
        )

        cls.register(
            "SelectVariantWorkflow",
            SelectVariantWorkflow
        )

        cls.register(
            "SelectQuantityWorkflow",
            SelectQuantityWorkflow
        )

        cls.register(
            "CollectNameWorkflow",
            CollectNameWorkflow
        )

        cls.register(
            "CollectPhoneWorkflow",
            CollectPhoneWorkflow
        )

        cls.register(
            "CollectAddressWorkflow",
            CollectAddressWorkflow
        )

        cls.register(
            "SelectDeliverySlotWorkflow",
            SelectDeliverySlotWorkflow
        )

        cls.register(
            "SelectDateWorkflow",
            EcommerceSelectDateWorkflow
        )

        cls.register(
            "SelectPaymentWorkflow",
            SelectPaymentWorkflow
        )

        cls.register(
            "ConfirmOrderWorkflow",
            ConfirmOrderWorkflow
        )

        cls.register(
            "TrackOrderWorkflow",
            TrackOrderWorkflow
        )

        cls.register(
            "HandoffToWhatsAppWorkflow",
            HandoffToWhatsAppWorkflow
        )

        cls.register(
            "OwnerMenuWorkflow",
            OwnerMenuWorkflow
        )

        cls.register(
            "ViewPendingOrdersWorkflow",
            ViewPendingOrdersWorkflow
        )

        cls.register(
            "UpdateOrderStatusWorkflow",
            UpdateOrderStatusWorkflow
        )

        cls.register(
            "GreetingMessageWorkflow",
            GreetingMessageWorkflow
        )

        cls.register(
            "ExitWorkflow",
            ExitWorkflow
        )