from typing import List, Type

class Sequence:
    def __init__(
        self,
        name: str,
        workflows: List[Type]
    ):

        if not workflows:
            raise ValueError(
                f"Sequence '{name}' must contain at least one workflow."
            )

        self.Name = name
        self.Workflows = workflows

    @property
    def Count(self):

        return len(self.Workflows)

    def First(self):

        return self.Workflows[0]

    def Current(self,index: int):

        if index < 0:
            return None

        if index >= self.Count:
            return None

        return self.Workflows[index]

    def Next(self,index: int):
        next_index = index + 1

        if next_index >= self.Count:
            return None

        return self.Workflows[next_index]

    def Previous(
        self,
        index: int
    ):

        previous_index = index - 1

        if previous_index < 0:
            return None

        return self.Workflows[previous_index]

    def IsFirst(
        self,
        index: int
    ):

        return index == 0

    def IsLast(
        self,
        index: int
    ):

        return index >= self.Count - 1

    def IndexOf(
        self,
        workflow_class
    ):
        try:
            return self.Workflows.index(
                workflow_class
            )
        except ValueError:
            return -1

    def IndexOfName(self, workflow_name: str) -> int:
        for i, wf in enumerate(self.Workflows):
            if wf.__name__ == workflow_name:
                return i
        return -1

    def Contains(
        self,
        workflow_class
    ):

        return workflow_class in self.Workflows

    def GetAll(self):

        return self.Workflows

    def __str__(self):

        return self.Name

from core.config.BusinessManager import BusinessManager
from core.workflow.WorkflowFactory import WorkflowFactory

class SequenceFactory:
    """
    A Sequence Factory that manages configuration and builds sequences.
    Reads custom sequences from industry_configs/ via BusinessManager,
    fetches workflow classes from WorkflowFactory, and returns a fully constructed Sequence.
    """

    @classmethod
    def get_setting(cls, db_session=None, business_phone: str | None = None, setting_key: str = "", default_value=None):
        config = BusinessManager.get_config(db_session, business_phone)
        settings = config.get("settings", {})
        return settings.get(setting_key, default_value)

    @classmethod
    def GetSequenceName(cls, user_type: str, db_session=None, business_phone: str | None = None) -> str:
        config = BusinessManager.get_config(db_session, business_phone)
        mappings = config.get("user_type_mappings", {})
        return mappings.get(user_type)

    @classmethod
    def Get(cls, name: str, db_session=None, business_phone: str | None = None) -> Sequence:
        config = BusinessManager.get_config(db_session, business_phone)
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
