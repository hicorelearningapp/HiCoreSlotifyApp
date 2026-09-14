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


class DemoRequestRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/demo",
            tags=["Demo Requests"],
            responses={404: {"description": "Not found"}},
        )
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.create_demo_request,
            methods=["POST"],
            response_model=DemoRequestOut,
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "",
            self.list_demo_requests,
            methods=["GET"],
            response_model=List[DemoRequestOut],
        )
        self.router.add_api_route(
            "/{demo_id}",
            self.get_demo_request,
            methods=["GET"],
            response_model=DemoRequestOut,
        )
        self.router.add_api_route(
            "/{demo_id}",
            self.update_demo_request,
            methods=["PUT"],
            response_model=DemoRequestOut,
        )
        self.router.add_api_route(
            "/{demo_id}/status",
            self.update_demo_status,
            methods=["PATCH"],
            response_model=DemoRequestOut,
        )
        self.router.add_api_route(
            "/{demo_id}",
            self.delete_demo_request,
            methods=["DELETE"],
            status_code=status.HTTP_204_NO_CONTENT,
        )

    def create_demo_request(self, demo_in: DemoRequestCreate, db: Session = Depends(get_db)):
        return DemoRequestService.create(db, demo_in)

    def list_demo_requests(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500),
        db: Session = Depends(get_db),
    ):
        return DemoRequestService.get_all(db, skip, limit)

    def get_demo_request(self, demo_id: str, db: Session = Depends(get_db)):
        demo = DemoRequestService.get_by_id(db, demo_id)
        if not demo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
        return demo

    def update_demo_request(self, demo_id: str, demo_in: DemoRequestUpdate, db: Session = Depends(get_db)):
        updated = DemoRequestService.update(db, demo_id, demo_in)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
        return updated

    def update_demo_status(self, demo_id: str, status_in: DemoRequestStatusUpdate, db: Session = Depends(get_db)):
        updated = DemoRequestService.update_status(db, demo_id, status_in.Status)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
        return updated

    def delete_demo_request(self, demo_id: str, db: Session = Depends(get_db)):
        success = DemoRequestService.delete(db, demo_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo request not found")
        return None


router = DemoRequestRouter().router

