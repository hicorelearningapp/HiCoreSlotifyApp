import json
from sqlalchemy.orm import Session
from typing import List, Optional
from core.models.business_config import BusinessConfig
from core.schemas.business_config import BusinessConfigCreate, BusinessConfigUpdate, BusinessConfigResponse
import os

class BusinessConfigService:
    @staticmethod
    def get_config(db_session: Session, business_number: str) -> Optional[dict]:
        """
        Retrieves the JSON configuration for a specific business number as a dict.
        Used internally by SequenceFactory.
        """
        if not business_number:
            return None
            
        config_record = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == business_number).first()
        
        if config_record and config_record.ConfigJson:
            try:
                return json.loads(config_record.ConfigJson)
            except json.JSONDecodeError:
                print(f"Error decoding JSON for clinic config: {business_number}")
                return None
        return None

    @staticmethod
    def get_all_configs(db_session: Session, skip: int = 0, limit: int = 100) -> List[BusinessConfigResponse]:
        configs = db_session.query(BusinessConfig).offset(skip).limit(limit).all()
        response = []
        for c in configs:
            try:
                config_dict = json.loads(c.ConfigJson)
            except json.JSONDecodeError:
                config_dict = {}
                
            response.append(BusinessConfigResponse(
                id=c.Id,
                business_phone_number=c.BusinessPhoneNumber,
                config_json=config_dict
            ))
        return response
        
    @staticmethod
    def get_config_response(db_session: Session, business_number: str) -> Optional[BusinessConfigResponse]:
        config = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == business_number).first()
        if not config:
            return None
            
        try:
            config_dict = json.loads(config.ConfigJson)
        except json.JSONDecodeError:
            config_dict = {}
            
        return BusinessConfigResponse(
            id=config.Id,
            business_phone_number=config.BusinessPhoneNumber,
            config_json=config_dict
        )

    @staticmethod
    def create_config(db_session: Session, config_in: BusinessConfigCreate) -> Optional[BusinessConfigResponse]:
        existing = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == config_in.business_phone_number).first()
        if existing:
            return None
            
        new_config = BusinessConfig(
            BusinessPhoneNumber=config_in.business_phone_number,
            ConfigJson=json.dumps(config_in.config_json)
        )
        db_session.add(new_config)
        db_session.commit()
        db_session.refresh(new_config)
        
        # Sync to file
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "industry_configs", f"{config_in.business_phone_number}.txt")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(config_in.config_json, f, indent=2)
        except Exception as e:
            print(f"Failed to write config to file: {e}")
        
        return BusinessConfigResponse(
            id=new_config.Id,
            business_phone_number=new_config.BusinessPhoneNumber,
            config_json=config_in.config_json
        )

    @staticmethod
    def update_config(db_session: Session, business_number: str, config_in: BusinessConfigUpdate) -> Optional[BusinessConfigResponse]:
        config = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == business_number).first()
        if not config:
            return None
            
        config.ConfigJson = json.dumps(config_in.config_json)
        db_session.commit()
        db_session.refresh(config)
        
        # Sync to file
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "industry_configs", f"{business_number}.txt")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(config_in.config_json, f, indent=2)
        except Exception as e:
            print(f"Failed to write config to file: {e}")
        
        return BusinessConfigResponse(
            id=config.Id,
            business_phone_number=config.BusinessPhoneNumber,
            config_json=config_in.config_json
        )

    @staticmethod
    def delete_config(db_session: Session, business_number: str) -> bool:
        config = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == business_number).first()
        if not config:
            return False
            
        db_session.delete(config)
        db_session.commit()
        
        # Delete file if exists
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "industry_configs", f"{business_number}.txt")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Failed to delete config file: {e}")
                
        return True

    @staticmethod
    def set_config(db_session: Session, business_number: str, config_dict: dict):
        """
        Saves or updates a clinic's configuration directly from a dict.
        """
        config_json = json.dumps(config_dict)
        
        config_record = db_session.query(BusinessConfig).filter(BusinessConfig.BusinessPhoneNumber == business_number).first()
        if config_record:
            config_record.ConfigJson = config_json
        else:
            new_config = BusinessConfig(
                BusinessPhoneNumber=business_number,
                ConfigJson=config_json
            )
            db_session.add(new_config)
            
        db_session.commit()
