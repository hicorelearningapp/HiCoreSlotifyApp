from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

import app.modules.doctor_appointment.schemas as schemas
from app.modules.doctor_appointment.services.payment_service import PaymentService


class PaymentRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/payments", tags=["Payments"])
        self._add_routes()
        self.payment_svc = PaymentService()

    def _add_routes(self):
        self.router.add_api_route("", self.create_payment, methods=["POST"], response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_payments, methods=["GET"], response_model=List[schemas.PaymentOut])
        self.router.add_api_route("/by-appointment/{appointment_id}", self.get_payment_by_appointment, methods=["GET"], response_model=schemas.PaymentOut)
        self.router.add_api_route("/{payment_id}", self.get_payment, methods=["GET"], response_model=schemas.PaymentOut)
        self.router.add_api_route("/{payment_id}", self.update_payment, methods=["PUT"], response_model=schemas.PaymentOut)
        self.router.add_api_route("/{payment_id}/status", self.update_payment_status, methods=["PATCH"], response_model=schemas.PaymentOut)
        self.router.add_api_route("/{payment_id}", self.delete_payment, methods=["DELETE"])

    def create_payment(self, payment: schemas.PaymentCreate):
        return self.payment_svc.create_payment(payment)

    def list_payments(
        self,
        appointment_id: Optional[str] = Query(None, description="Filter by Appointment ID"),
        doctor_id: Optional[str] = Query(None, description="Filter by Doctor ID"),
        status: Optional[str] = Query(None, description="Filter by Payment Status (Pending, Paid, Failed, Refunded)"),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500)
    ):
        return self.payment_svc.list_payments(appointment_id=appointment_id, doctor_id=doctor_id, status=status, skip=skip, limit=limit)

    def get_payment_by_appointment(self, appointment_id: str):
        payment = self.payment_svc.get_payment_by_appointment(appointment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record for this appointment not found")
        return payment

    def get_payment(self, payment_id: str):
        payment = self.payment_svc.get_payment(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        return payment

    def update_payment(self, payment_id: str, payment_update: schemas.PaymentUpdate):
        payment = self.payment_svc.update_payment(payment_id, payment_update)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        return payment

    def update_payment_status(self, payment_id: str, status_in: schemas.PaymentStatusUpdate):
        payment = self.payment_svc.update_payment_status(payment_id, status_in.Status)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        return payment

    def delete_payment(self, payment_id: str):
        success = self.payment_svc.delete_payment(payment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Payment record not found")
        return {"success": True, "message": "Payment deleted successfully"}


router = PaymentRouter().router
