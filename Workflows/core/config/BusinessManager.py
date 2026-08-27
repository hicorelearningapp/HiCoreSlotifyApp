import json
import os
import copy
from core.api_client import api_client

class BusinessManager:
    DEFAULT_CONFIG = None

    @classmethod
    def _load_default_config(cls):
        if cls.DEFAULT_CONFIG is None:
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
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
    def get_config(cls, business_phone: str = None=None) -> dict:
        default_config = cls._load_default_config()
        if business_phone:
            custom_config = api_client.get_business_config(business_phone)
            if custom_config:
                return cls._deep_merge(default_config, custom_config)
        return default_config

    @classmethod
    def get_industry(cls, business_phone: str = None=None) -> str:
        """
        Determines the industry for the given business phone.
        Defaults to 'healthcare' if not found.
        """
        config = cls.get_config(business_phone)
        return config.get("industry", "healthcare").lower()
