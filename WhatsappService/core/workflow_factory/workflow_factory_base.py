
from abc import ABC, abstractmethod
from typing import Dict, Type, Optional, List, Tuple


class Workflow(ABC):

    @abstractmethod
    def get_workflow(cls, name: str) -> Optional[Type]:
        pass

class WorkflowFactory:

    WORKFLOW_FACTORY = {}

    @classmethod
    def get_workflow_factory(cls, industry: str) -> Type[Workflow]:
        if not industry:
            raise ValueError("Industry name cannot be empty.")
            
        if not cls.WORKFLOW_FACTORY:
            from core.workflow_factory.healthcare_workflowfactory import HealthcareWorkflow
            from core.workflow_factory.ecommerce_workflowfactory import EcommerceWorkflow
            cls.WORKFLOW_FACTORY = {
                "Ecommerce": EcommerceWorkflow,
                "DoctorAppointment": HealthcareWorkflow,
            }

        return cls.WORKFLOW_FACTORY.get(industry.strip())

