import json
import os
import copy

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
            # Step 1: Try loading local file first (during transition)
            base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "industry_configs")
            for root, _, files in os.walk(base_dir):
                for ext in (".txt", ".json"):
                    if f"{business_phone}{ext}" in files:
                        try:
                            with open(os.path.join(root, f"{business_phone}{ext}"), "r", encoding="utf-8") as f:
                                default_config = cls._deep_merge(default_config, json.load(f))
                        except Exception:
                            pass
                        break

            # Step 2: Fetch and merge from DB
            from core.api_client import api_client
            business = api_client.get_business_by_phone(business_phone)
            
            if business:
                custom_config = business.get("BusinessData") or {}
                if business.get("IndustryType"):
                    custom_config["industry"] = business.get("IndustryType")
                return cls._deep_merge(default_config, custom_config)
                
        return default_config or {}

    @classmethod
    def get_industry(cls, business_phone: str | None = None) -> str:
        config = cls.get_config(business_phone)
        return config.get("industry", "healthcare").lower()
