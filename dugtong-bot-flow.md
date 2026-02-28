# Dugtong Bot - Complete Flow Documentation

## Overview

**Dugtong Bot** is an AI-powered chatbot integrated into the Dugtong blood donation mobile application. It serves as a helpful assistant for administrators to query and understand system data including donors, registrations, and notifications. The bot combines OpenRouter's free LLM models with a rule-based fallback system to provide reliable, context-aware responses.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Dugtong Bot Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐ │
│  │   User       │────▶│  chatbot.tsx     │────▶│ OpenRouter  │ │
│  │   (Admin)    │     │  (Frontend)      │     │  API        │ │
│  └──────────────┘     └──────────────────┘     └─────────────┘ │
│                              │                         │        │
│                              ▼                         │        │
│                       ┌──────────────┐                │        │
│                       │chatbot-rules │                │        │
│                       │.json         │                │        │
│                       └──────────────┘                │        │
│                              │                        │        │
│                              ▼                        ▼        │
│                       ┌─────────────────────────────────────┐  │
│                       │   System Prompt (Rules + Live Data) │  │
│                       └─────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                       ┌──────────────┐     ┌────────────────┐  │
│                       │   Fallback   │────▶│ API Endpoints  │  │
│                       │   (Rules)    │     │ (Live Data)    │  │
│                       └──────────────┘     └────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. **Frontend Component** (`app/chatbot.tsx`)

The main chatbot screen component built with React Native:

- **UI Elements**:
  - Bot profile section with animated intro
  - Message bubbles (user/bot)
  - Typing indicator
  - Expandable input footer
  - Keyboard-aware scroll view

- **Key Features**:
  - Prevents message sending during API processing (`cannotReceiveMessages` state)
  - Shows typing indicator while bot is thinking
  - Collapsible footer for better UX
  - Hardware back button support to collapse keyboard

### 2. **Rules Configuration** (`chatbot-rules.json`)

A JSON file defining bot behavior patterns:

```json
{
  "rules": [
    {
      "id": 1,
      "title": "Summarize Analytics and Donors Data",
      "keywords": ["analytics", "summary", "data", "donors", "report"],
      "response_templates": ["I can help you with analytics... {{data_summary}}"]
    },
    {
      "id": 2,
      "title": "Greeting Protocol",
      "keywords": ["hello", "hi", "hey", "greetings"],
      "response_templates": ["Hey there! How can I assist you today?"]
    }
    // ... more rules
  ]
}
```

**Rule Categories**:
1. **Analytics/Data Summary** - Triggers live data fetching
2. **Greetings** - Friendly hello responses
3. **Acknowledgments** - Generic acknowledgment
4. **Help/Questions** - Helpful responses to queries
5. **Thank You** - Gratitude responses
6. **Fallback** - When no keywords match

### 3. **Database Service** (`src/services/ChatbotDatabaseService.ts`)

Local SQLite storage for conversation history:

- **Tables**:
  - `chatbot_sessions` - Tracks user sessions
  - `chatbot_messages` - Stores individual messages

- **Features**:
  - Offline-first architecture
  - Network state monitoring via NetInfo
  - Session management (active/completed/archived)
  - Message persistence with metadata

---

## Message Flow

### Complete Request-Response Cycle

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│ 1. Validate & Add User Message  │
│    - Check cannotReceiveMessages│
│    - Add to messages array      │
│    - Collapse footer            │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ 2. Show Typing Indicator        │
│    - Set isTyping = true        │
│    - Set cannotReceiveMessages  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ 3. Call getOpenRouterResponse() │
│    - Fetch live data            │
│    - Build system prompt        │
│    - Try API keys (fallback)    │
│    - Try models (fallback)      │
│    - Retry with exponential     │
│      backoff                    │
└─────────────────────────────────┘
    │
    ├──────────────┬──────────────┐
    │ Success      │ Partial Fail │ All Failed
    ▼              ▼              ▼
┌────────┐    ┌──────────┐   ┌──────────┐
│ AI     │    │ Try next │   │ Fallback │
│ Response│    │ key/model│   │ to Rules │
└────────┘    └──────────┘   └──────────┘
    │              │              │
    └──────────────┴──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 4. Hide Typing Indicator        │
