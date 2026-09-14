from Workflows.core.workflow_factory.healthcare_workflowfactory import HealthcareWorkflow
from Workflows.core.workflow_factory.ecommerce_workflowfactory import EcommerceWorkflow
from abc import ABC, abstractmethod
from typing import Dict, Type, Optional, List, Tuple


class Workflow(ABC):

    @abstractmethod
    def get_workflow(cls, name: str) -> Optional[Type]:
        pass

class WorkflowFactory:

    WORKFLOW_FACTORY = {
        "Ecommerce": EcommerceWorkflow,
        "HealthcareDoctorAppointment": HealthcareWorkflow,
        "DoctorAppointment": HealthcareWorkflow,
    }

    @classmethod
    def get_workflow_factory(cls, industry: str) -> Type[Workflow]:
        if not industry:
            raise ValueError("Industry name cannot be empty.")

        return cls.WORKFLOW_FACTORY.get(industry.strip())