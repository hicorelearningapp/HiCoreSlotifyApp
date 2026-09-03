from fastapi import APIRouter
from app.modules.doctor_appointment.routers.doctor_router import router as doctor_router
from app.modules.doctor_appointment.routers.appointment_router import router as appointment_router
from app.modules.doctor_appointment.routers.customer_router import router as customer_router
from app.modules.doctor_appointment.routers.prescription_router import router as prescription_router
from app.modules.doctor_appointment.routers.status_type_router import router as status_type_router
from app.modules.doctor_appointment.routers.consultation_type_router import router as consultation_type_router
from app.modules.doctor_appointment.routers.payment_router import router as payment_router

router = APIRouter()
router.include_router(doctor_router)
router.include_router(appointment_router)
router.include_router(customer_router)
router.include_router(prescription_router)
router.include_router(status_type_router)
router.include_router(consultation_type_router)
router.include_router(payment_router)
