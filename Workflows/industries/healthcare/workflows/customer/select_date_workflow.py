from datetime import datetime, date, timedelta
import time
from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import (
    ConversationSession,
    Message,
    WorkflowResult,
    Reply,
)
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
from backend_app.modules.doctor_appointment.services.doctor_service import DoctorService
from core.services.whatsapp_service import whatsapp as WhatsAppService
from backend_app.core.database import db_session

class SelectDateWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        from core.Sequence import SequenceFactory
        sections = [{"title": session.translate("section_upcoming_dates"), "rows": []}]
        doctor_id = session.WorkflowData.get("DoctorId")
        if not doctor_id and session.state.BusinessPhoneNumber:
            doctors = DoctorService().list_doctors_by_business_phone(
                session.state.BusinessPhoneNumber
            )
            if doctors:
                doctor_id = str(doctors[0].Id)
                session.WorkflowData["DoctorId"] = doctor_id
        doctor = DoctorService().get_doctor(doctor_id)

        biz_phone = session.state.BusinessPhoneNumber if session.state else None
        default_hours = SequenceFactory.get_setting(db_session, biz_phone, "business_hours")

        days_added = 0
        current_date = date.today()

        while days_added < 9 and (current_date - date.today()).days < 30:
            day_of_week = current_date.weekday()
            days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]
            day_name = days[day_of_week]
            day_schedule_str = getattr(doctor, day_name) if doctor else None

            if not day_schedule_str:
                day_schedule_str = default_hours

            if day_schedule_str:
                sections[0]["rows"].append(
                    {
                        "id": f"DATE_{current_date.strftime('%Y-%m-%d')}",
                        "title": current_date.strftime("%b %d, %Y")[:24],
                        "description": current_date.strftime("%A")[:72],
                    }
                )
                days_added += 1

            current_date += timedelta(days=1)

        sections.append(
            {
                "title": session.translate("section_options"),
                "rows": [
                    {
                        "id": "CANCEL_FLOW",
                        "title": session.translate("btn_cancel"),
                        "description": session.translate("btn_cancel_desc"),
                    }
                ],
            }
        )

        sections = [s for s in sections if s.get("rows") and len(s["rows"]) > 0]

        return WorkflowResult.waiting(
            reply=Reply(
                "list", session.translate("prompt_select_date"), sections=sections
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        dates = session.WorkflowData.get("dates", [])
        date_str = ""

        if message.InteractiveId and message.InteractiveId.startswith("DATE_"):
            date_str = message.InteractiveId.split("_")[1]
        elif message.Text:
            date_str = message.Text.strip()

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            if target_date < datetime.now().date():
                WhatsAppService.send_text(
                    session.PhoneNumber, session.translate("error_date_past")
                )
                time.sleep(1.5)
                return self.Initialize(session)

            doctor_id = session.WorkflowData.get("DoctorId")
            slots_dt = AppointmentService().get_available_slots(
                target_date=target_date, doctor_id=doctor_id
            )
            if not slots_dt:
                WhatsAppService.send_text(
                    session.PhoneNumber,
                    session.translate("error_no_slots_date", target_date=target_date),
                )
                time.sleep(1.5)
                return self.Initialize(session)

            session.WorkflowData["date"] = target_date.strftime("%Y-%m-%d")
            session.WorkflowData["slots"] = [
                s["SlotTime"].strftime("%H:%M") for s in slots_dt
            ]
            session.WorkflowData["page"] = 0

            return WorkflowResult.completed()

        except ValueError:
            WhatsAppService.send_text(
                session.PhoneNumber, session.translate("error_invalid_date_format")
            )
            time.sleep(1.5)
            return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()

