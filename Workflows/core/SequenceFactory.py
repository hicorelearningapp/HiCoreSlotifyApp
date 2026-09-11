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

class SequenceFactory:
    """
    Factory Pattern implementation for Sequence Managers.
    Maintains a dynamic registry of industry sequence managers and retrieves them.
    """
    _REGISTRY: dict[str, type[BaseSequenceManager]] = {}

    @classmethod
    def register(cls, industry: str, manager_cls: type[BaseSequenceManager]):
        """Registers a sequence manager dynamically."""
        cls._REGISTRY[industry] = manager_cls

    @classmethod
    def _ensure_registered(cls, industry: str):
        """Auto-registers standard industry sequence managers if not yet loaded."""
        if industry in cls._REGISTRY:
            return

        industry_modules = {
            "Ecommerce": ("industries.ecommerce.EcommerceSequenceManager", "EcommerceSequenceManager"),
            "HealthcareDoctorAppointment": ("industries.healthcare.HealthcareSequenceManager", "HealthcareSequenceManager"),            
        }

        if industry in industry_modules:
            mod_name, cls_name = industry_modules[industry]
            mod = __import__(mod_name, fromlist=[cls_name])
            manager_cls = getattr(mod, cls_name)
            cls.register(industry, manager_cls)

    @classmethod
    def GetSequenceManager(cls, industry: str) -> type[BaseSequenceManager]:
        """Factory method to resolve the sequence manager for the given industry."""
        cls._ensure_registered(industry)
        manager = cls._REGISTRY.get(industry)
        if not manager:
            raise ValueError(
                f"No sequence factory registered for industry '{industry}'. "
                f"Registered industries: {list(cls._REGISTRY.keys())}"
            )
        return manager

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
