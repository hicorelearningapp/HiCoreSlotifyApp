from fastapi import APIRouter, status, HTTPException
from typing import Optional

from app.modules.ecommerce.schemas.customer import EcommerceCustomerCreate, EcommerceCustomerUpdate, EcommerceCustomerOut
from app.modules.ecommerce.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Ecommerce Customers"])

@router.get("/by-phone/{phone_number}", response_model=EcommerceCustomerOut)
def get_customer_by_phone(phone_number: str):
    svc = CustomerService()
    customer = svc.get_customer_by_phone(phone_number)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", response_model=EcommerceCustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(data: EcommerceCustomerCreate):
    svc = CustomerService()
    customer = svc.get_customer_by_phone(data.PhoneNumber)
    if customer:
        raise HTTPException(status_code=400, detail="Customer already exists")
    return svc.create_customer(data)

@router.put("/by-phone/{phone_number}", response_model=EcommerceCustomerOut)
def update_customer(phone_number: str, data: EcommerceCustomerUpdate):
    svc = CustomerService()
    customer = svc.update_customer(phone_number, data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
