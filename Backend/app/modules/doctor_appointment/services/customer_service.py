from datetime import date
from sqlalchemy.orm import Session
from typing import List, Optional
import app.modules.doctor_appointment.models as models
import app.modules.doctor_appointment.schemas as schemas
import uuid
from app.core.database import db_session

class CustomerService:
    def __init__(self):
        self.db = db_session

    def create_customer(self, customer: schemas.CustomerCreate, language: str | None= None) -> models.Customer:
        customer_id = str(uuid.uuid4())
        patient_id = str(uuid.uuid4())
        patient_name = customer.PatientName if customer.PatientName else customer.CustomerName
        
        db_customer = models.Customer(
            PatientId=patient_id,
            CustomerId=customer_id,
            CustomerName=customer.CustomerName,
            PatientName=patient_name,
            PhoneNumber=customer.PhoneNumber,
            EmailAddress=customer.EmailAddress,
            DateOfBirth=customer.DateOfBirth,
            BloodGroup=customer.BloodGroup,
            Gender=customer.Gender,
            Address=customer.Address,
            Language=language
        )
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer


    def list_customers(self, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.Customer]:
        query = self.db.query(models.Customer)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (models.Customer.CustomerName.ilike(search_pattern)) |
                (models.Customer.PatientName.ilike(search_pattern)) |
                (models.Customer.PhoneNumber.ilike(search_pattern))
            )
        return query.offset(skip).limit(limit).all()

    def get_customer(self, patient_id: str) -> Optional[models.Customer]:
        return self.db.query(models.Customer).filter(models.Customer.PatientId == patient_id).first()

    def get_customer_by_phone(self, phone_number: str) -> Optional[models.Customer]:
        from app.core.phone_utils import build_phone_filter
        phone_filter = build_phone_filter(models.Customer.PhoneNumber, phone_number)
        cust = self.db.query(models.Customer).filter(
            phone_filter,
            models.Customer.CustomerName == models.Customer.PatientName
        ).first()
        if not cust:
            cust = self.db.query(models.Customer).filter(phone_filter).first()
        return cust

    def get_patients_by_phone(self, phone_number: str) -> List[models.Customer]:
        primary_cust = self.get_customer_by_phone(phone_number)
        if not primary_cust:
            return []
        return self.db.query(models.Customer).filter(models.Customer.CustomerId == primary_cust.CustomerId).all()

    def get_profiles_by_phone(self, phone_number: str) -> List[models.Customer]:
        """Alias for get_patients_by_phone used by some legacy workflows."""
        return self.get_patients_by_phone(phone_number)

    def add_patient_by_phone(
        self,
        phone_number: str,
        patient_name: str,
        date_of_birth: Optional[date] = None,
        blood_group: Optional[str] = None,
        gender: Optional[str] = None,
        address: Optional[str] = None
    ) -> models.Customer:
        primary_cust = self.get_customer_by_phone(phone_number)
        if not primary_cust:
            customer_id = str(uuid.uuid4())
            customer_name = patient_name
        else:
            customer_id = primary_cust.CustomerId
            customer_name = primary_cust.CustomerName

        patient_id = str(uuid.uuid4())
        db_patient = models.Customer(
            PatientId=patient_id,
            CustomerId=customer_id,
            CustomerName=customer_name,
            PatientName=patient_name,
            PhoneNumber=phone_number,
            DateOfBirth=date_of_birth,
            BloodGroup=blood_group,
            Gender=gender,
            Address=address
        )
        self.db.add(db_patient)
        self.db.commit()
        self.db.refresh(db_patient)
        return db_patient


    def update_customer_name(self, phone_number: str, new_name: str) -> bool:
        customer = self.get_customer_by_phone(phone_number)
        if customer:
            customer.CustomerName = new_name
            customer.PatientName = new_name
            self.db.commit()
            return True
        return False
        
    def update_customer_email(self, phone_number: str, new_email: str) -> bool:
        customer = self.get_customer_by_phone(phone_number)
        if customer:
            customer.EmailAddress = new_email
            self.db.commit()
            return True
        return False

    def update_customer(self, patient_id: str, customer_update: schemas.CustomerUpdate) -> Optional[models.Customer]:
        customer = self.db.query(models.Customer).filter(models.Customer.PatientId == patient_id).first()
        if not customer:
            return None

        update_data = customer_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(customer, key, value)

        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete_customer(self, patient_id: str) -> bool:
        customer = self.db.query(models.Customer).filter(models.Customer.PatientId == patient_id).first()
        if not customer:
            return False

        self.db.delete(customer)
        self.db.commit()
        return True

