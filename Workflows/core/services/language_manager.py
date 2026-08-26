import json
import os
from backend_app.core.database import SessionLocal
from backend_app.modules.doctor_appointment.models.customer import Customer
from config import LANGUAGE_METADATA, LANGUAGE_SELECTION_ENABLED


class LanguageManagerMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(LanguageManagerMeta, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class LanguageManager(metaclass=LanguageManagerMeta):
    def __init__(self):
        self.CurrentLanguage = "en"
        self.SupportedLanguages = []
        self.LanguageOptions = []
        self.Resources = {}
        self.initialize()
        
    def initialize(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        locales_dir = os.path.join(base_dir, "locales")
        
        # Resources now looks like: {"healthcare": {"en": {...}}, "ecommerce": {"en": {...}}}
        if os.path.exists(locales_dir):
            for industry_dir in os.listdir(locales_dir):
                ind_path = os.path.join(locales_dir, industry_dir)
                if os.path.isdir(ind_path):
                    self.Resources[industry_dir] = {}
                    for file_name in os.listdir(ind_path):
                        if file_name.endswith(".json"):
                            lang = file_name[:-5]
                            if lang not in self.SupportedLanguages:
                                self.SupportedLanguages.append(lang)
                                meta = LANGUAGE_METADATA.get(lang, {"title": lang.upper(), "description": lang})
                                self.LanguageOptions.append({
                                    "id": f"LANG_{lang}",
                                    "title": meta["title"],
                                    "description": meta["description"]
                                })
                            
                            file_path = os.path.join(ind_path, file_name)
                            with open(file_path, "r", encoding="utf-8") as f:
                                try:
                                    self.Resources[industry_dir][lang] = json.load(f)
                                except json.JSONDecodeError:
                                    self.Resources[industry_dir][lang] = {}

    def load_for_session(self, session, customer_phone: str):
        if not LANGUAGE_SELECTION_ENABLED:
            self.set_language("en")
            return
            
        if session.state.WorkflowData.get("Language"):
            self.set_language(session.state.WorkflowData.get("Language"))
        else:
            db = SessionLocal()
            try:
                customer = db.query(Customer).filter(Customer.PhoneNumber == customer_phone).first()
                if customer and customer.Language:
                    session.state.WorkflowData["Language"] = customer.Language
                    self.set_language(customer.Language)
                else:
                    self.set_language("en")
            finally:
                db.close()

    def set_language(self, language: str):
        if language in self.SupportedLanguages:
            self.CurrentLanguage = language

    def get_language(self) -> str:
        return self.CurrentLanguage

    def text(self, key: str, business_phone: str = None, **kwargs) -> str:
        industry = "healthcare"
        custom_locales = {}
        
        if business_phone:
            db = SessionLocal()
            try:
                from core.config.BusinessManager import BusinessManager
                config = BusinessManager.get_config(db, business_phone)
                industry = config.get("industry", "healthcare")
                custom_locales = config.get("locales", {})
            finally:
                db.close()

        # 1. Check custom overrides in config
        lang_dict_custom = custom_locales.get(self.CurrentLanguage, {})
        val = lang_dict_custom.get(key)
        
        if not val and self.CurrentLanguage != "en":
            val = custom_locales.get("en", {}).get(key)
            
        # 2. Check industry-specific default locales
        if not val:
            ind_resources = self.Resources.get(industry, {})
            val = ind_resources.get(self.CurrentLanguage, {}).get(key)
            if not val and self.CurrentLanguage != "en":
                val = ind_resources.get("en", {}).get(key)
                
        # 3. Fallback to just returning the key
        if not val:
            return key
            
        try:
            return val.format(**kwargs)
        except Exception:
            return val

    def should_prompt_for_language(self, session) -> bool:
        if not LANGUAGE_SELECTION_ENABLED:
            self.set_language("en")
            return False

        force_selection = session.state.WorkflowData.pop("ForceLanguageSelection", False)

        if not force_selection and session.state.WorkflowData.get("Language"):
            return False
            
        self.set_language("en")
        return True

    def save_language_selection(self, session, lang_id: str) -> bool:
        if not lang_id.startswith("LANG_"):
            return False
            
        lang_code = lang_id.replace("LANG_", "")
        if lang_code not in self.SupportedLanguages:
            return False
            
        db = SessionLocal()
        try:
            customer = db.query(Customer).filter(Customer.PhoneNumber == session.PhoneNumber).first()
            if customer:
                customer.Language = lang_code
                db.commit()
        finally:
            db.close()
            
        session.state.WorkflowData["Language"] = lang_code
        self.set_language(lang_code)
        return True

    def get_all_greeting_image_filenames(self, business_phone: str = None) -> dict:
        """Returns a mapping of language codes to their respective greeting image filenames."""
        images = {}
        industry = "healthcare"
        if business_phone:
            db = SessionLocal()
            try:
                from core.config.BusinessManager import BusinessManager
                config = BusinessManager.get_config(db, business_phone)
                industry = config.get("industry", "healthcare")
            finally:
                db.close()
                
        ind_resources = self.Resources.get(industry, {})
        for lang in self.SupportedLanguages:
            lang_dict = ind_resources.get(lang, {})
            img = lang_dict.get("greeting_image_filename")
            if not img:
                img = ind_resources.get("en", {}).get("greeting_image_filename")
            if img:
                images[lang] = img
        return images

