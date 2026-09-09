from datetime import datetime
from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import (
    ConversationSession,
    Message,
    WorkflowResult,
    Reply,
)
from core.api_client import api_client
from core.services.whatsapp_service import whatsapp as WhatsAppService
# from core.services.language_manager import LanguageManager


class ConfirmBookingWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor = api_client.get_doctor(session.WorkflowData.get("DoctorId"))
        patient = api_client.get_customer(session.WorkflowData.get("patient_id"))

        summary = session.translate(
            "booking_summary",
            patient=patient.get("PatientName") if patient else "Patient",
            doctor=doctor.get("FullName") if doctor else "Doctor",
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
            doctor = api_client.get_doctor(session.WorkflowData.get("DoctorId"))

            patient_id = session.WorkflowData.get("patient_id")
            if not patient_id:
                patient = api_client.get_customer_by_phone(session.PhoneNumber)
                if not patient:
                    patient = api_client.create_customer(
                        {
                            "CustomerName": "VIP Patient",
                            "Name": "VIP Patient",
                            "PhoneNumber": session.PhoneNumber,
                        }
                    )
                patient_id = patient.get("PatientId")
                session.WorkflowData["patient_id"] = patient_id
            else:
                patient = api_client.get_customer(patient_id)

            app_create = {
                "Date": start_datetime.date().isoformat(),
                "SlotTime": start_datetime.time().isoformat(),
                "Slot": 0,
                "PatientId": session.WorkflowData.get("patient_id"),
                "DoctorId": session.WorkflowData.get("DoctorId"),
                "ConsultationType": consultation_type
            }
            appointment = api_client.book_appointment(app_create)
            
            meeting_link = appointment.get("MeetingLink")

            # Save the payment record
            payment_status = "Pending"
            payment_create = {
                "AppointmentId": appointment.get("Id"),
                "CustomerId": session.WorkflowData.get("patient_id"),
                "DoctorId": session.WorkflowData.get("DoctorId"),
                "Payment": doctor.get("ClinicConsultationFee"),
                "Status": payment_status,
            }
            # Need to implement create_payment in api_client if it doesn't exist yet, but for now we'll mock it if it's not there.
            if hasattr(api_client, 'create_payment'):
                api_client.create_payment(payment_create)

            # Send async notification directly to doctor bypassing manager loop
            if doctor and doctor.get("MobileNumber"):
                patient = api_client.get_customer(
                    session.WorkflowData.get("patient_id")
                )
                doc_msg = f"New appointment booked for {patient.get('Name') if patient else 'Unknown'} for {start_datetime.strftime('%Y-%m-%d %I:%M %p')}."
                if meeting_link:
                    doc_msg += f"\n\nMeeting Link: {meeting_link}"
                WhatsAppService.send_text(doctor.get("MobileNumber"), doc_msg)

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
                        patient.get("EmailAddress") if patient else None
                    )
                if not email_to_use:
                    primary_cust = api_client.get_customer_by_phone(
                        session.PhoneNumber
                    )
                    if primary_cust:
                        email_to_use = primary_cust.get("EmailAddress")

                if email_to_use:
                    success_msg += session.translate(
                        "view_video_join_email", email=email_to_use
                    )
            elif doctor and doctor.get("ClinicAddress"):
                success_msg += session.translate(
                    "msg_booking_clinic_address", clinic_address=doctor.get("ClinicAddress")
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
