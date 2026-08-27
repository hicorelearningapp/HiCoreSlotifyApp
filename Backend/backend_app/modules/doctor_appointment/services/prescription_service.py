import json
import os
import uuid
import shutil
from typing import List, Optional
from backend_app.core.database import db_session
import backend_app.modules.doctor_appointment.models as models
import backend_app.modules.doctor_appointment.schemas as schemas

class PrescriptionService:
    def __init__(self):
        self.db = db_session

    def save_file_bytes(self, file) -> str:
        images_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "images", "prescriptions")
        os.makedirs(images_dir, exist_ok=True)

        ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(images_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return f"/images/prescriptions/{filename}"

    def create_prescription(self, data: schemas.PrescriptionCreate) -> models.Prescription:
        medicines_json = json.dumps([m.model_dump() for m in data.Medicines]) if data.Medicines else "[]"
        
        prescription_dict = data.model_dump(exclude={"Medicines"})
        prescription_dict["Medicines"] = medicines_json
        
        new_prescription = models.Prescription(**prescription_dict)
        self.db.add(new_prescription)
        self.db.commit()
        self.db.refresh(new_prescription)
        return new_prescription

    def get_prescription(self, prescription_id: str) -> Optional[models.Prescription]:
        return self.db.query(models.Prescription).filter(models.Prescription.Id == prescription_id).first()

    def list_prescriptions(
        self,
        doctor_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.Prescription]:
        query = self.db.query(models.Prescription)
        if doctor_id:
            query = query.filter(models.Prescription.DoctorId == doctor_id)
        if patient_id:
            query = query.filter(models.Prescription.Id == patient_id)
        return query.order_by(models.Prescription.CreatedAt.desc()).offset(skip).limit(limit).all()

    def _delete_file(self, file_path: Optional[str]):
        if not file_path or file_path.startswith(("http://", "https://")):
            return
        clean_path = file_path.lstrip("/\\")
        base_dir = os.path.dirname(os.path.dirname(__file__))
        full_path = os.path.join(base_dir, clean_path)
        if os.path.isfile(full_path):
            try:
                os.remove(full_path)
            except OSError:
                pass

    def update_prescription(self, prescription_id: str, data: schemas.PrescriptionUpdate) -> Optional[models.Prescription]:
        prescription = self.get_prescription(prescription_id)
        if not prescription:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        if "Medicines" in update_dict and update_dict["Medicines"] is not None:
            update_dict["Medicines"] = json.dumps([m.model_dump() for m in (data.Medicines or [])])

        if "PrescriptionFile" in update_dict and update_dict["PrescriptionFile"] != prescription.PrescriptionFile:
            self._delete_file(prescription.PrescriptionFile)

        for key, value in update_dict.items():
            setattr(prescription, key, value)

        self.db.commit()
        self.db.refresh(prescription)
        return prescription

    def delete_prescription(self, prescription_id: str) -> bool:
        prescription = self.get_prescription(prescription_id)
        if not prescription:
            return False

        if prescription.PrescriptionFile:
            self._delete_file(prescription.PrescriptionFile)

        self.db.delete(prescription)
        self.db.commit()
        return True

    def save_prescription_file(self, prescription_id: str, file) -> Optional[models.Prescription]:
        prescription = self.get_prescription(prescription_id)
        if not prescription:
            return None

        import os
        import uuid
        import shutil

        images_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "images", "prescriptions")
        os.makedirs(images_dir, exist_ok=True)

        ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(images_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        prescription.PrescriptionFile = f"/images/prescriptions/{filename}"
        self.db.commit()
        self.db.refresh(prescription)
        return prescription

    def to_out_schema(self, prescription: models.Prescription) -> schemas.PrescriptionOut:
        medicines_list = []
        if prescription.Medicines:
            try:
                raw_list = json.loads(prescription.Medicines)
                medicines_list = [schemas.MedicineItem(**item) for item in raw_list]
            except Exception:
                medicines_list = []

        return schemas.PrescriptionOut(
            Id=prescription.Id,
            DoctorId=prescription.DoctorId,
            PatientId=prescription.PatientId,
            Diagnosis=prescription.Diagnosis,
            Medicines=medicines_list,
            NextFollowUpDate=prescription.NextFollowUpDate,
            BP=prescription.BP,
            Height=prescription.Height,
            Weight=prescription.Weight,
            Note=prescription.Note,
            PrescriptionFile=prescription.PrescriptionFile,
            CreatedAt=prescription.CreatedAt,
            UpdatedAt=prescription.UpdatedAt
        )
