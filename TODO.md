You are a senior React / TypeScript engineer working on a chatbot application.

The chatbot is currently unable to receive messages due to an external limitation (for example: API downtime, rate-limit, provider error, or maintenance mode).

Your task is to add handling for a “cannot receive message” state, without breaking or changing any existing behavior.

Core Requirement

Clearly indicate that the chatbot cannot receive messages.

Prevent the chatbot from accepting or sending new messages while in this state.

Strict Rules (Must Follow)

DO NOT remove, refactor, or modify any existing code that is not directly related to this task.

DO NOT change UI design, layout, styling, or components unless strictly necessary to display the “cannot receive message” state.

DO NOT alter existing API logic, request payloads, or model selection logic, unless required to detect this specific state.

Only add minimal logic and UI feedback required to support this behavior.

Functional Behavior

When the chatbot is unable to receive messages:

Disable the message input and send button.

Display a clear, user-friendly message such as:

“The chatbot is temporarily unavailable.”

or “The chatbot cannot receive messages right now. Please try again later.”

Ensure the user cannot submit messages while this state is active.

The state must be reversible when normal operation resumes.

Technical Expectations

Use TypeScript.

Use existing state management patterns already present in the codebase.

Keep the implementation minimal, safe, and production-ready.

Add comments only where necessary to explain the new logic.

Output Requirements

Provide one complete, copy-paste-ready code solution.

Do not include explanations outside the code.

Do not rename existing variables or components unless absolutely required.

Goal

The chatbot should gracefully inform the user that it cannot receive messages, while preserving all existing functionality, structure, and design not related to this specific task.
