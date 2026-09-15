from abc import ABC, abstractmethod
from typing import Dict, Type, Optional


class WorkflowClass(ABC):

    @abstractmethod
    def get_workflow(cls, name: str) -> Optional[Type]:
        pass