│    - Set isTyping = false       │
│    - Set cannotReceiveMessages  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ 5. Display Bot Response         │
│    - Add to messages array      │
│    - Scroll to bottom           │
└─────────────────────────────────┘
```

---

## API Integration Strategy

### Multi-Layer Fallback Mechanism

The bot implements a robust fallback system to ensure reliability:

#### Layer 1: Multiple API Keys
```typescript
const apiKeys = [
  OPEN_ROUTER_API_KEY1,  // Primary
  OPEN_ROUTER_API_KEY2,  // Secondary
  OPEN_ROUTER_API_KEY3   // Tertiary
]
```

#### Layer 2: Multiple Free Models
```typescript
const FREE_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free'
]
```

#### Layer 3: Retry Logic
- **Max Retries**: 2 attempts per model
- **Delay Strategy**: Exponential backoff with jitter
  - `delay = baseDelay * 2^attempt + random(0-1000ms)`
- **Retryable Errors**: 429 (Rate Limit), 502, 503

#### Layer 4: Rule-Based Fallback
When all API attempts fail:
- Match input against keywords
- Select random template from matching rule
- Inject live data into template

---

## Live Data Integration

### Data Sources

The bot fetches real-time data from three API endpoints:

```typescript
const fetchLiveData = async () => {
  const [donorsData, registrationsData, notificationsData] = await Promise.all([
    donorApi.getDonors({...}),           // Donors list
    getDonorRegistrations({...}),        // Registrations
    notificationApi.getNotifications({...}) // Notifications
  ]);
  return { donors, registrations, notifications };
};
```

### Data Summary Generation

```typescript
generateDataSummary(): string {
  // Calculates:
  // - Blood type distribution
  // - Available vs total donors
  // - Pending/approved registrations
  // - Unread notification count
  
  return `
Donors Summary:
- Total Donors: 45
- Available Donors: 32
- Blood Type Distribution: A+: 12, B+: 8, O+: 15...

Registrations Summary:
- Total: 23
- Pending: 8
- Approved: 15

Notifications Summary:
- Total: 67
- Unread: 12
`;
}
```

### System Prompt Construction

```typescript
const systemPrompt = `You are Dugtong Bot, a helpful assistant...

MANDATORY RULES (from chatbot-rules.json):
${rulesDescription}

LIVE SYSTEM DATA:
${dataSummary}

BEHAVIOR GUIDELINES:
- Always base answers on live data
- Be helpful, friendly, and concise
- Never perform actions, only explain and guide
`;
```

---

## State Management

### Key States

| State | Type | Purpose |
|-------|------|---------|
| `message` | string | Current input text |
| `messages` | MessageType[] | Chat history |
| `showIntro` | boolean | Show/hide bot profile |
| `isInputFocused` | boolean | Track keyboard state |
| `cannotReceiveMessages` | boolean | Block input during processing |
| `isTyping` | boolean | Show typing indicator |

### State Flow Diagram

```
┌─────────────────┐
│ Initial State   │
│ - canSend=true  │
│ - isTyping=false│
└────────┬────────┘
         │ User sends message
         ▼
┌─────────────────┐
│ Processing      │
│ - canSend=false │
│ - isTyping=true │
└────────┬────────┘
         │ Response received/error
         ▼
