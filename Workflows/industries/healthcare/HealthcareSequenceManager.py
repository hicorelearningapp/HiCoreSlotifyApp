from core.SequenceManager import SequenceManager
from core.SequenceFactory import Sequence, BaseSequenceManager
from core.WorkflowFactory import WorkflowFactory
from core.models import ConversationSession


class HealthcareSequenceManager(BaseSequenceManager):
    @classmethod
    def GetSequence(cls, sessionData : ConversationSession) -> Sequence:
        config = SequenceManager.get_config(sessionData.business_phone)
        sequences_dict = config.get("sequences", {})

        if sessionData.sequence_name not in sequences_dict:
            raise ValueError(f"Sequence '{sessionData.sequence_name}' not found in configuration.")

        workflow_names = sequences_dict[sessionData.sequence_name]
        workflows = []
        for w_name in workflow_names:
            wf_class = WorkflowFactory.get_workflow(w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(sessionData.sequence_name, workflows)


