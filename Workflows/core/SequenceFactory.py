from typing import List, Type

from core.api_client import BackendAPIClient
# from core.SequenceManager import SequenceManager
from core.models import ConversationSession


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


class BaseSequenceManager:
    """Interface for industry-specific sequence managers."""
    # @classmethod
    # def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
    #     raise NotImplementedError()
    #
    @classmethod
    def GetSequence(cls, sessionData : ConversationSession) -> Sequence:
        raise NotImplementedError()

from industries.ecommerce.EcommerceSequenceManager import EcommerceSequenceManager
from industries.healthcare.HealthcareSequenceManager import HealthcareSequenceManager



class SequenceFactory:
    factories = {
        "Ecommerce": EcommerceSequenceManager,
        "DoctorAppointment": HealthcareSequenceManager,
    }
    @classmethod
    def GetSequenceManager(cls, industry: str):

        factory = cls.factories.get(industry)
        if not factory:
            raise ValueError(f"No sequence factory registered for industry '{industry}'.")
        return factory

    """
    Factory that delegates sequence creation to industry-specific factories.
    """
    @classmethod
    def getIndustry(cls, business_phone: str | None = None) -> str:
        if not business_phone:
            raise ValueError("Business phone number is required to retrieve industry.")

        try:
            industry = BackendAPIClient().get_industry_by_phone(str(business_phone))
        except Exception as e:
            raise RuntimeError(f"Failed to fetch industry for business phone '{business_phone}': {e}") from e

        if not industry:
            raise ValueError(f"No industry found for business phone '{business_phone}'.")

        return industry
