import os
import uuid
import shutil
import json
from typing import List, Optional
from fastapi import APIRouter, Query, status, UploadFile, File, Form, Request, HTTPException

from app.core.config import settings
import app.common.schemas as schemas
from app.common.services.business_service import BusinessService
from typing import Any

class BusinessRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/businesses", tags=["Common Business Management"])
        self.business_svc = BusinessService()
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "/register",
            self.register_business,
            methods=["POST"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_201_CREATED,
            summary="Register a new business (Multi-industry support with common columns and industry JSON data)"
        )
        self.router.add_api_route(
            "/login",
            self.login_business,
            methods=["POST"],
            response_model=schemas.BusinessLoginResponse,
            status_code=status.HTTP_200_OK,
            summary="Business account login with JWT token generation"
        )
        self.router.add_api_route(
            "",
            self.list_businesses,
            methods=["GET"],
            response_model=List[schemas.BusinessOut],
            status_code=status.HTTP_200_OK,
            summary="List all registered businesses filterable by industry and status"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.get_business,
            methods=["GET"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_200_OK,
            summary="Get details of a registered business by ID"
        )
        self.router.add_api_route(
            "/by-phone/{phone_number}",
            self.get_business_by_phone,
            methods=["GET"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_200_OK,
            summary="Get details of a registered business by BusinessPhoneNumber"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.update_business,
            methods=["PUT"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_200_OK,
            summary="Update business profile or industry-specific JSON payload"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.delete_business,
            methods=["DELETE"],
            status_code=status.HTTP_200_OK,
            summary="Delete a business registration"
        )

    def _save_profile_pic(self, photo: UploadFile) -> str:
        images_dir = os.path.join(settings.IMAGES_DIR, "businesses")
        os.makedirs(images_dir, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(images_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        return f"/images/businesses/{filename}"

    async def register_business(
        self,
        request: Request,
        BusinessName: Optional[str] = Form(None, description="Name of the business / entity"),
        IndustryType: Optional[str] = Form(None, description="Industry sector, e.g. DoctorAppointment, Ecommerce, Salon, Hospitality, etc."),
        FullName: Optional[str] = Form(None, description="Name of the business owner / representative"),
        EmailAddress: Optional[str] = Form(None, description="Primary email address"),
        MobileNumber: Optional[str] = Form(None, description="Primary mobile phone number"),
        BusinessPhoneNumber: Optional[str] = Form(None, description="WhatsApp or secondary business phone number"),
        ProfilePic: Optional[UploadFile] = File(None, description="Choose profile picture from your computer"),
        Address: Optional[str] = Form(None, description="Full street address"),
        City: Optional[str] = Form(None, description="City"),
        State: Optional[str] = Form(None, description="State"),
        Pincode: Optional[str] = Form(None, description="Postal / Zip code"),
        Country: Optional[str] = Form("India", description="Country"),
        UserName: Optional[str] = Form(None, description="Unique username for business account login"),
        Password: Optional[str] = Form(None, description="Account login password"),
        BusinessData: Optional[str] = Form(None, description="Dynamic JSON data payload customized for business (e.g. {'consultation_fee': 700})"),
    ):
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            form = await request.form()
            form_data = {}
            for key, val in form.items():
                if hasattr(val, "filename"):
                    if val.filename:
                        photo_url = self._save_profile_pic(val)
                        form_data["ProfilePic"] = photo_url
                else:
                    if val is not None and str(val).strip() != "":
                        form_data[key] = val
            if "BusinessData" in form_data and isinstance(form_data["BusinessData"], str):
                try:
                    form_data["BusinessData"] = json.loads(form_data["BusinessData"])
                except Exception:
                    form_data["BusinessData"] = {}
            parsed_data = schemas.BusinessRegisterCreate(**form_data)
            return self.business_svc.register_business(parsed_data)
        elif "application/json" in content_type:
            body = await request.json()
            parsed_data = schemas.BusinessRegisterCreate(**body)
            return self.business_svc.register_business(parsed_data)
        else:
            # Fallback if form parameters were bound directly
            form_dict : dict[str, Any] = {
                "BusinessName": BusinessName,
                "IndustryType": IndustryType,
                "FullName": FullName,
                "EmailAddress": EmailAddress,
                "MobileNumber": MobileNumber,
                "BusinessPhoneNumber": BusinessPhoneNumber,
                "Address": Address,
                "City": City,
                "State": State,
                "Pincode": Pincode,
                "Country": Country,
                "UserName": UserName,
                "Password": Password,
            }
            if ProfilePic and ProfilePic.filename:
                form_dict["ProfilePic"] = self._save_profile_pic(ProfilePic)
            if BusinessData:
                try:
                    form_dict["BusinessData"] = json.loads(BusinessData)
                except Exception:
                    form_dict["BusinessData"] = {}
            # Filter out None values
            form_dict = {k: v for k, v in form_dict.items() if v is not None}
            parsed_data = schemas.BusinessRegisterCreate(**form_dict)
            return self.business_svc.register_business(parsed_data)

    def login_business(self, login_data: schemas.BusinessLogin):
        return self.business_svc.login_business(login_data)

    def list_businesses(
        self,
        industry_type: Optional[str] = Query(None, description="Filter by industry type"),
        status: Optional[schemas.BusinessStatusEnum] = Query(None, description="Filter by status"),
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=500, description="Max records to return")
    ):
        stat_val = status.value if status else None
        return self.business_svc.list_businesses(industry_type=industry_type, status=stat_val, skip=skip, limit=limit)

    def get_business(self, business_id: str):
        return self.business_svc.get_business(business_id)

    def get_business_by_phone(self, phone_number: str):
        return self.business_svc.get_business_by_phone(phone_number)

    async def update_business(
        self,
        business_id: str,
        request: Request,
        BusinessName: Optional[str] = Form(None, description="Name of the business / entity"),
        FullName: Optional[str] = Form(None, description="Name of the business owner / representative"),
        MobileNumber: Optional[str] = Form(None, description="Primary mobile phone number"),
        BusinessPhoneNumber: Optional[str] = Form(None, description="WhatsApp or secondary business phone number"),
        ProfilePic: Optional[UploadFile] = File(None, description="Choose profile picture from your computer to update"),
        Address: Optional[str] = Form(None, description="Full street address"),
        City: Optional[str] = Form(None, description="City"),
        State: Optional[str] = Form(None, description="State"),
        Pincode: Optional[str] = Form(None, description="Postal / Zip code"),
        Country: Optional[str] = Form(None, description="Country"),
        Password: Optional[str] = Form(None, description="New password if updating"),
        Status: Optional[schemas.BusinessStatusEnum] = Form(None, description="Business status choice"),
        IsVerified: Optional[bool] = Form(None, description="Verification status"),
        BusinessData: Optional[str] = Form(None, description="Dynamic JSON data payload to merge/update (e.g. {'consultation_fee': 850})"),
    ):
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            form = await request.form()
            form_data = {}
            for key, val in form.items():
                if hasattr(val, "filename"):
                    if val.filename:
                        photo_url = self._save_profile_pic(val)
                        form_data["ProfilePic"] = photo_url
                else:
                    if val is not None and str(val).strip() != "":
                        form_data[key] = val
            if "BusinessData" in form_data and isinstance(form_data["BusinessData"], str):
                try:
                    form_data["BusinessData"] = json.loads(form_data["BusinessData"])
                except Exception:
                    form_data["BusinessData"] = {}
            if "IsVerified" in form_data:
                form_data["IsVerified"] = str(form_data["IsVerified"]).lower() in ("true", "1", "yes")
            parsed_data = schemas.BusinessUpdate(**form_data)
            return self.business_svc.update_business(business_id, parsed_data)
        elif "application/json" in content_type:
            body = await request.json()
            parsed_data = schemas.BusinessUpdate(**body)
            return self.business_svc.update_business(business_id, parsed_data)
        else:
            # Fallback if form parameters were bound directly
            form_dict : dict[str, Any] = {
                "BusinessName": BusinessName,
                "FullName": FullName,
                "MobileNumber": MobileNumber,
                "BusinessPhoneNumber": BusinessPhoneNumber,
                "Address": Address,
                "City": City,
                "State": State,
                "Pincode": Pincode,
                "Country": Country,
                "Password": Password,
                "Status": Status,
                "IsVerified": IsVerified,
            }
            if ProfilePic and ProfilePic.filename:
                form_dict["ProfilePic"] = self._save_profile_pic(ProfilePic)
            if BusinessData:
                try:
                    form_dict["BusinessData"] = json.loads(BusinessData)
                except Exception:
                    form_dict["BusinessData"] = {}
            form_dict = {k: v for k, v in form_dict.items() if v is not None}
            parsed_data = schemas.BusinessUpdate(**form_dict)
            return self.business_svc.update_business(business_id, parsed_data)

    def delete_business(self, business_id: str):
        self.business_svc.delete_business(business_id)
        return {"status": "success", "message": "Business registration deleted successfully."}
