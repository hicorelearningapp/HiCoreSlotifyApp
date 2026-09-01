class WorkflowFactory:
    """
    A generic registry that maintains a mapping of workflow names to classes.
    Industries will register their specific workflows here.
    """
    WORKFLOW_REGISTRY = {}

    @classmethod
    def register(cls, name: str, workflow_cls):
        """Registers a workflow dynamically."""
        cls.WORKFLOW_REGISTRY[name] = workflow_cls

    @classmethod
    def get_workflow(cls, name: str):
        """Returns the workflow class by name."""
        if name in cls.WORKFLOW_REGISTRY:
            return cls.WORKFLOW_REGISTRY[name]
        print(f"[WARNING] Workflow '{name}' not found in registry.")
        return None
