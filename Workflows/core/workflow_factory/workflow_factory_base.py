class WorkflowFactory:
    """
    A generic registry that maintains a mapping of workflow names to classes.
    Industries will register their specific workflows here.
    """
    WORKFLOW_REGISTRY = {}

    @classmethod
    def register(cls, name: str, workflow_cls):
        """Registers a workflow dynamically."""
        cls.WORKFLOW_REGISTRY[name] = workflow_cls

    @classmethod
    def get_workflow(cls, name: str):
        """Returns the workflow class by name."""
        if name in cls.WORKFLOW_REGISTRY:
            return cls.WORKFLOW_REGISTRY[name]
        print(f"[WARNING] Workflow '{name}' not found in registry.")
        return None

from core.workflow_factory.ecommerce_workflowfactory import EcommerceWorkflowFactory
from core.workflow_factory.healthcare_workflowfactory import HealthcareWorkflowFactory


class WorkflowFactoryProvider:

    FACTORIES = {
        "HealthcareDoctorAppointment": HealthcareWorkflowFactory,
        "Ecommerce": EcommerceWorkflowFactory,
    }

    @classmethod
    def get_factory(cls, industry: str):

        factory = cls.FACTORIES.get(industry)

        if factory is None:
            raise ValueError(
                f"Unsupported industry: {industry}"
            )

        return factory