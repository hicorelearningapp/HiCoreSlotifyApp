from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client
from core.services.whatsapp_service import whatsapp as WhatsAppService
from datetime import datetime

class DoctorViewRefundsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor_id = session.WorkflowData.get("doctor_id")
        
        # Get pending refunds
        pending_refunds = api_client.get_pending_refunds(doctor_id)
        
        if not pending_refunds:
            return WorkflowResult.finished(reply=Reply("text", "You have no pending refunds to process!"))
            
        rows = []
        for appt in pending_refunds[:10]:
            pat_name = appt.get("Name") or "Unknown"
            
            date_str = "N/A"
            if appt.get("Date"):
                try:
                    date_obj = datetime.fromisoformat(appt.get("Date"))
                    date_str = date_obj.strftime('%b %d')
                except:
                    pass
            
            # Find the paid amount
            amount = 0
            for payment in appt.get("payments", []):
                if payment.get("Status") == "Paid":
                    amount = payment.get("Payment", 0)
                    break
                    
            rows.append({
                "id": f"REFUND_{appt.get('Id')}",
                "title": f"₹{amount} - {pat_name}",
                "description": f"Appt on {date_str}"
            })
            
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
        
        appointment = api_client.get_appointment(appt_id)
        if not appointment or appointment.get("RefundStatus") != "Pending":
            return WorkflowResult.finished(reply=Reply("text", "This refund has already been processed or is invalid."))
            
        amount = 0
        for payment in appointment.get("payments", []):
            if payment.get("Status") == "Paid":
                amount = payment.get("Payment", 0)
                break
                
        patient = appointment.get("patient", {})
        phone = patient.get("PhoneNumber") if patient else "Unknown"
        pat_name = appointment.get("Name") or "Unknown"
        
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
            
            # Process refund via API
            try:
                appointment = api_client.process_refund(appt_id)
                
                if appointment:
                    # Notify Patient
                    patient = appointment.get("patient", {})
                    if patient and patient.get("PhoneNumber"):
                        doctor = appointment.get("doctor", {})
                        doc_name = doctor.get("FullName") if doctor else "your doctor"
                        
                        date_str = "N/A"
                        if appointment.get("Date"):
                            try:
                                date_obj = datetime.fromisoformat(appointment.get("Date"))
                                date_str = date_obj.strftime('%b %d')
                            except:
                                pass
                        
                        amount = 0
                        for payment in appointment.get("payments", []):
                            if payment.get("Status") == "Paid":
                                amount = payment.get("Payment", 0)
                                break
                                
                        patient_phone = patient.get("PhoneNumber")
                        
                        patient_msg = (
                            f"✅ *Refund Processed*\n\n"
                            f"Dr. {doc_name} has successfully processed your refund of ₹{amount} for your cancelled appointment on {date_str}.\n\n"
                            f"Please check your UPI app or bank statement. It may take some time to reflect."
                        )
                        WhatsAppService.send_text(patient_phone, patient_msg)
                        
                    return WorkflowResult.completed(reply=Reply("text", "✅ Refund marked as completed! The patient has been notified."))
                else:
                    return WorkflowResult.finished(reply=Reply("text", "Error processing refund."))
            except Exception as e:
                return WorkflowResult.finished(reply=Reply("text", f"Error processing refund: {str(e)}"))
                
        elif message.InteractiveId == "CANCEL_REFUND_ACTION":
            return WorkflowResult.finished(reply=Reply("text", "Refund processing aborted for now."))

        return WorkflowResult.waiting(reply=Reply("text", "Please select an option using the buttons above."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