┌─────────────────┐
│ Ready State     │
│ - canSend=true  │
│ - isTyping=false│
└─────────────────┘
```

---

## User Interface Flow

### Screen Layout

```
┌─────────────────────────────────────┐
│         RoleBasedDashboard          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │   Bot Profile (conditional)   │  │
│  │   [Bot Icon] Dugtong Bot      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Bot Message Bubble           │  │
│  └───────────────────────────────┘  │
│      ┌─────────────────────────┐    │
│      │    User Message Bubble  │    │
│  ┌───────────────────────────────┐  │
│  │  Bot Message + Typing...      │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  [Input field............] [Send]   │  ← Footer
└─────────────────────────────────────┘
```

### Typing Indicator

```
┌──────────────────┐
│  ● ● ●           │  ← Animated dots
└──────────────────┘
```

### Message Bubble Styles

- **Bot Messages**: Surface color, left-aligned, rounded corners
- **User Messages**: Primary color, right-aligned, white text
- **Typing Bubble**: Surface color with animated dots

---

## Error Handling

### API Error Scenarios

| Error Code | Handling |
|------------|----------|
| 429 | Retry with exponential backoff |
| 502/503 | Retry, then try next model |
| 401/403 | Skip to next API key |
| Network Error | Retry with jitter, fallback to rules |
| JSON Parse Error | Retry once, then skip model |

### Graceful Degradation

```typescript
try {
  // Try OpenRouter API
  const response = await getOpenRouterResponse(input);
} catch (error) {
  // Fallback to rule-based response
  const response = await getHumanLikeResponse(input);
}
```

### Data Fetching Errors

Each API call has individual error handling:

```typescript
const [donors, registrations, notifications] = await Promise.all([
  donorApi.getDonors({...}).catch(() => ({ items: [], total: 0 })),
  getDonorRegistrations({...}).catch(() => []),
  notificationApi.getNotifications({...}).catch(() => [])
]);
```

---

## Access Control

### Role-Based Access

The chatbot is **admin-only**:

```typescript
// Check in chatbot.tsx
if (!isAdmin()) {
  return <RoleGuard allowedRoles={[USER_ROLES.ADMIN]} ... />;
}
```

### Navigation Path

```
Dashboard → Sidebar Menu → "Dugtong Bot" → /chatbot
```

Only users with `USER_ROLES.ADMIN` can access this route.

---

## Configuration

### Environment Variables

Required in `.env` or `eas.json`:

```
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=your_primary_key
EXPO_PUBLIC_OPEN_ROUTER_API_KEY2=your_secondary_key
EXPO_PUBLIC_OPEN_ROUTER_API_KEY3=your_tertiary_key
```

### chatbot-rules.json Structure

```json
{
  "rules": [...],
  "features": {
    "analytics_summarization": {
      "enabled": true,
      "data_sources": ["donors", "contributions", "engagement"]
    },
    "donor_data_access": {
      "enabled": true,
      "fields": ["name", "bloodType", "availability"]
    }
  }
}
```

---

## Example Interactions

### Scenario 1: Data Query

**User**: "How many donors are available?"

**Process**:
1. Fetch donors data
2. Count `availability_status === 'Available'`
3. Include in system prompt
4. AI generates contextual response

**Bot**: "Currently, we have 32 donors marked as available for donation out of 45 total donors."

### Scenario 2: Greeting

**User**: "Hello"

**Process**:
1. Match "hello" keyword in Rule 2
2. Select random greeting template

**Bot**: "Hey there! How can I assist you today?"

### Scenario 3: API Failure

**User**: "Show analytics"

**Process**:
1. All 3 API keys fail
2. All 3 models fail
3. Fallback to rule-based response
4. Still include live data

**Bot**: "I can help you with analytics and donor data summaries. Here's what I found: [data summary]"

---

## Technical Specifications

### Dependencies

```json
{
  "react-native": "Core framework",
  "react-native-reanimated": "Animations",
  "lucide-react-native": "Icons (Bot, Send)",
  "expo-sqlite": "Local database",
  "@react-native-community/netinfo": "Network state",
  "@react-native-async-storage/async-storage": "Device ID storage"
}
```

### API Request Format

```typescript
const requestBody = {
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput }
  ],
  max_tokens: 150,
  temperature: 0.7,
};
```

### Message Type

```typescript
type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};
```

---

## Performance Optimizations

1. **Parallel Data Fetching**: All API calls use `Promise.all()`
2. **Individual Error Handling**: One failed endpoint doesn't block others
3. **Exponential Backoff**: Prevents API rate limiting
4. **Local Caching**: SQLite for conversation history
5. **Typing Indicator**: Provides user feedback during processing
6. **Input Blocking**: Prevents duplicate messages during processing

---

## Limitations

- **Read-Only**: Bot cannot modify database records
- **Admin Only**: Regular users cannot access
- **Local History**: Chat history stored only on device
- **Internet Required**: Needs connection for AI responses
- **Free Models**: Limited to OpenRouter's free tier models
- **No Context**: Each message is independent (no conversation memory in AI)

---

## Future Enhancements

Potential improvements:

1. **Conversation Memory**: Pass conversation history to AI
2. **Multi-User Support**: Sync chat history across devices
3. **Voice Input**: Add speech-to-text capability
4. **Quick Actions**: Suggested response buttons
5. **Rich Media**: Support for images/cards in responses
6. **Custom Models**: Fine-tune model for blood donation domain
7. **Analytics**: Track common queries and bot performance

---

## Troubleshooting

### Bot Not Responding

1. Check internet connection
2. Verify API keys in environment
3. Check console for error logs
4. Try rule-based fallback (should always work)

### Slow Responses

1. API rate limiting (wait for backoff)
2. Model overload (tries next model)
3. Large data payload (optimize queries)

### Data Not Showing

1. Check API endpoint availability
2. Verify database connection
3. Check error logs for fetch failures
4. Data might be empty (valid scenario)

---

## Summary

Dugtong Bot is a robust, AI-powered assistant that provides administrators with natural language access to system data. Its multi-layer fallback system ensures reliability even when external APIs fail, while its live data integration keeps responses accurate and contextual. The bot exemplifies a practical implementation of conversational AI in a mobile health application.
