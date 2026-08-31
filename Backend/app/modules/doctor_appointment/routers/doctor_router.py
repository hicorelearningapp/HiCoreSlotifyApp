import os
import uuid
import shutil
import json
from fastapi import APIRouter, HTTPException, Query, Response, status, UploadFile, File, Form, Request
from typing import List, Optional
from datetime import date, datetime

from app.core.config import settings
import app.modules.doctor_appointment.schemas as schemas
from app.modules.doctor_appointment.services.doctor_service import DoctorService


def format_validation_error(e: Exception) -> str:
    if hasattr(e, "errors") and callable(getattr(e, "errors")):
        try:
            err_list = e.errors()
            formatted = []
            for err in err_list:
                loc = " -> ".join(str(l) for l in err.get("loc", []))
                msg = str(err.get("msg", ""))
                if msg.startswith("Value error, "):
                    msg = msg[len("Value error, "):]
                if loc:
                    formatted.append(f"{loc}: {msg}")
                else:
                    formatted.append(msg)
            return "; ".join(formatted)
        except Exception:
            pass
    msg = str(e)
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]
    return msg


class DoctorRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/doctors", tags=["Doctors"])
        self._add_routes()
        self.doctor_svc = DoctorService()

    def _add_routes(self):
        self.router.add_api_route("/login", self.login, methods=["POST"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/register", self.register_doctor, methods=["POST"], response_model=schemas.DoctorOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_doctors, methods=["GET"], response_model=List[schemas.DoctorOut])
        self.router.add_api_route("/{doctor_id}/dashboard", self.get_doctor_dashboard, methods=["GET"], response_model=schemas.DoctorDashboardOut)
        self.router.add_api_route("/{doctor_id}/analytics", self.get_doctor_analytics, methods=["GET"], response_model=schemas.DoctorAnalyticsOut)
        self.router.add_api_route("/{doctor_id}/patients", self.get_doctor_patients, methods=["GET"], response_model=schemas.DoctorPatientsResponse)
        self.router.add_api_route("/{doctor_id}/username", self.update_username, methods=["PATCH"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/{doctor_id}/password", self.update_password, methods=["PATCH"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/{doctor_id}", self.get_doctor, methods=["GET"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/{doctor_id}", self.update_doctor, methods=["PUT"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/{doctor_id}/whatsapp-status", self.update_whatsapp_status, methods=["PATCH"], response_model=schemas.DoctorOut)
        self.router.add_api_route("/{doctor_id}/available-slots", self.get_available_slots, methods=["GET"])
        self.router.add_api_route("/{doctor_id}", self.delete_doctor, methods=["DELETE"])

    def _save_photo(self, photo: UploadFile) -> str:
        images_dir = os.path.join(settings.IMAGES_DIR, "doctors")
        os.makedirs(images_dir, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(images_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        return f"/images/doctors/{filename}"

    async def register_doctor(
        self,
        request: Request,
        doctor_in: Optional[schemas.DoctorCreate] = None
    ):
        data = {}
        content_type = request.headers.get("content-type", "")

        if doctor_in is not None:
            return self.doctor_svc.create_doctor(doctor_in)

        if "multipart/form-data" in content_type:
            try:
                form = await request.form()
                for key, val in form.items():
                    if hasattr(val, "filename"):
                        if val.filename:
                            photo_url = self._save_photo(val)
                            data["ProfilePhoto"] = photo_url
                    else:
                        if val is not None and str(val).strip() != "":
                            data[key] = val
            except Exception as e:
                print("Error parsing multipart form:", e)

        elif "application/json" in content_type:
            try:
                data = await request.json()
            except Exception:
                data = {}

        try:
            doctor_create = schemas.DoctorCreate(**data)
            return self.doctor_svc.create_doctor(doctor_create)
        except (ValueError, Exception) as e:
            raise HTTPException(status_code=400, detail=format_validation_error(e))

    def login(self, login_data: schemas.DoctorLogin):
        doctor = self.doctor_svc.login_doctor(login_data)
        if not doctor:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        return doctor

    def list_doctors(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500),
        status: Optional[str] = Query(None, description="Filter by status: Pending, Approved, Rejected"),
        approved_only: bool = Query(False, description="By default returns all doctors for display"),
        business_phone: Optional[str] = Query(None, description="Filter by business phone number")
    ):
        if business_phone:
            return self.doctor_svc.list_doctors_by_business_phone(business_phone=business_phone, skip=skip, limit=limit, status=status, approved_only=approved_only)
        return self.doctor_svc.list_doctors(skip=skip, limit=limit, status=status, approved_only=approved_only)

    def get_doctor(self, doctor_id: str):
        doctor = self.doctor_svc.get_doctor(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor

    async def update_doctor(
        self,
        doctor_id: str,
        request: Request,
        doctor_update_in: Optional[schemas.DoctorUpdate] = None
    ):
        if doctor_update_in is not None:
            doctor = self.doctor_svc.update_doctor(doctor_id, doctor_update_in)
            if not doctor:
                raise HTTPException(status_code=404, detail="Doctor not found")
            return doctor

        data = {}
        content_type = request.headers.get("content-type", "")

        if "multipart/form-data" in content_type:
            try:
                form = await request.form()
                for key, val in form.items():
                    if hasattr(val, "filename"):
                        if val.filename:
                            photo_url = self._save_photo(val)
                            data["ProfilePhoto"] = photo_url
                    else:
                        if val is not None and str(val).strip() != "":
                            data[key] = val
            except Exception as e:
                print("Error parsing multipart form in update_doctor:", e)

        elif "application/json" in content_type:
            try:
                data = await request.json()
            except Exception:
                data = {}

        try:
            doctor_update = schemas.DoctorUpdate(**data)
            doctor = self.doctor_svc.update_doctor(doctor_id, doctor_update)
            if not doctor:
                raise HTTPException(status_code=404, detail="Doctor not found")
            return doctor
        except (ValueError, Exception) as e:
            raise HTTPException(status_code=400, detail=format_validation_error(e))

    def update_username(self, doctor_id: str, payload: schemas.DoctorUsernameUpdate):
        try:
            doctor = self.doctor_svc.update_doctor_username(doctor_id, payload.UserName)
            if not doctor:
                raise HTTPException(status_code=404, detail="Doctor not found")
            return doctor
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=400, detail=format_validation_error(e))

    def update_password(self, doctor_id: str, payload: schemas.DoctorPasswordUpdate):
        try:
            doctor = self.doctor_svc.update_doctor_password(
                doctor_id=doctor_id,
                new_password=payload.NewPassword,
                old_password=payload.OldPassword
            )
            if not doctor:
                raise HTTPException(status_code=404, detail="Doctor not found")
            return doctor
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=400, detail=format_validation_error(e))

    def get_available_slots(self, doctor_id: str, target_date: Optional[date] = Query(None, description="Target date for slots, defaults to today")):
        if target_date is None:
            target_date = date.today()
        return self.doctor_svc.get_available_slots(doctor_id=doctor_id, target_date=target_date)

    def delete_doctor(self, doctor_id: str):
        success = self.doctor_svc.delete_doctor(doctor_id)
        if not success:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"success": True, "message": "Doctor deleted successfully"}

    def get_doctor_dashboard(self, doctor_id: str):
        dashboard = self.doctor_svc.get_doctor_dashboard(doctor_id)
        if not dashboard:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return dashboard

    def get_doctor_analytics(self, doctor_id: str):
        analytics = self.doctor_svc.get_doctor_analytics(doctor_id)
        if not analytics:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return analytics

    def get_doctor_patients(self, doctor_id: str):
        result = self.doctor_svc.get_doctor_patients(doctor_id)
        if not result:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return result

    def update_whatsapp_status(
        self, doctor_id: str, status_data: schemas.DoctorWhatsAppStatusUpdate
    ):
        doc = self.doctor_svc.update_whatsapp_business_status(doctor_id, status_data)
        if not doc:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doc


router = DoctorRouter().router
