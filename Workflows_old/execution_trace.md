# New User Message Execution Trace

Here is the exact execution trace of classes and methods that are triggered when a brand new phone number sends its very first message to the bot. 

### 1. The Webhook Entry
- **CLASS CALLED:** `whatsapp_webhook_router`
- **PROCESS:** The `/webhook` endpoint receives the JSON payload from Meta. It extracts the `customer_phone`, `business_phone`, and text, and passes them to the manager.

### 2. The Conversation Manager Starts
- **CLASS CALLED:** `ConversationManager`
- **PROCESS:** `ConversationManager.process(customer_phone, message)` is executed. The very first thing it does is try to load the user's state.

### 3. Loading the Session (The Discovery Phase)
- **CLASS CALLED:** `SessionService`
- **PROCESS:** `SessionService.load_session()` is executed. It queries the database and realizes this phone number does not exist. It must build a new session.

### 4. Fetching the Configuration
- **CLASS CALLED:** `SequenceManager`
- **PROCESS:** `SequenceManager.get_config(business_phone)` is executed to read the `[business_phone].txt` file and determine which industry this business belongs to (e.g., `"healthcare"`).

### 5. Identifying the User
- **CLASS CALLED:** `IdentifyServiceFactory` -> `HealthcareIdentifyService`
- **PROCESS:** `HealthcareIdentifyService.identify_user()` is executed. It queries your backend database (or remote doctors list) to see if this new phone number belongs to a known Doctor or an Admin. It returns an `IdentityResult` identifying them as a standard `"customer"`.

### 6. Assigning the Sequence
- **CLASS CALLED:** `SequenceFactory` -> `HealthcareSequenceManager`
- **PROCESS:** `HealthcareSequenceManager.GetSequenceName("customer", business_phone)` is executed. It looks in the configuration file to see what sequence a "customer" should start on (which evaluates to `"customer_greeting_sequence"`).
- **CLASS CALLED:** `SessionService`
- **PROCESS:** `SessionService.create_session()` is executed. It saves this brand new state (index 0, `customer_greeting_sequence`) to the database.

### 7. The State Machine Loop Begins
- **CLASS CALLED:** `SequenceFactory` -> `HealthcareSequenceManager`
- **PROCESS:** Back inside `ConversationManager`, the engine executes `HealthcareSequenceManager.Get("customer_greeting_sequence")` to load the list of workflows for this sequence.
- **CLASS CALLED:** `Sequence`
- **PROCESS:** `seq.Current(0)` is executed, which grabs the very first workflow in the list: `GreetingMessageWorkflow`.

### 8. Executing the First Workflow
- **CLASS CALLED:** `GreetingMessageWorkflow`
- **PROCESS:** The engine executes `GreetingMessageWorkflow.Initialize()`. 
- **CLASS CALLED:** `ChannelMessenger`
- **PROCESS:** The workflow uses `ChannelMessenger.send_reply()` to dispatch the "Hello! Welcome to our clinic!" message to the WhatsApp API.
- **CLASS CALLED:** `GreetingMessageWorkflow`
- **PROCESS:** The workflow returns `WorkflowStatus.WAITING` (meaning it is waiting for the user to reply).

### 9. Saving and Sleeping
- **CLASS CALLED:** `SessionService`
- **PROCESS:** Because the workflow returned `WAITING`, `ConversationManager` breaks the loop. It executes `SessionService.save_session()` to freeze the state in the database. Execution finishes, and the server goes to sleep until the user replies.
