# Dugtong (Expo + Turso)

This app is an Expo (React Native + TypeScript) project that connects directly to Turso (LibSQL) without a separate backend service.

## Requirements

- Node.js + npm
- A Turso database URL and auth token
- OpenRouter API keys (for chatbot functionality)

## Environment

Set the following environment variables (Expo public envs are recommended for React Native):

### Required
- `EXPO_PUBLIC_TURSO_DATABASE_URL`
- `EXPO_PUBLIC_TURSO_AUTH_TOKEN`

### Chatbot (Optional but Recommended)
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY1`
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY2`
- `EXPO_PUBLIC_OPEN_ROUTER_API_KEY3`

See `ENV_SETUP_GUIDE.md` for detailed setup instructions.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Apply schema

   ```bash
   npm run turso:migrate
   ```

3. (Optional) Seed sample data

   ```bash
   npm run turso:seed
   ```

4. Start the app

   ```bash
   npx expo start
   ```

## Schema

The LibSQL schema lives in `turso/schema.sql`.

## Chatbot Implementation

The chatbot in `app/chatbot.tsx` uses:
- **OpenRouter API** for AI responses with 3-key fallback system
- **Live data** from Turso database (donors, registrations, notifications)
- **Rule-based fallback** from `chatbot-rules.json`

See documentation:
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `VERIFICATION_CHECKLIST.md` - Testing and verification
- `EXAMPLE_INTERACTIONS.md` - Example conversations
- `ENV_SETUP_GUIDE.md` - Environment setup
