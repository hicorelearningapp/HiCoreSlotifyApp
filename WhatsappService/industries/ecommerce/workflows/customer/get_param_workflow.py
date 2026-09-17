from typing import List, Type
from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message


class GetParamWorkflow:
    """
    Dynamic workflow class to collect a product option parameter from the customer.
    Subclasses or dynamically created classes will configure `param_name` and `options`.
    """
    param_name: str = "Option"
    options: List[str] = []

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        param_name = self.param_name
        options = self.options

        # 1. If already collected in session, skip
        selected_options = session.WorkflowData.get("selected_options", {})
        if param_name in selected_options and selected_options[param_name]:
            return WorkflowResult.completed()

        # 2. Format options for customer using dropdown list button
        rows = [
            {"id": f"PARAM_{param_name}_{opt}", "title": opt[:24]}
            for opt in options
        ]
        sections = [{"title": f"Available {param_name}s", "rows": rows}]
        prompt = f"Please select *{param_name}*:"
        button_text = f"Select {param_name}"[:20]

        reply = Reply("list", prompt, sections=sections, button_text=button_text)
        return WorkflowResult.waiting(reply)

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        param_name = self.param_name
        options = self.options
        selected_value = None

        # 1. Match from Interactive Button / List click
        if message.InteractiveId:
            prefix = f"PARAM_{param_name}_"
            if message.InteractiveId.startswith(prefix):
                selected_value = message.InteractiveId[len(prefix):]
            elif message.InteractiveId in options:
                selected_value = message.InteractiveId

        # 2. Match from Text input
        if not selected_value and message.Text:
            raw_text = message.Text.strip()

            # A. Match 1-based index (e.g. '1', '2', '3')
            if raw_text.isdigit():
                idx = int(raw_text) - 1
                if 0 <= idx < len(options):
                    selected_value = options[idx]

            # B. Match exact text (case-insensitive)
            if not selected_value:
                for opt in options:
                    if raw_text.lower() == str(opt).strip().lower():
                        selected_value = opt
                        break

            # C. Match substring or containment
            if not selected_value:
                for opt in options:
                    if raw_text.lower() in str(opt).strip().lower() or str(opt).strip().lower() in raw_text.lower():
                        selected_value = opt
                        break

        # 3. If valid selection made
        if selected_value:
            if "selected_options" not in session.WorkflowData:
                session.WorkflowData["selected_options"] = {}
            session.WorkflowData["selected_options"][param_name] = selected_value
            session.WorkflowData[param_name.lower()] = selected_value

            if hasattr(session, "state") and hasattr(session.state, "WorkflowData"):
                if "selected_options" not in session.state.WorkflowData:
                    session.state.WorkflowData["selected_options"] = {}
                session.state.WorkflowData["selected_options"][param_name] = selected_value
                session.state.WorkflowData[param_name.lower()] = selected_value

            return WorkflowResult.completed()

        # 4. Invalid selection - re-send dropdown list menu
        rows = [
            {"id": f"PARAM_{param_name}_{opt}", "title": opt[:24]}
            for opt in options
        ]
        sections = [{"title": f"Available {param_name}s", "rows": rows}]
        button_text = f"Select {param_name}"[:20]
        error_msg = f"❌ Invalid selection for *{param_name}*.\nPlease select an option using the dropdown menu below:"
        return WorkflowResult.waiting(Reply("list", error_msg, sections=sections, button_text=button_text))

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.completed()


# Registry cache to ensure the same class object is returned for matching param names
_PARAM_WORKFLOW_CACHE: dict[str, Type[GetParamWorkflow]] = {}


def create_get_param_workflow(param_name: str, options: List[str]) -> Type[GetParamWorkflow]:
    """
    Factory function that creates a unique GetParamWorkflow class for a given parameter name and options.
    """
    clean_name = param_name.strip().replace(" ", "_").replace(";", "").replace(":", "")
    cache_key = f"{clean_name}_{','.join(options)}"

    if cache_key in _PARAM_WORKFLOW_CACHE:
        return _PARAM_WORKFLOW_CACHE[cache_key]

    class_name = f"GetParam_{clean_name}_Workflow"
    attrs = {
        "param_name": param_name.strip(),
        "options": [str(opt).strip() for opt in options if str(opt).strip()],
        "__doc__": f"Dynamic workflow to collect {param_name} ({', '.join(options)})"
    }

    wf_class = type(class_name, (GetParamWorkflow,), attrs)
    _PARAM_WORKFLOW_CACHE[cache_key] = wf_class
    return wf_class
