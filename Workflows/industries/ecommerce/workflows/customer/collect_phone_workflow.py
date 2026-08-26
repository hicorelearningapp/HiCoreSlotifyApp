from core.workflows.workflow_models import WorkflowResult, Reply, WorkflowStatus

class CollectPhoneWorkflow:
    def Initialize(self, session):
        return WorkflowResult.completed()
        
    def Process(self, session, message):
        return WorkflowResult.completed()

    def Complete(self, session):
        return WorkflowResult.completed()
