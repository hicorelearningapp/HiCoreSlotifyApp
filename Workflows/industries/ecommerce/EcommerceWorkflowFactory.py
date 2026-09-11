# from core.workflow_factory.workflow_factory import WorkflowFactory

# from industries.ecommerce.workflows.customer.main_menu_workflow import MainMenuWorkflow as EcommerceMainMenuWorkflow
# from industries.ecommerce.workflows.customer.select_category_workflow import SelectCategoryWorkflow
# from industries.ecommerce.workflows.customer.select_product_workflow import SelectProductWorkflow
# from industries.ecommerce.workflows.customer.select_variant_workflow import SelectVariantWorkflow
# from industries.ecommerce.workflows.customer.select_quantity_workflow import SelectQuantityWorkflow
# from industries.ecommerce.workflows.customer.collect_name_workflow import CollectNameWorkflow
# from industries.ecommerce.workflows.customer.collect_phone_workflow import CollectPhoneWorkflow
# from industries.ecommerce.workflows.customer.collect_address_workflow import CollectAddressWorkflow
# from industries.ecommerce.workflows.customer.select_delivery_slot_workflow import SelectDeliverySlotWorkflow
# from industries.ecommerce.workflows.customer.select_date_workflow import SelectDateWorkflow as EcommerceSelectDateWorkflow
# from industries.ecommerce.workflows.customer.select_payment_workflow import SelectPaymentWorkflow
# from industries.ecommerce.workflows.customer.confirm_order_workflow import ConfirmOrderWorkflow
# from industries.ecommerce.workflows.customer.track_order_workflow import TrackOrderWorkflow
# from industries.ecommerce.workflows.customer.handoff_to_whatsapp_workflow import HandoffToWhatsAppWorkflow
# from industries.ecommerce.workflows.owner.owner_menu_workflow import OwnerMenuWorkflow
# from industries.ecommerce.workflows.owner.view_pending_orders_workflow import ViewPendingOrdersWorkflow
# from industries.ecommerce.workflows.owner.update_order_status_workflow import UpdateOrderStatusWorkflow

# industry = "Ecommerce"

# # Self-register at import time
# WorkflowFactory.register(industry+"OrderingMainMenuWorkflow", EcommerceMainMenuWorkflow)
# WorkflowFactory.register(industry+"SelectCategoryWorkflow", SelectCategoryWorkflow)
# WorkflowFactory.register(industry+"SelectProductWorkflow", SelectProductWorkflow)
# WorkflowFactory.register(industry+"SelectVariantWorkflow", SelectVariantWorkflow)
# WorkflowFactory.register(industry+"SelectQuantityWorkflow", SelectQuantityWorkflow)
# WorkflowFactory.register(industry+"CollectNameWorkflow", CollectNameWorkflow)
# WorkflowFactory.register(industry+"CollectPhoneWorkflow", CollectPhoneWorkflow)
# WorkflowFactory.register(industry+"CollectAddressWorkflow", CollectAddressWorkflow)
# WorkflowFactory.register(industry+"SelectDeliverySlotWorkflow", SelectDeliverySlotWorkflow)
# WorkflowFactory.register(industry+"EcommerceSelectDateWorkflow", EcommerceSelectDateWorkflow)
# WorkflowFactory.register(industry+"SelectPaymentWorkflow", SelectPaymentWorkflow)
# WorkflowFactory.register(industry+"ConfirmOrderWorkflow", ConfirmOrderWorkflow)
# WorkflowFactory.register(industry+"TrackOrderWorkflow", TrackOrderWorkflow)
# WorkflowFactory.register(industry+"HandoffToWhatsAppWorkflow", HandoffToWhatsAppWorkflow)
# WorkflowFactory.register(industry+"OwnerMenuWorkflow", OwnerMenuWorkflow)
# WorkflowFactory.register(industry+"ViewPendingOrdersWorkflow", ViewPendingOrdersWorkflow)
# WorkflowFactory.register(industry+"UpdateOrderStatusWorkflow", UpdateOrderStatusWorkflow)

# from industries.ecommerce.workflows.common.GreetingMessageWorkflow import GreetingMessageWorkflow
# from industries.ecommerce.workflows.common.ExitWorkflow import ExitWorkflow

# WorkflowFactory.register(industry+"GreetingMessageWorkflow", GreetingMessageWorkflow)
# WorkflowFactory.register(industry+"ExitWorkflow", ExitWorkflow)
