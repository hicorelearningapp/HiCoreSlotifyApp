from typing import Dict, Type, Optional
from core.workflow_factory.workflow_class import WorkflowClass
from core.workflow_factory.ecommerce_workflowfactory import EcommerceWorkflow
from core.workflow_factory.healthcare_workflowfactory import HealthcareWorkflow

class WorkflowFactory:

    WORKFLOW_FACTORY = {
            "Ecommerce": EcommerceWorkflow,
            "HealthcareDoctorAppointment": HealthcareWorkflow
        }

    @classmethod
    def get_workflow_factory(cls, industry: str) -> Optional[Type[WorkflowClass]]:
        if not industry:
            raise ValueError("Industry name cannot be empty.")

        factory = cls.WORKFLOW_FACTORY.get(industry.strip())
        if not factory:
            raise ValueError(f"No workflow factory registered for industry '{industry}'.")
        return factory
