from core.workflow_factory.workflow_factory_base import Workflow

# Customer workflows
from industries.healthcare.workflows.customer.main_menu_workflow import MainMenuWorkflow
from industries.healthcare.workflows.customer.select_patient_workflow import SelectPatientWorkflow
from industries.healthcare.workflows.customer.select_doctor_workflow import SelectDoctorWorkflow
from industries.healthcare.workflows.customer.select_consultation_workflow import SelectConsultationWorkflow
from industries.healthcare.workflows.customer.select_date_workflow import SelectDateWorkflow
from industries.healthcare.workflows.customer.select_time_slot_workflow import SelectTimeSlotWorkflow
from industries.healthcare.workflows.customer.process_payment_workflow import ProcessPaymentWorkflow
from industries.healthcare.workflows.customer.confirm_booking_workflow import ConfirmBookingWorkflow
from industries.healthcare.workflows.customer.view_appointments_workflow import ViewAppointmentsWorkflow
from industries.healthcare.workflows.customer.select_appointment_to_cancel_workflow import SelectAppointmentToCancelWorkflow
from industries.healthcare.workflows.customer.confirm_cancellation_workflow import ConfirmCancellationWorkflow
from industries.healthcare.workflows.customer.register_patient_workflow import RegisterPatientWorkflow
from industries.healthcare.workflows.customer.collect_email_workflow import CollectEmailWorkflow

# Doctor workflows
from industries.healthcare.workflows.doctor.doctor_menu_workflow import DoctorMenuWorkflow
from industries.healthcare.workflows.doctor.doctor_view_schedule_workflow import DoctorViewScheduleWorkflow
from industries.healthcare.workflows.doctor.doctor_patient_details_workflow import DoctorPatientDetailsWorkflow
from industries.healthcare.workflows.doctor.doctor_cancel_appointment_workflow import DoctorSelectAppointmentsToCancelWorkflow, DoctorCancelAppointmentsWorkflow, DoctorCancellationConfirmationWorkflow
from industries.healthcare.workflows.doctor.doctor_refund_workflow import DoctorViewRefundsWorkflow, DoctorProcessRefundWorkflow

# Admin workflows
from industries.healthcare.workflows.admin.admin_menu_workflow import AdminMenuWorkflow

# Common workflows
from industries.healthcare.workflows.common.GreetingMessageWorkflow import GreetingMessageWorkflow
from industries.healthcare.workflows.common.ExitWorkflow import ExitWorkflow


class HealthcareWorkflow(Workflow):

    WORKFLOW = {
        # Customer workflows
        "MainMenuWorkflow": MainMenuWorkflow,
        "SelectPatientWorkflow": SelectPatientWorkflow,
        "SelectDoctorWorkflow": SelectDoctorWorkflow,
        "SelectConsultationWorkflow": SelectConsultationWorkflow,
        "SelectDateWorkflow": SelectDateWorkflow,
        "SelectTimeSlotWorkflow": SelectTimeSlotWorkflow,
        "ProcessPaymentWorkflow": ProcessPaymentWorkflow,
        "ConfirmBookingWorkflow": ConfirmBookingWorkflow,
        "ViewAppointmentsWorkflow": ViewAppointmentsWorkflow,
        "SelectAppointmentToCancelWorkflow": SelectAppointmentToCancelWorkflow,
        "ConfirmCancellationWorkflow": ConfirmCancellationWorkflow,
        "RegisterPatientWorkflow": RegisterPatientWorkflow,
        "CollectEmailWorkflow": CollectEmailWorkflow,

        # Doctor workflows
        "DoctorMenuWorkflow": DoctorMenuWorkflow,
        "DoctorViewScheduleWorkflow": DoctorViewScheduleWorkflow,
        "DoctorPatientDetailsWorkflow": DoctorPatientDetailsWorkflow,
        "DoctorSelectAppointmentsToCancelWorkflow": DoctorSelectAppointmentsToCancelWorkflow,
        "DoctorCancelAppointmentsWorkflow": DoctorCancelAppointmentsWorkflow,
        "DoctorCancellationConfirmationWorkflow": DoctorCancellationConfirmationWorkflow,
        "DoctorViewRefundsWorkflow": DoctorViewRefundsWorkflow,
        "DoctorProcessRefundWorkflow": DoctorProcessRefundWorkflow,

        # Admin workflows
        "AdminMenuWorkflow": AdminMenuWorkflow,

        # Common workflows
        "GreetingMessageWorkflow": GreetingMessageWorkflow,
        "ExitWorkflow": ExitWorkflow,
    }

    @classmethod
    def get_workflow(cls, name: str):
        if not name:
            return None

        return cls.WORKFLOW.get(name)

