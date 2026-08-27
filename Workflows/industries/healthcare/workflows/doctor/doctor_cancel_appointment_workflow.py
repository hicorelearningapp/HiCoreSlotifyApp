from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
from core.services.whatsapp_service import whatsapp as WhatsAppService
import asyncio

class DoctorSelectAppointmentsToCancelWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor_id = session.WorkflowData.get("doctor_id")
        appointments = AppointmentService().get_upcoming_doctor_appointments(doctor_id, limit=15)
        
        if not appointments:
            return WorkflowResult.finished(reply=Reply("text", "You don't have any upcoming appointments to cancel."))
        
        rows = []
        for appt in appointments[:10]:
            pat_name = appt.patient.Name if appt.patient else "Unknown"
            date_str = appt.Date.strftime('%b %d, %Y') if appt.Date else 'N/A'
            time_str = appt.SlotTime.strftime('%I:%M %p') if appt.SlotTime else 'N/A'
            
            rows.append({
                "id": f"DOC_CANCEL_{appt.Id}",
                "title": f"{pat_name}",
                "description": f"{date_str} at {time_str}"
            })
            
        sections = [{"title": "Select Appointment", "rows": rows}]
        
        return WorkflowResult.waiting(
            reply=Reply(
                message_type="list", 
                text="Please select the appointment you wish to cancel:", 
                sections=sections
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId and message.InteractiveId.startswith("DOC_CANCEL_"):
            appt_id = message.InteractiveId.replace("DOC_CANCEL_", "")
            session.WorkflowData["target_cancel_ids"] = [appt_id]
            return WorkflowResult.completed()

        return WorkflowResult.waiting(reply=Reply("text", "Please select an appointment from the list menu."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()

class DoctorCancelAppointmentsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        target_cancel_ids = session.WorkflowData.get("target_cancel_ids", [])
        if not target_cancel_ids:
            return WorkflowResult.finished(reply=Reply("text", "No appointments selected. Cancellation aborted."))
            
        appt_count = len(target_cancel_ids)
        
        reply = Reply(
            message_type="buttons",
            text=f"⚠️ Are you sure you want to cancel {appt_count} appointment(s)?\n\n*Note:* The patient(s) will be notified automatically via WhatsApp.",
            options=[
                {"id": "CONFIRM_YES", "title": f"Yes, Cancel {appt_count}"},
                {"id": "CONFIRM_NO", "title": "No, Keep Them"}
            ]
        )
        return WorkflowResult.waiting(reply=reply)

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId == "CONFIRM_YES":
            return WorkflowResult.completed()
        elif message.InteractiveId == "CONFIRM_NO":
            return WorkflowResult.finished(reply=Reply("text", "Cancellation aborted. The appointments remain on your schedule."))

        return WorkflowResult.waiting(reply=Reply("text", "Please select an option using the buttons above."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()

class DoctorCancellationConfirmationWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        target_cancel_ids = session.WorkflowData.get("target_cancel_ids", [])
        
        cancelled_count = 0
        for appt_id in target_cancel_ids:
            appointment = AppointmentService().get_appointment_by_id(appt_id)
            if appointment and appointment.Status != "Cancelled":
                AppointmentService().cancel_appointment(appt_id)
                cancelled_count += 1
                
                # Notify Patient
                if appointment.patient and appointment.patient.PhoneNumber:
                    doc_name = appointment.doctor.FullName if appointment.doctor else "your doctor"
                    time_str = f"{appointment.SlotTime.strftime('%I:%M %p')} on {appointment.Date.strftime('%b %d')}"
                    
                    has_paid = any(p.Status == "Paid" for p in appointment.payments)
                    refund_text = "\n\nA refund for your payment is currently being processed by the clinic." if has_paid else ""
                    
                    patient_msg = (
                        f"🚨 *Appointment Update*\n\n"
                        f"We apologize, but Dr. {doc_name} had to cancel your appointment scheduled for {time_str} due to an unforeseen emergency.{refund_text}\n\n"
                        f"Please reply with 'hi' to book a new time slot."
                    )
                    WhatsAppService.send_text(appointment.patient.PhoneNumber, patient_msg)
                    
        # Since this is the final step, returning completed will end the flow.
        return WorkflowResult.completed(reply=Reply("text", f"✅ Successfully cancelled {cancelled_count} appointment(s). The patient(s) have been notified."))

    def Process(self, session: ConversationSession, message: Message):
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
