from fastapi import APIRouter, status, HTTPException
from typing import Optional

from app.modules.ecommerce.schemas.customer import EcommerceCustomerCreate, EcommerceCustomerUpdate, EcommerceCustomerOut
from app.modules.ecommerce.services.customer_service import CustomerService


class EcommerceCustomerRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/customers", tags=["Ecommerce Customers"])
        self.svc = CustomerService()
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "/by-phone/{phone_number}",
            self.get_customer_by_phone,
            methods=["GET"],
            response_model=EcommerceCustomerOut,
        )
        self.router.add_api_route(
            "",
            self.create_customer,
            methods=["POST"],
            response_model=EcommerceCustomerOut,
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "/by-phone/{phone_number}",
            self.update_customer,
            methods=["PUT"],
            response_model=EcommerceCustomerOut,
        )

    def get_customer_by_phone(self, phone_number: str):
        customer = self.svc.get_customer_by_phone(phone_number)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    def create_customer(self, data: EcommerceCustomerCreate):
        customer = self.svc.get_customer_by_phone(data.PhoneNumber)
        if customer:
            raise HTTPException(status_code=400, detail="Customer already exists")
        return self.svc.create_customer(data)

    def update_customer(self, phone_number: str, data: EcommerceCustomerUpdate):
        customer = self.svc.update_customer(phone_number, data)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer


# Aliases for flexibility
CustomerRouter = EcommerceCustomerRouter
router = EcommerceCustomerRouter().router
__all__ = ["EcommerceCustomerRouter", "CustomerRouter", "router"]

