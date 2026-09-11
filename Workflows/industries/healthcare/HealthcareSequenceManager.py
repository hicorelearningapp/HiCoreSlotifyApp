from core.SequenceFactory import Sequence, BaseSequenceManager, SequenceFactory
from core.workflow_factory.workflow_factory_base import WorkflowFactory
from core.api_client import BackendAPIClient
from core.models import ConversationSession


class HealthcareSequenceManager(BaseSequenceManager):
    @classmethod
    def GetSequence(cls, sessionData: ConversationSession) -> Sequence:
        config = BackendAPIClient().get_industry_config_by_phone(str(sessionData.state.BusinessPhoneNumber))

        sequences_dict = config.get("sequences", {})
        if sessionData.state.SequenceName == "":
            sessionData.state.SequenceName = "PatientMainWorkSequence"

        if sessionData.state.SequenceName not in sequences_dict:
            raise ValueError(f"Sequence '{sessionData.state.SequenceName}' not found in configuration.")

        workflow_names = sequences_dict[sessionData.state.SequenceName]
        workflows = []
        for w_name in workflow_names:
            wf_class = WorkflowFactory.get_workflow(w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(sessionData.sequence_name, workflows)


# Self-register with SequenceFactory
SequenceFactory.register("HealthcareDoctorAppointment", HealthcareSequenceManager)


