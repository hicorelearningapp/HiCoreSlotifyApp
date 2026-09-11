from core.workflow_factory.workflow_factory_base import WorkflowFactory

from industries.healthcare.workflows.customer.main_menu_workflow import (
    MainMenuWorkflow
)
from industries.healthcare.workflows.customer.select_patient_workflow import (
    SelectPatientWorkflow
)
from industries.healthcare.workflows.customer.select_doctor_workflow import (
    SelectDoctorWorkflow
)
from industries.healthcare.workflows.customer.select_consultation_workflow import (
    SelectConsultationWorkflow
)
from industries.healthcare.workflows.customer.select_date_workflow import (
    SelectDateWorkflow
)
from industries.healthcare.workflows.customer.select_time_slot_workflow import (
    SelectTimeSlotWorkflow
)
from industries.healthcare.workflows.customer.process_payment_workflow import (
    ProcessPaymentWorkflow
)
from industries.healthcare.workflows.customer.confirm_booking_workflow import (
    ConfirmBookingWorkflow
)
from industries.healthcare.workflows.customer.view_appointments_workflow import (
    ViewAppointmentsWorkflow
)
from industries.healthcare.workflows.customer.select_appointment_to_cancel_workflow import (
    SelectAppointmentToCancelWorkflow
)
from industries.healthcare.workflows.customer.confirm_cancellation_workflow import (
    ConfirmCancellationWorkflow
)
from industries.healthcare.workflows.customer.register_patient_workflow import (
    RegisterPatientWorkflow
)
from industries.healthcare.workflows.customer.collect_email_workflow import (
    CollectEmailWorkflow
)

from industries.healthcare.workflows.doctor.doctor_menu_workflow import (
    DoctorMenuWorkflow
)
from industries.healthcare.workflows.doctor.doctor_view_schedule_workflow import (
    DoctorViewScheduleWorkflow
)
from industries.healthcare.workflows.doctor.doctor_patient_details_workflow import (
    DoctorPatientDetailsWorkflow
)
from industries.healthcare.workflows.doctor.doctor_cancel_appointment_workflow import (
    DoctorSelectAppointmentsToCancelWorkflow,
    DoctorCancelAppointmentsWorkflow,
    DoctorCancellationConfirmationWorkflow,
)
from industries.healthcare.workflows.doctor.doctor_refund_workflow import (
    DoctorViewRefundsWorkflow,
    DoctorProcessRefundWorkflow,
)

from industries.healthcare.workflows.admin.admin_menu_workflow import (
    AdminMenuWorkflow
)

from industries.healthcare.workflows.common.GreetingMessageWorkflow import (
    GreetingMessageWorkflow
)
from industries.healthcare.workflows.common.ExitWorkflow import (
    ExitWorkflow
)


class HealthcareWorkflowFactory(WorkflowFactory):

    WORKFLOW_REGISTRY = {}
    _INITIALIZED = False

    @classmethod
    def register_workflows(cls):
        if cls._INITIALIZED:
            return

        # Customer workflows
        cls.register(
            "MainMenuWorkflow",
            MainMenuWorkflow
        )

        cls.register(
            "SelectPatientWorkflow",
            SelectPatientWorkflow
        )

        cls.register(
            "SelectDoctorWorkflow",
            SelectDoctorWorkflow
        )

        cls.register(
            "SelectConsultationWorkflow",
            SelectConsultationWorkflow
        )

        cls.register(
            "SelectDateWorkflow",
            SelectDateWorkflow
        )

        cls.register(
            "SelectTimeSlotWorkflow",
            SelectTimeSlotWorkflow
        )

        cls.register(
            "ProcessPaymentWorkflow",
            ProcessPaymentWorkflow
        )

        cls.register(
            "ConfirmBookingWorkflow",
            ConfirmBookingWorkflow
        )

        cls.register(
            "ViewAppointmentsWorkflow",
            ViewAppointmentsWorkflow
        )

        cls.register(
            "SelectAppointmentToCancelWorkflow",
            SelectAppointmentToCancelWorkflow
        )

        cls.register(
            "ConfirmCancellationWorkflow",
            ConfirmCancellationWorkflow
        )

        cls.register(
            "RegisterPatientWorkflow",
            RegisterPatientWorkflow
        )

        cls.register(
            "CollectEmailWorkflow",
            CollectEmailWorkflow
        )

        # Doctor workflows
        cls.register(
            "DoctorMenuWorkflow",
            DoctorMenuWorkflow
        )

        cls.register(
            "DoctorViewScheduleWorkflow",
            DoctorViewScheduleWorkflow
        )

        cls.register(
            "DoctorPatientDetailsWorkflow",
            DoctorPatientDetailsWorkflow
        )

        cls.register(
            "DoctorSelectAppointmentsToCancelWorkflow",
            DoctorSelectAppointmentsToCancelWorkflow
        )

        cls.register(
            "DoctorCancelAppointmentsWorkflow",
            DoctorCancelAppointmentsWorkflow
        )

        cls.register(
            "DoctorCancellationConfirmationWorkflow",
            DoctorCancellationConfirmationWorkflow
        )

        cls.register(
            "DoctorViewRefundsWorkflow",
            DoctorViewRefundsWorkflow
        )

        cls.register(
            "DoctorProcessRefundWorkflow",
            DoctorProcessRefundWorkflow
        )

        # Admin workflows
        cls.register(
            "AdminMenuWorkflow",
            AdminMenuWorkflow
        )

        # Common workflows
        cls.register(
            "GreetingMessageWorkflow",
            GreetingMessageWorkflow
        )

        cls.register(
            "ExitWorkflow",
            ExitWorkflow
        )

        cls._INITIALIZED = True

    @classmethod
    def get_workflow(cls, name: str):
        cls.register_workflows()
        
        clean_name = name
        if clean_name.startswith("DoctorAppointment."):
            clean_name = clean_name[len("DoctorAppointment."):]
            
        if clean_name in cls.WORKFLOW_REGISTRY:
            return cls.WORKFLOW_REGISTRY[clean_name]
            
        print(f"[WARNING] Workflow '{name}' not found in registry.")
        return None