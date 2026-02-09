In app/chatbot.tsx, implement the AI “mind/brain” logic using the OpenRouter Chat Completions API, while strictly preserving all existing logic, structure, state, and UI already implemented in this file.

OpenRouter Integration Requirements

Connect to the OpenRouter Chat Completions API using the existing retry, fallback, and error-handling logic already present in the file.

The project uses three API keys:

EXPO_PUBLIC_OPEN_ROUTER_API_KEY1

EXPO_PUBLIC_OPEN_ROUTER_API_KEY2

EXPO_PUBLIC_OPEN_ROUTER_API_KEY3

These keys are used sequentially through the existing retry loop and must not replace or remove the current retry/backoff/model-fallback logic.

Use the existing fetch('https://openrouter.ai/api/v1/chat/completions') call pattern and headers.

Chatbot Rules (Mandatory)

There is a file named chatbot-rules.json.

Load and apply the contents of this file as the system-level rules and behavior constraints of the chatbot.

These rules must be injected into the system prompt and treated as non-negotiable behavior guidelines for the AI.

The chatbot must always obey these rules when generating responses.

API Data as Chatbot “Mind”

The chatbot must use live data from ALL available GET endpoints as part of its reasoning and response generation.

Donor Endpoints

GET /donors (filters: bloodType, municipality, availability, searchQuery)

GET /donors/{id}

Donor Registration Endpoints

GET /donor-registrations

GET /donor-registrations/{id}

Notification Endpoints

GET /notifications

GET /notifications/{id}

GET /notifications/unread-count

GET /notifications/grouped

Data Usage Rules

Fetch relevant data from these GET endpoints before or during AI response generation.

Summarize, analyze, and contextualize the fetched data.

The chatbot’s answers must be grounded in real API data, not assumptions.

If multiple endpoints are relevant, combine and summarize them intelligently.

If no data is available, respond gracefully and inform the user.

Chatbot Behavior

The chatbot must:

Answer questions about donors, donor registrations, and notifications

Provide summaries, counts, availability insights, and status explanations

Base all answers on fetched API data + chatbot-rules.json

The chatbot must not perform POST, PUT, PATCH, or DELETE actions directly—only explain, summarize, or guide based on data.

Strict Constraints

❌ Do NOT refactor, remove, or rename existing logic, state, hooks, or UI.

❌ Do NOT modify unrelated business logic.

❌ Do NOT hardcode responses.

✅ Follow real-world chatbot implementation standards.

✅ Keep the implementation mobile-safe and production-ready.

Expected Result

A fully functional chatbot “mind” that:

Uses OpenRouter reliably with fallback support

Obeys chatbot-rules.json

Thinks using real API data

Summarizes and answers accurately based on the system’s current state
