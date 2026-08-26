from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend_app.core.database import db_session
from backend_app.core.security import hash_password, verify_password, create_access_token
import backend_app.common.models as models
import backend_app.common.schemas as schemas

class BusinessService:
    def __init__(self, db: Session = None):
        self.db = db or db_session

    def register_business(self, data: schemas.BusinessRegisterCreate) -> models.Business:
        # Check uniqueness of mobile number, email address, or username
        existing = (
            self.db.query(models.Business)
            .filter(
                (models.Business.EmailAddress == data.EmailAddress)
                | (models.Business.UserName == data.UserName)
                | (models.Business.MobileNumber == data.MobileNumber)
            )
            .first()
        )
        if existing:
            if existing.EmailAddress == data.EmailAddress:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A business with this email address is already registered."
                )
            if existing.UserName == data.UserName:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A business with this username already exists. Please choose a different username."
                )
            if existing.MobileNumber == data.MobileNumber:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A business with this mobile number is already registered."
                )

        business_data = data.model_dump()
        raw_password = business_data.pop("Password")
        business_data["Password"] = hash_password(raw_password)

        new_business = models.Business(**business_data)
        self.db.add(new_business)
        self.db.commit()
        self.db.refresh(new_business)
        return new_business

    def login_business(self, login_data: schemas.BusinessLogin) -> dict:
        identifier = login_data.UserName or login_data.EmailAddress
        if not identifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either UserName or EmailAddress must be provided for login."
            )

        business = (
            self.db.query(models.Business)
            .filter(
                (models.Business.UserName == identifier)
                | (models.Business.EmailAddress == identifier)
            )
            .first()
        )

        if not business or not verify_password(login_data.Password, business.Password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password."
            )

        token = create_access_token({
            "sub": business.Id,
            "industry": business.IndustryType,
            "username": business.UserName,
            "role": "business_owner"
        })

        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "business": business
        }

    def get_business(self, business_id: str) -> models.Business:
        business = self.db.query(models.Business).filter(models.Business.Id == business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found."
            )
        return business

    def list_businesses(
        self,
        industry_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.Business]:
        query = self.db.query(models.Business)
        if industry_type:
            query = query.filter(models.Business.IndustryType == industry_type)
        if status:
            query = query.filter(models.Business.Status == status)
        return query.order_by(models.Business.CreatedAt.desc()).offset(skip).limit(limit).all()

    def update_business(self, business_id: str, data: schemas.BusinessUpdate) -> models.Business:
        business = self.get_business(business_id)
        update_dict = data.model_dump(exclude_unset=True)

        if "Password" in update_dict and update_dict["Password"]:
            update_dict["Password"] = hash_password(update_dict["Password"])

        # If IndustryData is updated, merge or replace
        if "IndustryData" in update_dict and update_dict["IndustryData"] is not None:
            current_data = business.IndustryData or {}
            if isinstance(current_data, dict) and isinstance(update_dict["IndustryData"], dict):
                merged = {**current_data, **update_dict["IndustryData"]}
                update_dict["IndustryData"] = merged

        for field, val in update_dict.items():
            setattr(business, field, val)

        self.db.commit()
        self.db.refresh(business)
        return business

    def delete_business(self, business_id: str) -> bool:
        business = self.db.query(models.Business).filter(models.Business.Id == business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found."
            )
        self.db.delete(business)
        self.db.commit()
        return True
