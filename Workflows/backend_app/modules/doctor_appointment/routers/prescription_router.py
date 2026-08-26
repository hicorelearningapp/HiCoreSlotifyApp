import json
from datetime import date
from fastapi import APIRouter, HTTPException, Query, Request, status, UploadFile, File, Form
from typing import List, Optional

import backend_app.modules.doctor_appointment.schemas as schemas
from backend_app.modules.doctor_appointment.services.prescription_service import PrescriptionService

class PrescriptionRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])
        self.prescription_svc = PrescriptionService()
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("", self.create_prescription, methods=["POST"], response_model=schemas.PrescriptionOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_prescriptions, methods=["GET"], response_model=List[schemas.PrescriptionOut])
        self.router.add_api_route("/{prescription_id}", self.get_prescription, methods=["GET"], response_model=schemas.PrescriptionOut)
        self.router.add_api_route("/{prescription_id}", self.update_prescription, methods=["PUT"], response_model=schemas.PrescriptionOut)
        self.router.add_api_route("/{prescription_id}", self.delete_prescription, methods=["DELETE"])

    async def create_prescription(
        self,
        request: Request,
        DoctorId: Optional[str] = Form(None),
        PatientId: Optional[str] = Form(None),
        Diagnosis: Optional[str] = Form(None),
        Medicines: Optional[str] = Form(None, description="JSON array string of medicines e.g. [{'Name': 'Paracetamol'}]"),
        NextFollowUpDate: Optional[date] = Form(None),
        BP: Optional[str] = Form(None),
        Height: Optional[str] = Form(None),
        Weight: Optional[str] = Form(None),
        Note: Optional[str] = Form(None),
        PrescriptionFile: Optional[UploadFile] = File(None),
    ):
        content_type = request.headers.get("content-type", "")
        data = {}

        if "application/json" in content_type:
            try:
                data = await request.json()
            except Exception:
                data = {}
        else:
            if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
                try:
                    form = await request.form()
                    for key, val in form.items():
                        if hasattr(val, "filename"):
                            if val.filename:
                                file_path = self.prescription_svc.save_file_bytes(val)
                                data["PrescriptionFile"] = file_path
                        else:
                            if val is not None and str(val).strip() != "":
                                if key == "Medicines" and isinstance(val, str):
                                    try:
                                        data[key] = json.loads(val)
                                    except Exception:
                                        data[key] = []
                                else:
                                    data[key] = val
                except Exception as e:
                    print("Error parsing form data:", e)

            form_fields = {
                "DoctorId": DoctorId,
                "PatientId": PatientId,
                "Diagnosis": Diagnosis,
                "NextFollowUpDate": NextFollowUpDate,
                "BP": BP,
                "Height": Height,
                "Weight": Weight,
                "Note": Note
            }
            for k, v in form_fields.items():
                if v is not None and k not in data:
                    data[k] = v

            if "Medicines" not in data and Medicines:
                try:
                    data["Medicines"] = json.loads(Medicines)
                except Exception:
                    data["Medicines"] = []

            if "PrescriptionFile" not in data and hasattr(PrescriptionFile, "filename") and PrescriptionFile.filename:
                file_path = self.prescription_svc.save_file_bytes(PrescriptionFile)
                data["PrescriptionFile"] = file_path

        try:
            data_obj = schemas.PrescriptionCreate(**data)
            created = self.prescription_svc.create_prescription(data_obj)
            return self.prescription_svc.to_out_schema(created)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def list_prescriptions(
        self,
        doctor_id: Optional[str] = Query(None, description="Filter by Doctor ID"),
        patient_id: Optional[str] = Query(None, description="Filter by Patient ID"),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=500)
    ):
        items = self.prescription_svc.list_prescriptions(
            doctor_id=doctor_id,
            patient_id=patient_id,
            skip=skip,
            limit=limit
        )
        return [self.prescription_svc.to_out_schema(item) for item in items]

    def get_prescription(self, prescription_id: str):
        prescription = self.prescription_svc.get_prescription(prescription_id)
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return self.prescription_svc.to_out_schema(prescription)

    async def update_prescription(
        self,
        prescription_id: str,
        request: Request,
        DoctorId: Optional[str] = Form(None),
        PatientId: Optional[str] = Form(None),
        Diagnosis: Optional[str] = Form(None),
        Medicines: Optional[str] = Form(None, description="JSON array string of medicines"),
        NextFollowUpDate: Optional[date] = Form(None),
        BP: Optional[str] = Form(None),
        Height: Optional[str] = Form(None),
        Weight: Optional[str] = Form(None),
        Note: Optional[str] = Form(None),
        PrescriptionFile: Optional[UploadFile] = File(None),
    ):
        content_type = request.headers.get("content-type", "")
        data = {}

        if "application/json" in content_type:
            try:
                data = await request.json()
            except Exception:
                data = {}
        else:
            if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
                try:
                    form = await request.form()
                    for key, val in form.items():
                        if hasattr(val, "filename"):
                            if val.filename:
                                file_path = self.prescription_svc.save_file_bytes(val)
                                data["PrescriptionFile"] = file_path
                        else:
                            if val is not None and str(val).strip() != "":
                                if key == "Medicines" and isinstance(val, str):
                                    try:
                                        data[key] = json.loads(val)
                                    except Exception:
                                        pass
                                else:
                                    data[key] = val
                except Exception as e:
                    print("Error parsing form data:", e)

            form_fields = {
                "DoctorId": DoctorId,
                "PatientId": PatientId,
                "Diagnosis": Diagnosis,
                "NextFollowUpDate": NextFollowUpDate,
                "BP": BP,
                "Height": Height,
                "Weight": Weight,
                "Note": Note
            }
            for k, v in form_fields.items():
                if v is not None and k not in data:
                    data[k] = v

            if "Medicines" not in data and Medicines:
                try:
                    data["Medicines"] = json.loads(Medicines)
                except Exception:
                    pass

            if "PrescriptionFile" not in data and hasattr(PrescriptionFile, "filename") and PrescriptionFile.filename:
                file_path = self.prescription_svc.save_file_bytes(PrescriptionFile)
                data["PrescriptionFile"] = file_path

        try:
            data_obj = schemas.PrescriptionUpdate(**data)
            updated = self.prescription_svc.update_prescription(prescription_id, data_obj)
            if not updated:
                raise HTTPException(status_code=404, detail="Prescription not found")
            return self.prescription_svc.to_out_schema(updated)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def delete_prescription(self, prescription_id: str):
        success = self.prescription_svc.delete_prescription(prescription_id)
        if not success:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return {"success": True, "message": "Prescription deleted successfully"}

router = PrescriptionRouter().router
