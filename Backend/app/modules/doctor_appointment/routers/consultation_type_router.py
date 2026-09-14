from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.doctor_appointment.services.consultation_type_service import ConsultationTypeService
from app.modules.doctor_appointment.schemas.consultation_type import ConsultationTypeCreate, ConsultationTypeUpdate, ConsultationTypeOut


class ConsultationTypeRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/consultation-types",
            tags=["Consultation Types"],
            responses={404: {"description": "Not found"}},
        )
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.get_all_consultation_types,
            methods=["GET"],
            response_model=List[ConsultationTypeOut],
        )
        self.router.add_api_route(
            "/{consultation_type_id}",
            self.get_consultation_type,
            methods=["GET"],
            response_model=ConsultationTypeOut,
        )
        self.router.add_api_route(
            "",
            self.create_consultation_type,
            methods=["POST"],
            response_model=ConsultationTypeOut,
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "/{consultation_type_id}",
            self.update_consultation_type,
            methods=["PUT"],
            response_model=ConsultationTypeOut,
        )
        self.router.add_api_route(
            "/{consultation_type_id}",
            self.delete_consultation_type,
            methods=["DELETE"],
            status_code=status.HTTP_204_NO_CONTENT,
        )

    def get_all_consultation_types(self, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
        return ConsultationTypeService.get_all(db, skip, limit)

    def get_consultation_type(self, consultation_type_id: str, db: Session = Depends(get_db)):
        ct = ConsultationTypeService.get_by_id(db, consultation_type_id)
        if not ct:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
        return ct

    def create_consultation_type(self, consultation_type_in: ConsultationTypeCreate, db: Session = Depends(get_db)):
        return ConsultationTypeService.create(db, consultation_type_in)

    def update_consultation_type(self, consultation_type_id: str, consultation_type_in: ConsultationTypeUpdate, db: Session = Depends(get_db)):
        updated = ConsultationTypeService.update(db, consultation_type_id, consultation_type_in)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
        return updated

    def delete_consultation_type(self, consultation_type_id: str, db: Session = Depends(get_db)):
        success = ConsultationTypeService.delete(db, consultation_type_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
        return None


router = ConsultationTypeRouter().router
__all__ = ["ConsultationTypeRouter", "router"]

