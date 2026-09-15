from core.SequenceFactory import Sequence, BaseSequenceManager, SequenceFactory
from core.workflow_factory.workflow_factory_base import WorkflowFactory
from core.api_client import BackendAPIClient
from core.models import ConversationSession


class HealthcareSequenceManager(BaseSequenceManager):

    @classmethod
    def get_settings(cls, business_phone: str):
        if not business_phone:
            return {}
        try:
            config = BackendAPIClient().get_industry_config_by_phone(str(business_phone))
            return config.get("settings")
        except:
            return {}

    @classmethod
    def GetSequence(cls, sessionData: ConversationSession) -> Sequence:
        config = BackendAPIClient().get_industry_config_by_phone(
            sessionData.state.BusinessPhoneNumber
        )

        industry = config.get("industry")
        sequences = config.get("sequences", {})

        if not sessionData.state.SequenceName:
            sessionData.state.SequenceName = "PatientMainWorkSequence"

        sequence_name = sessionData.state.SequenceName

        if sequence_name not in sequences:
            raise ValueError(
                f"Sequence '{sequence_name}' not found in configuration."
            )

        workflows = []

        for name in sequences[sequence_name]:
            workflow = WorkflowFactory.get_workflow_factory(
                industry
            ).get_workflow(name)

            if workflow:
                workflows.append(workflow)

        return Sequence(sequence_name, workflows)
