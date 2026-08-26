from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend_app.core.database import get_db
from backend_app.modules.doctor_appointment.services.consultation_type_service import ConsultationTypeService
from backend_app.modules.doctor_appointment.schemas.consultation_type import ConsultationTypeCreate, ConsultationTypeUpdate, ConsultationTypeOut

router = APIRouter(
    prefix="/consultation-types",
    tags=["Consultation Types"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=List[ConsultationTypeOut])
def get_all_consultation_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ConsultationTypeService.get_all(db, skip, limit)

@router.get("/{consultation_type_id}", response_model=ConsultationTypeOut)
def get_consultation_type(consultation_type_id: str, db: Session = Depends(get_db)):
    ct = ConsultationTypeService.get_by_id(db, consultation_type_id)
    if not ct:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
    return ct

@router.post("", response_model=ConsultationTypeOut, status_code=status.HTTP_201_CREATED)
def create_consultation_type(consultation_type_in: ConsultationTypeCreate, db: Session = Depends(get_db)):
    return ConsultationTypeService.create(db, consultation_type_in)

@router.put("/{consultation_type_id}", response_model=ConsultationTypeOut)
def update_consultation_type(consultation_type_id: str, consultation_type_in: ConsultationTypeUpdate, db: Session = Depends(get_db)):
    updated = ConsultationTypeService.update(db, consultation_type_id, consultation_type_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
    return updated

@router.delete("/{consultation_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation_type(consultation_type_id: str, db: Session = Depends(get_db)):
    success = ConsultationTypeService.delete(db, consultation_type_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation type not found")
    return None
