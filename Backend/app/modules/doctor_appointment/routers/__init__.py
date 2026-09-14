from fastapi import APIRouter
from app.modules.doctor_appointment.routers.doctor_router import DoctorRouter, router as doctor_router
from app.modules.doctor_appointment.routers.appointment_router import AppointmentRouter, router as appointment_router
from app.modules.doctor_appointment.routers.customer_router import CustomerRouter, router as customer_router
from app.modules.doctor_appointment.routers.prescription_router import PrescriptionRouter, router as prescription_router
from app.modules.doctor_appointment.routers.status_type_router import StatusTypeRouter, router as status_type_router
from app.modules.doctor_appointment.routers.consultation_type_router import ConsultationTypeRouter, router as consultation_type_router
from app.modules.doctor_appointment.routers.payment_router import PaymentRouter, router as payment_router


class DoctorAppointmentRouter:
    def __init__(self):
        self.router = APIRouter()
        self.router.include_router(doctor_router)
        self.router.include_router(appointment_router)
        self.router.include_router(customer_router)
        self.router.include_router(prescription_router)
        self.router.include_router(status_type_router)
        self.router.include_router(consultation_type_router)
        self.router.include_router(payment_router)


router = DoctorAppointmentRouter().router
__all__ = ["DoctorAppointmentRouter", "router"]

