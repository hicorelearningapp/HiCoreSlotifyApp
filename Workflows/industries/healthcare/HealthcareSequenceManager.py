from core.SequenceManager import SequenceManager
from core.SequenceFactory import Sequence, BaseSequenceManager
from core.WorkflowFactory import WorkflowFactory
from core.models import ConversationSession


class HealthcareSequenceManager(BaseSequenceManager):
    @classmethod
    def GetSequence(cls, sessionData : ConversationSession) -> Sequence:
        import json
        config_path = SequenceManager.get_config(sessionData.state.BusinessPhoneNumber)
        config = json.load(open(config_path, "r", encoding="utf-8")) if config_path else {}
        sequences_dict = config.get("sequences", {})

        if sessionData.state.SequenceName not in sequences_dict:
            raise ValueError(f"Sequence '{sessionData.state.SequenceName}' not found in configuration.")

        workflow_names = sequences_dict[sessionData.state.SequenceName]
        workflows = []
        for w_name in workflow_names:
            wf_class = WorkflowFactory.get_workflow(w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(sessionData.sequence_name, workflows)


