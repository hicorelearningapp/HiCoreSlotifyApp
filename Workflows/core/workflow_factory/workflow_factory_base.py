from typing import Dict, Type, Optional


class WorkflowFactory:
    """
    Base factory and registry for workflow classes within an industry.
    """
    WORKFLOW_REGISTRY: Dict[str, Type] = {}

    @classmethod
    def register(cls, name: str, workflow_cls: Type):
        """Registers a workflow class dynamically."""
        cls.WORKFLOW_REGISTRY[name] = workflow_cls

    @classmethod
    def get_workflow(cls, name: str):
        """Retrieves a registered workflow class by name."""
        if name in cls.WORKFLOW_REGISTRY:
            return cls.WORKFLOW_REGISTRY[name]
        print(f"[WARNING] Workflow '{name}' not found in registry.")
        return None

    @classmethod
    def get_factory(cls, industry: str) -> Type["WorkflowFactory"]:
        """
        Convenience factory method to resolve the industry-specific WorkflowFactory.
        Delegates to WorkflowFactoryProvider.
        """
        return WorkflowFactoryProvider.get_factory(industry)


class WorkflowFactoryProvider:
    """
    Factory Pattern Provider for Industry Workflow Factories.
    Replaces hardcoded if/elif industry branching with a dynamic factory registry.
    """
    _factories: Dict[str, Type[WorkflowFactory]] = {}

    # Backward-compatible alias
    _REGISTRY = _factories

    # Dynamic lazy loader map (avoids circular imports & hardcoded if/elif branching)
    _MODULE_MAP: Dict[str, tuple[str, str]] = {
        "Ecommerce": ("core.workflow_factory.ecommerce_workflowfactory", "EcommerceWorkflowFactory"),
        "HealthcareDoctorAppointment": ("core.workflow_factory.healthcare_workflowfactory", "HealthcareWorkflowFactory"),
        "Healthcare": ("core.workflow_factory.healthcare_workflowfactory", "HealthcareWorkflowFactory"),
        "DoctorAppointment": ("core.workflow_factory.healthcare_workflowfactory", "HealthcareWorkflowFactory"),
    }

    @classmethod
    def register(cls, industry: str, factory_cls: Type[WorkflowFactory]):
        """Registers an industry workflow factory dynamically into the factory registry."""
        cls._factories[industry] = factory_cls

    @classmethod
    def get_factory(cls, industry: str) -> Type[WorkflowFactory]:
        """
        Factory method to resolve and return the WorkflowFactory for a given industry.
        """
        if not industry:
            raise ValueError("Industry name cannot be empty.")

        # 1. Return cached factory if already registered
        if industry in cls._factories:
            return cls._factories[industry]

        # 2. Dynamic lazy loading via registry mapping (eliminates if/elif branching)
        if industry in cls._MODULE_MAP:
            mod_path, class_name = cls._MODULE_MAP[industry]
            module = __import__(mod_path, fromlist=[class_name])
            factory_class = getattr(module, class_name)
            cls._factories[industry] = factory_class
            return factory_class

        raise ValueError(
            f"No workflow factory registered for industry '{industry}'. "
            f"Available industries: {list(cls._MODULE_MAP.keys())}"
        )