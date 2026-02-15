# Dugtong (Expo + Next.js Backend)

This app is an Expo (React Native + TypeScript) project that connects to a Next.js backend API for all data operations.

## Requirements

- Node.js + npm
- A Next.js backend API (running and accessible)
- OpenRouter API keys (optional, for chatbot functionality)

## Environment

Set the following environment variables (Expo public envs are recommended for React Native):

### Required
- `EXPO_PUBLIC_API_BASE_URL` - Your Next.js backend API URL

### Chatbot (Optional but Recommended)
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY1`
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY2`
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY3`

See `REACT_NATIVE_ENV_SETUP.md` for detailed setup instructions.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   ```bash
   cp .env.example .env
   # Edit .env and set EXPO_PUBLIC_API_BASE_URL
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## Architecture

The app uses a client-server architecture:

- **React Native App**: Pure client application with UI and local state
- **Next.js Backend**: Handles all data operations, authentication, and business logic
- **JWT Authentication**: Secure token-based authentication
- **API Client**: Centralized API service with automatic token management

## Authentication

- Users log in with name and contact number
- JWT tokens are stored securely using `expo-secure-store`
- All API requests automatically include the JWT token
- Auto-logout on authentication failures

## Chatbot Implementation

The chatbot in `app/chatbot.tsx`:
- **OpenRouter API** for AI responses with 3-key fallback system
- **Local SQLite** for conversation history
- **Internet required** for AI responses
- **Rule-based fallback** from `chatbot-rules.json`
- **Independent** from Next.js backend

## Documentation

- `REACT_NATIVE_ENV_SETUP.md` - Environment setup guide
- `REFACTORING_SUMMARY.md` - Complete refactoring details
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `VERIFICATION_CHECKLIST.md` - Testing and verification
- `EXAMPLE_INTERACTIONS.md` - Example conversations

## API Endpoints

All data operations use the Next.js backend API:

- `/api/auth/*` - Authentication
- `/api/donors/*` - Donor management
- `/api/notifications/*` - Notifications
- `/api/alerts/*` - Blood alerts
- `/api/donations/*` - Donation records
- `/api/blood-requests/*` - Blood requests
- `/api/reports/*` - Reports and analytics
- `/api/users/*` - User management
- `/api/messages/*` - Messaging

## Security

- No database credentials in client app
- JWT-based authentication
- Secure token storage
- Role-based access control (enforced by backend)
- Automatic token refresh and logout
