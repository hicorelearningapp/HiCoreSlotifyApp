import os

# class SequenceManager:
#     @classmethod
#     def find_file(cls, directory, target_file):
#         for root, dirs, files in os.walk(directory):
#             if target_file in files:
#                 return os.path.join(root, target_file)
#         return None
#
#     @classmethod
#     def get_config(cls, business_phone: str | None = None) -> str:
#         base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "industry_configs")
#         fileName = f"{business_phone}.txt"
#
#         if business_phone:
#             result = cls.find_file(base_dir, fileName)
#             return result
#
#         return None
#
#     @classmethod
#     def get_industry(cls, business_phone: str | None = None) -> str:
#         import json
#         config_path = cls.get_config(business_phone)
#         if config_path:
#             with open(config_path, "r", encoding="utf-8") as f:
#                 config = json.load(f)
#                 return config.get("industry", "healthcare").lower()
#         return "healthcare"
