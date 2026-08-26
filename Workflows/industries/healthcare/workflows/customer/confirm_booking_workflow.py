from datetime import datetime
from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import (
    ConversationSession,
    Message,
    WorkflowResult,
    Reply,
)
from industries.healthcare.services.appointment_service import AppointmentService
from industries.healthcare.services.doctor_service import DoctorService
from core.services.customer_service import CustomerService
from industries.healthcare.services.payment_service import PaymentService
import core.schemas as schemas
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
from core.services.language_manager import LanguageManager


class ConfirmBookingWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor = DoctorService().get_doctor(session.WorkflowData.get("DoctorId"))
        patient = CustomerService().get_customer(session.WorkflowData.get("patient_id"))

        summary = session.translate(
            "booking_summary",
            patient=patient.Name if patient else "Patient",
            doctor=doctor.FullName if doctor else "Doctor",
            type=session.WorkflowData.get("ConsultationType", "In-Person"),
            date=session.WorkflowData.get("date"),
            time=session.WorkflowData.get("time"),
        )

        return WorkflowResult.waiting(
            reply=Reply(
                "buttons",
                summary,
                options=[
                    {"id": "CONFIRM_YES", "title": session.translate("btn_yes_book")},
                    {"id": "CONFIRM_NO", "title": session.translate("btn_no_cancel")},
                ],
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId == "CONFIRM_NO":
            return WorkflowResult.completed(
                reply=Reply("text", session.translate("msg_booking_cancelled"))
            )

        if message.InteractiveId == "CONFIRM_YES":
            return self._finalize_booking(session)

        return WorkflowResult.waiting()

    def _finalize_booking(self, session: ConversationSession):
        try:
            target_date = datetime.strptime(
                session.WorkflowData.get("date"), "%Y-%m-%d"
            ).date()
            target_time = datetime.strptime(
                session.WorkflowData.get("time"), "%H:%M"
            ).time()
            start_datetime = datetime.combine(target_date, target_time)
            consultation_type = session.WorkflowData.get(
                "ConsultationType", "In-Person"
            )
            meeting_link = None
            doctor = DoctorService().get_doctor(session.WorkflowData.get("DoctorId"))

            patient_id = session.WorkflowData.get("patient_id")
            if not patient_id:
                patient = CustomerService().get_customer_by_phone(session.PhoneNumber)
                if not patient:
                    patient = CustomerService().create_customer(
                        schemas.CustomerCreate(
                            CustomerName="VIP Patient",
                            Name="VIP Patient",
                            PhoneNumber=session.PhoneNumber,
                        )
                    )
                patient_id = patient.Id
                session.WorkflowData["patient_id"] = patient_id
            else:
                patient = CustomerService().get_customer(patient_id)

            if consultation_type == "Video" and doctor:
                from backend_app.modules.doctor_appointment.services.google_oauth_service import GoogleOAuthService

                try:
                    import uuid

                    req_id = str(uuid.uuid4())
                    patient_name_str = patient.Name if patient else "Patient"
                    meeting_link = GoogleOAuthService().create_meet_event(
                        appointment_id=req_id,
                        patient_name=patient_name_str,
                        start_dt=start_datetime,
                        duration_mins=doctor.ConsultationDuration
                        if getattr(doctor, "ConsultationDuration", None)
                        else 30,
                        doctor_email=doctor.EmailAddress if doctor else None,
                        patient_email=patient.EmailAddress if patient else None,
                    )
                    if not meeting_link:
                        raise Exception("Failed to generate Google Meet link.")
                except Exception as e:
                    print(f"Failed to generate Meet link: {e}")
                    raise Exception(
                        f"Could not connect to Google Calendar to generate a meeting link. Error: {e}"
                    )

            app_create = schemas.AppointmentCreate(
                Date=start_datetime.date(),
                SlotTime=start_datetime.time(),
                Slot=0,
                Id=session.WorkflowData.get("patient_id"),
                DoctorId=session.WorkflowData.get("DoctorId"),
                ConsultationType=consultation_type,
                MeetingLink=meeting_link,
            )
            appointment = AppointmentService().book_appointment(app_create)

            # Save the payment record
            payment_status = "Pending"
            payment_create = schemas.PaymentCreate(
                AppointmentId=appointment.Id,
                AccountId=session.WorkflowData.get("patient_id"),
                DoctorId=session.WorkflowData.get("DoctorId"),
                Payment=doctor.ClinicConsultationFee,
                Status=payment_status,
            )
            PaymentService().create_payment(payment_create)

            # Send async notification directly to doctor bypassing manager loop
            if doctor and doctor.MobileNumber:
                patient = CustomerService().get_customer(
                    session.WorkflowData.get("patient_id")
                )
                doc_msg = f"New appointment booked for {patient.Name if patient else 'Unknown'} for {start_datetime.strftime('%Y-%m-%d %I:%M %p')}."
                if meeting_link:
                    doc_msg += f"\n\nMeeting Link: {meeting_link}"
                WhatsAppService.send_text(doctor.MobileNumber, doc_msg)

            success_msg = session.translate(
                "msg_booking_success",
                start_datetime=start_datetime.strftime("%Y-%m-%d %I:%M %p"),
            )
            if meeting_link:
                success_msg += session.translate(
                    "msg_booking_meeting_link", meeting_link=meeting_link
                )

                email_to_use = session.WorkflowData.get("current_email")
                if not email_to_use:
                    email_to_use = (
                        getattr(patient, "EmailAddress", None) if patient else None
                    )
                if not email_to_use:
                    primary_cust = CustomerService().get_customer_by_phone(
                        session.PhoneNumber
                    )
                    if primary_cust:
                        email_to_use = getattr(primary_cust, "EmailAddress", None)

                if email_to_use:
                    success_msg += session.translate(
                        "view_video_join_email", email=email_to_use
                    )
            elif doctor and doctor.ClinicAddress:
                success_msg += session.translate(
                    "msg_booking_clinic_address", clinic_address=doctor.ClinicAddress
                )

            success_msg += session.translate("msg_booking_thanks")

            return WorkflowResult.completed(reply=Reply("text", success_msg))

        except Exception as e:
            error_msg = getattr(e, "detail", str(e))
            return WorkflowResult.completed(
                reply=Reply(
                    "text", session.translate("msg_booking_failed", error_msg=error_msg)
                )
            )

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
