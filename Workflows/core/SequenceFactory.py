from typing import List, Type
from core.SequenceManager import SequenceManager

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
    @classmethod
    def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
        raise NotImplementedError()
        
    @classmethod
    def GetSequenceName(cls, user_type: str, business_phone: str | None = None) -> str:
        raise NotImplementedError()
        
    @classmethod
    def Get(cls, name: str, business_phone: str | None = None) -> Sequence:
        raise NotImplementedError()


class SequenceFactory:
    """
    Factory that delegates sequence creation to industry-specific factories.
    """
    @classmethod
    def _get_factory(cls, business_phone: str | None = None) -> Type['BaseSequenceManager']:
        industry = SequenceManager.get_industry(business_phone)
        
        if industry == "ecommerce":
            from industries.ecommerce.EcommerceSequenceManager import EcommerceSequenceManager
            return EcommerceSequenceManager
        elif industry == "healthcare":
            from industries.healthcare.HealthcareSequenceManager import HealthcareSequenceManager
            return HealthcareSequenceManager
        else:
            raise ValueError(f"No sequence factory registered for industry '{industry}'.")

    @classmethod
    def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
        return cls._get_factory(business_phone).get_setting(business_phone, setting_key, default_value)

    @classmethod
    def GetSequenceName(cls, user_type: str, business_phone: str | None = None) -> str:
        return cls._get_factory(business_phone).GetSequenceName(user_type, business_phone)

    @classmethod
    def Get(cls, name: str, business_phone: str | None = None) -> Sequence:
        return cls._get_factory(business_phone).Get(name, business_phone)
