import json
import os
import copy
from typing import List, Type
from core.WorkflowFactory import WorkflowFactory

class SequenceManager:
    DEFAULT_CONFIG = None

    @classmethod
    def _load_default_config(cls):
        if cls.DEFAULT_CONFIG is None:
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "industry_configs",
                "default.json",
            )
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    cls.DEFAULT_CONFIG = json.load(f)
            except Exception as e:
                print(f"Failed to load default config: {e}")
                cls.DEFAULT_CONFIG = {}
        return cls.DEFAULT_CONFIG

    @classmethod
    def _deep_merge(cls, default_dict: dict, custom_dict: dict) -> dict:
        merged = copy.deepcopy(default_dict)
        if not custom_dict:
            return merged
        for k, v in custom_dict.items():
            if isinstance(v, dict) and k in merged and isinstance(merged[k], dict):
                merged[k] = cls._deep_merge(merged[k], v)
            else:
                merged[k] = v
        return merged

    @classmethod
    def get_config(cls, business_phone: str | None = None) -> dict:
        default_config = cls._load_default_config()
        if business_phone:
            base_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "industry_configs"
            )
            
            # Recursively search for the business_phone file
            found_file = None
            for root, _, files in os.walk(base_dir):
                for ext in (".txt", ".json"):
                    filename = f"{business_phone}{ext}"
                    if filename in files:
                        found_file = os.path.join(root, filename)
                        break
                if found_file:
                    break
                    
            if found_file:
                try:
                    with open(found_file, "r", encoding="utf-8") as f:
                        local_config = json.load(f)
                    return cls._deep_merge(default_config, local_config)
                except Exception as e:
                    print(f"Failed to load config {found_file}: {e}")
                        
        return default_config or {}

    @classmethod
    def get_industry(cls, business_phone: str | None = None) -> str:
        config = cls.get_config(business_phone)
        return config.get("industry", "healthcare").lower()

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
    Abstract factory that delegates sequence creation to industry-specific factories.
    """
    _factories = {}

    @classmethod
    def register_factory(cls, industry: str, factory_cls: Type['BaseSequenceManager']):
        cls._factories[industry.lower()] = factory_cls

    @classmethod
    def _get_factory(cls, business_phone: str | None = None) -> Type['BaseSequenceManager']:
        industry = SequenceManager.get_industry(business_phone)
        factory = cls._factories.get(industry)
        if not factory:
            raise ValueError(f"No sequence factory registered for industry '{industry}'.")
        return factory

    @classmethod
    def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
        return cls._get_factory(business_phone).get_setting(business_phone, setting_key, default_value)

    @classmethod
    def GetSequenceName(cls, user_type: str, business_phone: str | None = None) -> str:
        return cls._get_factory(business_phone).GetSequenceName(user_type, business_phone)

    @classmethod
    def Get(cls, name: str, business_phone: str | None = None) -> Sequence:
        return cls._get_factory(business_phone).Get(name, business_phone)
