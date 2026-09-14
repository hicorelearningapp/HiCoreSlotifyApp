from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.doctor_appointment.services.status_type_service import StatusTypeService
from app.modules.doctor_appointment.schemas.status_type import StatusTypeCreate, StatusTypeUpdate, StatusTypeOut


class StatusTypeRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/status-types",
            tags=["Status Types"],
            responses={404: {"description": "Not found"}},
        )
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.get_all_status_types,
            methods=["GET"],
            response_model=List[StatusTypeOut],
        )
        self.router.add_api_route(
            "/{status_type_id}",
            self.get_status_type,
            methods=["GET"],
            response_model=StatusTypeOut,
        )
        self.router.add_api_route(
            "",
            self.create_status_type,
            methods=["POST"],
            response_model=StatusTypeOut,
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "/{status_type_id}",
            self.update_status_type,
            methods=["PUT"],
            response_model=StatusTypeOut,
        )
        self.router.add_api_route(
            "/{status_type_id}",
            self.delete_status_type,
            methods=["DELETE"],
            status_code=status.HTTP_204_NO_CONTENT,
        )

    def get_all_status_types(self, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
        return StatusTypeService.get_all(db, skip, limit)

    def get_status_type(self, status_type_id: str, db: Session = Depends(get_db)):
        st = StatusTypeService.get_by_id(db, status_type_id)
        if not st:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
        return st

    def create_status_type(self, status_type_in: StatusTypeCreate, db: Session = Depends(get_db)):
        return StatusTypeService.create(db, status_type_in)

    def update_status_type(self, status_type_id: str, status_type_in: StatusTypeUpdate, db: Session = Depends(get_db)):
        updated = StatusTypeService.update(db, status_type_id, status_type_in)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
        return updated

    def delete_status_type(self, status_type_id: str, db: Session = Depends(get_db)):
        success = StatusTypeService.delete(db, status_type_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status type not found")
        return None


router = StatusTypeRouter().router
__all__ = ["StatusTypeRouter", "router"]

