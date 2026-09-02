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
