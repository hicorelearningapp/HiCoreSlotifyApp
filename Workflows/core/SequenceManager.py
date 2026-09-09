import json
import os
import copy

class SequenceManager:
    # @classmethod
    # def _deep_merge(cls, default_dict: dict, custom_dict: dict) -> dict:
    #     merged = copy.deepcopy(default_dict)
    #     if not custom_dict:
    #         return merged
    #     for k, v in custom_dict.items():
    #         if isinstance(v, dict) and k in merged and isinstance(merged[k], dict):
    #             merged[k] = cls._deep_merge(merged[k], v)
    #         else:
    #             merged[k] = v
    #     return merged

    def find_file(self, directory, target_file):
        for root, dirs, files in os.walk(directory):
            if target_file in files:
                return os.path.join(root, target_file)
        return None

    def read_file(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()

        return lines

    def get_config(self, business_phone: str | None = None) -> str:
        base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "industry_configs")
        fileName = f"{business_phone}{".txt"}"

        if business_phone:
            result = self.find_file(base_dir, fileName)
            lines = self.read_file(result)
            return lines
        return None


    @classmethod
    def get_industry(cls, business_phone: str | None = None) -> str:
        lines = cls.get_config(business_phone)
        return lines.get("industry", "").lower()
