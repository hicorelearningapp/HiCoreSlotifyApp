from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend_app.core.database import get_db
from core.services.business_config_service import BusinessConfigService
from core.schemas.business_config import BusinessConfigCreate, BusinessConfigResponse, BusinessConfigUpdate

class BusinessConfigRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/business_configs",
            tags=["business_configs"],
            responses={404: {"description": "Not found"}},
        )
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("", self.get_all_configs, methods=["GET"], response_model=List[BusinessConfigResponse])
        self.router.add_api_route("/{business_phone_number}", self.get_config, methods=["GET"], response_model=BusinessConfigResponse)
        self.router.add_api_route("", self.create_config, methods=["POST"], response_model=BusinessConfigResponse, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/{business_phone_number}", self.update_config, methods=["PUT"], response_model=BusinessConfigResponse)
        self.router.add_api_route("/{business_phone_number}", self.delete_config, methods=["DELETE"], status_code=status.HTTP_204_NO_CONTENT)

    def get_all_configs(self, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
        return BusinessConfigService.get_all_configs(db, skip, limit)

    def get_config(self, business_phone_number: str, db: Session = Depends(get_db)):
        config = BusinessConfigService.get_config_response(db, business_phone_number)
        if not config:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic config not found")
        return config

    def create_config(self, config_in: BusinessConfigCreate, db: Session = Depends(get_db)):
        new_config = BusinessConfigService.create_config(db, config_in)
        if not new_config:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Config already exists for this business number")
        return new_config

    def update_config(self, business_phone_number: str, config_in: BusinessConfigUpdate, db: Session = Depends(get_db)):
        updated_config = BusinessConfigService.update_config(db, business_phone_number, config_in)
        if not updated_config:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic config not found")
        return updated_config

    def delete_config(self, business_phone_number: str, db: Session = Depends(get_db)):
        success = BusinessConfigService.delete_config(db, business_phone_number)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic config not found")
        return None

router = BusinessConfigRouter().router
