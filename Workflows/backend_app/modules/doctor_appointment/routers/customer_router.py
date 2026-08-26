from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

import backend_app.modules.doctor_appointment.schemas as schemas
from backend_app.modules.doctor_appointment.services.customer_service import CustomerService


class CustomerRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/customers", tags=["Customers"])
        self._add_routes()
        self.customer_svc = CustomerService()

    def _add_routes(self):
        self.router.add_api_route("", self.create_customer, methods=["POST"], response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_customers, methods=["GET"], response_model=List[schemas.CustomerOut])
        self.router.add_api_route("/by-phone/{phone_number}", self.get_customer_by_phone, methods=["GET"], response_model=schemas.CustomerOut)
        self.router.add_api_route("/by-phone/{phone_number}/patients", self.get_patients_by_phone, methods=["GET"], response_model=List[schemas.CustomerOut])
        self.router.add_api_route("/by-phone/{phone_number}/patients", self.add_patient_by_phone, methods=["POST"], response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/{patient_id}", self.get_customer, methods=["GET"], response_model=schemas.CustomerOut)
        self.router.add_api_route("/{patient_id}", self.update_customer, methods=["PUT"], response_model=schemas.CustomerOut)
        self.router.add_api_route("/{patient_id}", self.delete_customer, methods=["DELETE"])


    def create_customer(self, customer: schemas.CustomerCreate):
        db_customer = self.customer_svc.get_customer_by_phone(phone_number=customer.PhoneNumber)
        if db_customer:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        return self.customer_svc.create_customer(customer=customer)

    def list_customers(self, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)):
        return self.customer_svc.list_customers(skip=skip, limit=limit)

    def get_customer_by_phone(self, phone_number: str):
        customer = self.customer_svc.get_customer_by_phone(phone_number=phone_number)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer account not found")
        return customer

    def get_patients_by_phone(self, phone_number: str):
        patients = self.customer_svc.get_patients_by_phone(phone_number=phone_number)
        return patients

    def add_patient_by_phone(self, phone_number: str, patient_in: schemas.PatientCreate):
        return self.customer_svc.add_patient_by_phone(
            phone_number=phone_number,
            patient_name=patient_in.PatientName,
            date_of_birth=patient_in.DateOfBirth,
            blood_group=patient_in.BloodGroup,
            gender=patient_in.Gender,
            address=patient_in.Address
        )


    def get_customer(self, patient_id: str):
        customer = self.customer_svc.get_customer(patient_id=patient_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return customer

    def update_customer(self, patient_id: str, customer_update: schemas.CustomerUpdate):
        customer = self.customer_svc.update_customer(patient_id=patient_id, customer_update=customer_update)
        if not customer:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return customer


    def delete_customer(self, patient_id: str):

        success = self.customer_svc.delete_customer(patient_id=patient_id)
        if not success:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return {"success": True, "message": "Customer deleted successfully"}


router = CustomerRouter().router
