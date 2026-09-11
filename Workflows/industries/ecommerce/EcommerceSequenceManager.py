from core.SequenceFactory import Sequence, BaseSequenceManager
from core.workflow_factory.workflow_factory_base import WorkflowFactoryProvider
from core.api_client import BackendAPIClient
from core.models import ConversationSession


class EcommerceSequenceManager(BaseSequenceManager):
    # @classmethod
    # def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
    #     config = SequenceManager.get_config(business_phone)
    #     settings = config.get("settings", {})
    #     return settings.get(setting_key, default_value)

    @classmethod
    def GetSequence(self, sessionData : ConversationSession) -> Sequence:
        config = BackendAPIClient().get_industry_config_by_phone(str(sessionData.state.ProductKey))
        industry = config.get("industry")
        sequences_dict = config.get("sequences", {})

        workflow_names = sequences_dict.get(sessionData.state.SequenceName, [])
        workflows = []


        for w_name in workflow_names:
            wf_class = WorkflowFactoryProvider.get_factory(industry).get_workflow(industry + "." + w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(sessionData.state.SequenceName, workflows)
