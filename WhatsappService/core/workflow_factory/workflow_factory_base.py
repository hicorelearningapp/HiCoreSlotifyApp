from abc import ABC, abstractmethod
from typing import Dict, Type, Optional


class WorkflowClass(ABC):

    @abstractmethod
    def get_workflow(cls, name: str) -> Optional[Type]:
        pass

class WorkflowFactory:

    @classmethod
    def get_workflow_factory(cls, industry: str) -> Optional[Type[WorkflowClass]]:
        if not industry:
            raise ValueError("Industry name cannot be empty.")

        from core.workflow_factory.ecommerce_workflowfactory import EcommerceWorkflow
        from core.workflow_factory.healthcare_workflowfactory import HealthcareWorkflow
        WORKFLOW_FACTORY = {
            "Ecommerce": EcommerceWorkflow,
            "HealthcareDoctorAppointment": HealthcareWorkflow,
            "DoctorAppointment": HealthcareWorkflow,
            "Healthcare": HealthcareWorkflow,
        }

        factory = WORKFLOW_FACTORY.get(industry.strip())
        if not factory:
            raise ValueError(f"No workflow factory registered for industry '{industry}'.")
        return factory
