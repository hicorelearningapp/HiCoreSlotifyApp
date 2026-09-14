from abc import ABC, abstractmethod
from typing import List, Type
from core.models import ConversationSession
from industries.ecommerce.EcommerceSequenceManager import EcommerceSequenceManager
from industries.healthcare.HealthcareSequenceManager import HealthcareSequenceManager


class Sequence:
    def __init__(self, name: str, workflows: List[Type]):
        if not workflows:
            raise ValueError(f"Sequence '{name}' must contain at least one workflow.")
        self.Name = name
        self.Workflows = workflows

    @property
    def Count(self): return len(self.Workflows)
        
    def Current(self, index: int):
        if index < 0 or index >= self.Count: return None
        return self.Workflows[index]
        
    def Next(self, index: int):
        next_index = index + 1
        if next_index >= self.Count: return None
        return self.Workflows[next_index]
                        
    def IndexOfName(self, workflow_name: str) -> int:
        for i, wf in enumerate(self.Workflows):
            if wf.__name__ == workflow_name: return i
        return -1
        
    def GetAll(self): return self.Workflows

    def __str__(self): return self.Name


class BaseSequenceManager(ABC):
   
    @abstractmethod
    def GetSequence(cls, sessionData : ConversationSession) -> Sequence:
        raise NotImplementedError()

class SequenceFactory:

    SEQUENCE_FACTORY = {
            "Ecommerce": EcommerceSequenceManager,
            "DoctorAppointment": HealthcareSequenceManager,
            "HealthcareDoctorAppointment": HealthcareSequenceManager,
    }

    @classmethod
    def GetSequenceManager(cls, industry: str) -> Type[BaseSequenceManager]:
                
        factory = cls.SEQUENCE_FACTORY.get(industry)
        if not factory:
            raise ValueError(f"No sequence factory registered for industry '{industry}'.")
        return factory
