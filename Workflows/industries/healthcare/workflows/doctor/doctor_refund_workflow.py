from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from industries.healthcare.services.appointment_service import AppointmentService
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
from backend_app.core.database import db_session
from backend_app.modules.doctor_appointment.models.appointment import Appointment
from datetime import datetime

class DoctorViewRefundsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor_id = session.WorkflowData.get("doctor_id")
        
        # Get pending refunds
        db = db_session()
        pending_refunds = db.query(Appointment).filter(
            Appointment.DoctorId == doctor_id,
            Appointment.RefundStatus == "Pending"
        ).all()
        
        if not pending_refunds:
            db.close()
            return WorkflowResult.finished(reply=Reply("text", "You have no pending refunds to process!"))
            
        rows = []
        for appt in pending_refunds[:10]:
            pat_name = appt.Name or "Unknown"
            date_str = appt.Date.strftime('%b %d') if appt.Date else 'N/A'
            
            # Find the paid amount
            amount = 0
            for payment in appt.payments:
                if payment.Status == "Paid":
                    amount = payment.Payment
                    break
                    
            rows.append({
                "id": f"REFUND_{appt.Id}",
                "title": f"₹{amount} - {pat_name}",
                "description": f"Appt on {date_str}"
            })
            
        db.close()
            
        sections = [{"title": "Pending Refunds", "rows": rows}]
        
        return WorkflowResult.waiting(
            reply=Reply(
                message_type="list", 
                text=f"You have {len(pending_refunds)} pending refunds. Select one to process:", 
                sections=sections
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId and message.InteractiveId.startswith("REFUND_"):
            appt_id = message.InteractiveId.replace("REFUND_", "")
            session.WorkflowData["refund_appt_id"] = appt_id
            return WorkflowResult.completed()

        return WorkflowResult.waiting(reply=Reply("text", "Please select a refund from the list menu."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()


class DoctorProcessRefundWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        appt_id = session.WorkflowData.get("refund_appt_id")
        
        db = db_session()
        appointment = db.query(Appointment).filter(Appointment.Id == appt_id).first()
        if not appointment or appointment.RefundStatus != "Pending":
            db.close()
            return WorkflowResult.finished(reply=Reply("text", "This refund has already been processed or is invalid."))
            
        amount = 0
        for payment in appointment.payments:
            if payment.Status == "Paid":
                amount = payment.Payment
                break
                
        phone = appointment.patient.PhoneNumber if appointment.patient else "Unknown"
        pat_name = appointment.Name or "Unknown"
        db.close()
        
        text = (
            f"💰 *Refund Details*\n\n"
            f"Patient: {pat_name}\n"
            f"Phone: +{phone}\n"
            f"Amount to refund: ₹{amount}\n\n"
            f"Please manually send ₹{amount} to the patient's phone number or UPI ID using your preferred UPI app. "
            f"Once you have successfully transferred the money, click 'Refund Sent' below."
        )
        
        reply = Reply(
            message_type="buttons",
            text=text,
            options=[
                {"id": "CONFIRM_REFUND_SENT", "title": "Refund Sent"},
                {"id": "CANCEL_REFUND_ACTION", "title": "Do it later"}
            ]
        )
        return WorkflowResult.waiting(reply=reply)

    def Process(self, session: ConversationSession, message: Message):
        if message.InteractiveId == "CONFIRM_REFUND_SENT":
            appt_id = session.WorkflowData.get("refund_appt_id")
            
            db = db_session()
            appointment = db.query(Appointment).filter(Appointment.Id == appt_id).first()
            
            if appointment:
                appointment.RefundStatus = "Completed"
                appointment.RefundedAt = datetime.utcnow()
                db.commit()
                
                # Notify Patient
                if appointment.patient and appointment.patient.PhoneNumber:
                    doc_name = appointment.doctor.FullName if appointment.doctor else "your doctor"
                    date_str = appointment.Date.strftime('%b %d') if appointment.Date else 'N/A'
                    
                    amount = 0
                    for payment in appointment.payments:
                        if payment.Status == "Paid":
                            amount = payment.Payment
                            break
                            
                    patient_phone = appointment.patient.PhoneNumber
                    db.close()
                    
                    patient_msg = (
                        f"✅ *Refund Processed*\n\n"
                        f"Dr. {doc_name} has successfully processed your refund of ₹{amount} for your cancelled appointment on {date_str}.\n\n"
                        f"Please check your UPI app or bank statement. It may take some time to reflect."
                    )
                    WhatsAppService.send_text(patient_phone, patient_msg)
                else:
                    db.close()
                    
                return WorkflowResult.completed(reply=Reply("text", "✅ Refund marked as completed! The patient has been notified."))
            else:
                db.close()
                
        elif message.InteractiveId == "CANCEL_REFUND_ACTION":
            return WorkflowResult.finished(reply=Reply("text", "Refund processing aborted for now."))

        return WorkflowResult.waiting(reply=Reply("text", "Please select an option using the buttons above."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
