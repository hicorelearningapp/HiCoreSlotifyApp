from core.SequenceManager import SequenceManager
from core.SequenceFactory import Sequence, BaseSequenceManager
from core.WorkflowFactory import WorkflowFactory

class HealthcareSequenceManager(BaseSequenceManager):
    @classmethod
    def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
        config = SequenceManager.get_config(business_phone)
        settings = config.get("settings", {})
        return settings.get(setting_key, default_value)

    @classmethod
    def GetSequenceName(cls, user_type: str, business_phone: str | None = None) -> str:
        config = SequenceManager.get_config(business_phone)
        mappings = config.get("user_type_mappings", {})
        return mappings.get(user_type)

    @classmethod
    def Get(cls, name: str, business_phone: str | None = None) -> Sequence:
        config = SequenceManager.get_config(business_phone)
        sequences_dict = config.get("sequences", {})

        if name not in sequences_dict:
            raise ValueError(f"Sequence '{name}' not found in configuration.")

        workflow_names = sequences_dict[name]
        workflows = []
        for w_name in workflow_names:
            wf_class = WorkflowFactory.get_workflow(w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(name, workflows)


