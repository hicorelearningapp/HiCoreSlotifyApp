from typing import List

from core.SequenceManager import SequenceManager
from core.SequenceFactory import Sequence, BaseSequenceManager
from core.WorkflowFactory import WorkflowFactory
from core.models import ConversationSession


class EcommerceSequenceManager(BaseSequenceManager):
    # @classmethod
    # def get_setting(cls, business_phone: str | None = None, setting_key: str = "", default_value=None):
    #     config = SequenceManager.get_config(business_phone)
    #     settings = config.get("settings", {})
    #     return settings.get(setting_key, default_value)

    @classmethod
    def GetSequence(self, sessionData : ConversationSession) -> Sequence:
        import json
        config_path = SequenceManager.get_config(sessionData.state.ProductKey)
        config = json.load(open(config_path, "r", encoding="utf-8")) if config_path else {}
        sequences_dict = config.get("sequences", {})

        workflow_names = sequences_dict.get(sessionData.state.SequenceName, [])
        workflows = []
        for w_name in workflow_names:
            wf_class = WorkflowFactory.get_workflow(w_name)
            if wf_class:
                workflows.append(wf_class)

        return Sequence(sessionData.state.SequenceName, workflows)

#
# @classmethod
#     def Get(cls, name: str, business_phone: str | None = None) -> Sequence:
#         config = SequenceManager.get_config(business_phone)
#         sequences_dict = config.get("sequences", {})
#
#         if name not in sequences_dict:
#             raise ValueError(f"Sequence '{name}' not found in configuration.")
#
#         workflow_names = sequences_dict[name]
#         workflows = []
#         for w_name in workflow_names:
#             wf_class = WorkflowFactory.get_workflow(w_name)
#             if wf_class:
#                 workflows.append(wf_class)
#
#         return Sequence(name, workflows)
#

