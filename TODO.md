Objective:
Modify the chatbot.tsx file to integrate a chatbot configuration system that loads its rules and behavior from chatbot-rules.json.

Requirements:

Import JSON Data:
Load and parse the configuration from chatbot-rules.json in the chatbot.tsx component.

Add Chatbot Link Mind:
Implement logic for the chatbot to process messages and generate responses that include relevant links based on the rules defined in the JSON configuration.
Ensure the chatbot can identify key topics or keywords and respond with appropriate links as specified in the configuration.

Preservation of Existing Code:

Do not modify or remove any code unrelated to this integration.

Only add or adjust code necessary to connect chatbot.tsx with chatbot-rules.json and implement the chatbot's "link mind" feature.

Implementation Details:

Use a method such as fetch or import to load chatbot-rules.json (choose based on project setup).

Map chatbot interactions to the rules in the JSON file to determine when and which links to provide.

Output:
Provide only the updated chatbot.tsx code, clearly indicating the changes made for this integration. No additional explanations or modifications to other files should be included.
