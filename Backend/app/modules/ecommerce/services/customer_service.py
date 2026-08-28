from typing import Optional, List
from app.core.database import db_session
from app.modules.ecommerce.models.customer import EcommerceCustomer
from app.modules.ecommerce.schemas.customer import EcommerceCustomerCreate, EcommerceCustomerUpdate

class CustomerService:
    def get_customer_by_phone(self, phone_number: str) -> Optional[EcommerceCustomer]:
        return db_session.query(EcommerceCustomer).filter(EcommerceCustomer.PhoneNumber == phone_number).first()
        
    def get_customer_by_profile_id(self, profile_id: str) -> Optional[EcommerceCustomer]:
        return db_session.query(EcommerceCustomer).filter(EcommerceCustomer.ProfileId == profile_id).first()

    def create_customer(self, customer_data: EcommerceCustomerCreate) -> EcommerceCustomer:
        db_customer = EcommerceCustomer(**customer_data.model_dump())
        db_session.add(db_customer)
        db_session.commit()
        db_session.refresh(db_customer)
        return db_customer

    def update_customer(self, phone_number: str, customer_data: EcommerceCustomerUpdate) -> Optional[EcommerceCustomer]:
        db_customer = self.get_customer_by_phone(phone_number)
        if db_customer:
            update_data = customer_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_customer, key, value)
            db_session.commit()
            db_session.refresh(db_customer)
        return db_customer
