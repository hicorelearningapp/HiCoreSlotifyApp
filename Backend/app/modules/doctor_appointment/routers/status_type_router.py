from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.doctor_appointment.services.status_type_service import StatusTypeService
from app.modules.doctor_appointment.schemas.status_type import StatusTypeCreate, StatusTypeUpdate, StatusTypeOut

router = APIRouter(
    prefix="/status-types",
    tags=["Status Types"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=List[StatusTypeOut])
def get_all_status_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return StatusTypeService.get_all(db, skip, limit)

@router.get("/{status_type_id}", response_model=StatusTypeOut)
def get_status_type(status_type_id: str, db: Session = Depends(get_db)):
    st = StatusTypeService.get_by_id(db, status_type_id)
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
    return st

@router.post("", response_model=StatusTypeOut, status_code=status.HTTP_201_CREATED)
def create_status_type(status_type_in: StatusTypeCreate, db: Session = Depends(get_db)):
    return StatusTypeService.create(db, status_type_in)

@router.put("/{status_type_id}", response_model=StatusTypeOut)
def update_status_type(status_type_id: str, status_type_in: StatusTypeUpdate, db: Session = Depends(get_db)):
    updated = StatusTypeService.update(db, status_type_id, status_type_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
    return updated

@router.delete("/{status_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_status_type(status_type_id: str, db: Session = Depends(get_db)):
    success = StatusTypeService.delete(db, status_type_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
    return None
