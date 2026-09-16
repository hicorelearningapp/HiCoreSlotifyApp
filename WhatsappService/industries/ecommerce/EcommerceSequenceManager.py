from core.workflow_factory.workflow_factory_base import WorkflowFactory
from core.sequence import Sequence, BaseSequenceManager
from core.api_client import BackendAPIClient
from core.models import ConversationSession


class EcommerceSequenceManager(BaseSequenceManager):

    @classmethod
    def GetSequence(cls, sessionData: ConversationSession) -> Sequence:
        config = BackendAPIClient().get_industry_config_by_product_id(
            sessionData.state.ProductId
        )

        industry = config.get("industry")
        sequences = config.get("sequences", {})

        if not sessionData.state.SequenceName:
            sessionData.state.SequenceName = "MainWorkSequence"

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
