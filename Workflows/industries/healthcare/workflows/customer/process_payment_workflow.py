from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client

UPI_ID = "hicore@upi"
MERCHANT_NAME = "HiCore%20System"

class ProcessPaymentWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor = api_client.get_doctor(session.WorkflowData.get("DoctorId"))
        price = doctor.ClinicConsultationFee if doctor and doctor.ClinicConsultationFee else 0.0
        session.WorkflowData["Price"] = price
        session.WorkflowData["UpiId"] = doctor.UpiId if doctor and doctor.UpiId else UPI_ID
        
        merchant_name = doctor.FullName if doctor and doctor.FullName else "HiCore System"
        session.WorkflowData["MerchantName"] = merchant_name.replace(" ", "%20")
        
        text = f"The consultation fee is ₹{price}.\n\nHow would you like to pay?"
        
        return WorkflowResult.waiting(reply=Reply("buttons", text, options=[
            {"id": "PAY_ONLINE", "title": "Pay Online"},
            {"id": "PAY_AT_CLINIC", "title": "Pay at Clinic"},
            {"id": "CANCEL_PAYMENT", "title": "Cancel"}
        ]))

    def Process(self, session: ConversationSession, message: Message):
        if session.WorkflowData.get("AwaitingPayment"):
            text = message.Text.strip().lower() if message.Text else ""
            if text == "paid":
                session.WorkflowData["payment_status"] = "Paid"
                return WorkflowResult.completed()
            elif text == "cancel":
                session.WorkflowData["AwaitingPayment"] = False
                return WorkflowResult.completed(reply=Reply("text", "Payment cancelled. Booking aborted."))
            else:
                return WorkflowResult.waiting(reply=Reply("text", "Please type *Paid* once you have completed the transaction, or type 'Cancel' to abort."))

        if message.InteractiveId == "CANCEL_PAYMENT":
            return WorkflowResult.completed(reply=Reply("text", "Booking process cancelled."))
            
        if message.InteractiveId == "PAY_AT_CLINIC":
            session.WorkflowData["payment_status"] = "Pending"
            return WorkflowResult.completed()
            
        if message.InteractiveId == "PAY_ONLINE":
            price = session.WorkflowData.get('Price', 0.0)
            upi_id = session.WorkflowData.get('UpiId', UPI_ID)
            merchant_name = session.WorkflowData.get('MerchantName', MERCHANT_NAME)
            invoice = f"Booking%20{session.PhoneNumber}"
            payment_link = f"upi://pay?pa={upi_id}&pn={merchant_name}&am={price:.2f}&cu=INR&tn={invoice}"
            
            text = f"Please complete your payment of ₹{price} using the UPI link below:\n\n{payment_link}\n\nOnce paid, please type *Paid* to continue."
            
            session.WorkflowData["AwaitingPayment"] = True
            return WorkflowResult.waiting(reply=Reply("text", text))

        return WorkflowResult.waiting()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
