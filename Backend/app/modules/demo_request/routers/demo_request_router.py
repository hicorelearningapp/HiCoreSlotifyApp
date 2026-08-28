from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.demo_request.services.demo_request_service import DemoRequestService
from app.modules.demo_request.schemas.demo_request import (
    DemoRequestCreate,
    DemoRequestOut,
    DemoRequestStatusUpdate,
    DemoRequestUpdate,
)

router = APIRouter(
    prefix="/demo",
    tags=["Demo Requests"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=DemoRequestOut, status_code=status.HTTP_201_CREATED)
def create_demo_request(demo_in: DemoRequestCreate, db: Session = Depends(get_db)):
    return DemoRequestService.create(db, demo_in)


@router.get("", response_model=List[DemoRequestOut])
def list_demo_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return DemoRequestService.get_all(db, skip, limit)


@router.get("/{demo_id}", response_model=DemoRequestOut)
def get_demo_request(demo_id: str, db: Session = Depends(get_db)):
    demo = DemoRequestService.get_by_id(db, demo_id)
    if not demo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
    return demo


@router.put("/{demo_id}", response_model=DemoRequestOut)
def update_demo_request(demo_id: str, demo_in: DemoRequestUpdate, db: Session = Depends(get_db)):
    updated = DemoRequestService.update(db, demo_id, demo_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
    return updated


@router.patch("/{demo_id}/status", response_model=DemoRequestOut)
def update_demo_status(demo_id: str, status_in: DemoRequestStatusUpdate, db: Session = Depends(get_db)):
    updated = DemoRequestService.update_status(db, demo_id, status_in.Status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
    return updated


@router.delete("/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demo_request(demo_id: str, db: Session = Depends(get_db)):
    success = DemoRequestService.delete(db, demo_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
    return None
