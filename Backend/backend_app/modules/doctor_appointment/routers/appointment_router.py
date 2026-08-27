from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import date

import backend_app.modules.doctor_appointment.schemas as schemas
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService


class AppointmentRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/appointments", tags=["Appointments"])
        self._add_routes()
        self.appt_svc = AppointmentService()

    def _add_routes(self):
        self.router.add_api_route("", self.book_appointment, methods=["POST"], response_model=schemas.AppointmentOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/manual", self.create_manual_appointment, methods=["POST"], response_model=schemas.AppointmentOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_appointments, methods=["GET"], response_model=schemas.AppointmentListResponse)
        self.router.add_api_route("/doctor/{doctor_id}/past", self.get_past_doctor_appointments, methods=["GET"], response_model=List[schemas.AppointmentOut])
        self.router.add_api_route("/doctor/{doctor_id}/upcoming", self.get_upcoming_doctor_appointments, methods=["GET"], response_model=List[schemas.AppointmentOut])
        self.router.add_api_route("/past", self.get_past_appointments, methods=["GET"], response_model=List[schemas.AppointmentOut])
        self.router.add_api_route("/status/bulk", self.update_multiple_appointments_status, methods=["PATCH"], response_model=List[schemas.AppointmentOut])
        self.router.add_api_route("/{appointment_id}", self.get_appointment, methods=["GET"], response_model=schemas.AppointmentOut)
        self.router.add_api_route("/{appointment_id}", self.update_appointment, methods=["PUT"], response_model=schemas.AppointmentOut)
        self.router.add_api_route("/{appointment_id}/status", self.update_appointment_status, methods=["PATCH"], response_model=schemas.AppointmentOut)
        self.router.add_api_route("/{appointment_id}/review-date", self.update_review_date, methods=["PATCH"], response_model=schemas.AppointmentOut)
        self.router.add_api_route("/{appointment_id}/reschedule", self.reschedule_appointment, methods=["PUT"], response_model=schemas.AppointmentOut)
        self.router.add_api_route("/{appointment_id}/cancel", self.cancel_appointment, methods=["PATCH"])
        self.router.add_api_route("/{appointment_id}", self.delete_appointment, methods=["DELETE"])


    def book_appointment(self, appointment: schemas.AppointmentCreate):
        return self.appt_svc.book_appointment(appointment)

    def create_manual_appointment(self, appointment_data: schemas.ManualAppointmentCreate):
        return self.appt_svc.create_manual_appointment(appointment_data)

    def list_appointments(
        self, 
        doctor_id: Optional[str] = Query(None, description="Filter by Doctor ID"), 
        patient_id: Optional[str] = Query(None, description="Filter by Patient ID"), 
        target_date: Optional[date] = Query(None, description="Filter by Date"), 
        status: Optional[str] = Query(None, description="Filter by Status (Booked, Completed, Cancelled, Rescheduled, NoShow)"), 
        filter_type: Optional[str] = Query(None, description="Filter by 'today', 'weekly', or 'monthly'"),
        skip: int = Query(0, ge=0), 
        limit: int = Query(100, ge=1, le=500)
    ):
        return self.appt_svc.list_appointments(doctor_id=doctor_id, patient_id=patient_id, target_date=target_date, status=status, filter_type=filter_type, skip=skip, limit=limit)


    def get_past_doctor_appointments(
        self,
        doctor_id: str,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500)
    ):
        return self.appt_svc.get_past_doctor_appointments(doctor_id=doctor_id, skip=skip, limit=limit)

    def get_upcoming_doctor_appointments(self, doctor_id: str, limit: int = Query(15, ge=1, le=100)):
        return self.appt_svc.get_upcoming_doctor_appointments(doctor_id=doctor_id, limit=limit)

    def get_past_appointments(
        self,
        doctor_id: Optional[str] = Query(None, description="Filter by Doctor ID"),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500)
    ):
        return self.appt_svc.get_past_doctor_appointments(doctor_id=doctor_id, skip=skip, limit=limit)

    def get_appointment(self, appointment_id: str):

        appt = self.appt_svc.get_appointment(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appt

    def update_appointment(self, appointment_id: str, appt_update: schemas.AppointmentUpdate):
        appt = self.appt_svc.update_appointment(appointment_id, appt_update)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appt

    def update_appointment_status(self, appointment_id: str, status_in: schemas.AppointmentStatusUpdate):
        appt = self.appt_svc.update_appointment_status(appointment_id, status_in.Status, status_in.ReMarks)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appt

    def update_review_date(self, appointment_id: str, review_in: schemas.AppointmentReviewDateUpdate):
        appt = self.appt_svc.update_review_date(appointment_id, review_in.ReviewDate)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appt

    def update_multiple_appointments_status(self, status_in: schemas.BulkAppointmentStatusUpdate):

        appts = self.appt_svc.update_multiple_appointments_status(status_in.AppointmentIds, status_in.Status, status_in.ReMarks)
        return appts

    def reschedule_appointment(self, appointment_id: str, reschedule_in: schemas.AppointmentReschedule):
        return self.appt_svc.reschedule_appointment(appointment_id=appointment_id, target_date=reschedule_in.Date, slot_time=reschedule_in.SlotTime, slot=reschedule_in.Slot)

    def delete_appointment(self, appointment_id: str):
        success = self.appt_svc.delete_appointment(appointment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return {"success": True, "message": "Appointment deleted successfully"}

    def cancel_appointment(self, appointment_id: str):
        success = self.appt_svc.cancel_appointment(appointment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return {"success": True, "message": "Appointment cancelled successfully"}


router = AppointmentRouter().router
