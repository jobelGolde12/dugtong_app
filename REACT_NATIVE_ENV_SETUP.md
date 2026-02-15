# React Native App - Environment Setup

## Required Environment Variables

Add these to your `.env` file or set them in your environment:

### API Configuration (Required)
```bash
# Next.js Backend API URL
EXPO_PUBLIC_API_BASE_URL=https://your-nextjs-domain.com/api
# For local development:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Chatbot Configuration (Optional - for AI chatbot functionality)
```bash
# OpenRouter API Keys (3-key fallback system)
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=your_key_1
EXPO_PUBLIC_OPEN_ROUTER_API_KEY2=your_key_2
EXPO_PUBLIC_OPEN_ROUTER_API_KEY3=your_key_3
```

## Setup Instructions

1. **Create `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Update the API URL** to point to your Next.js backend

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the app**:
   ```bash
   npx expo start
   ```

## Authentication Flow

The app now uses JWT authentication with the Next.js backend:

1. **Login/Register**: User credentials are sent to `/api/auth/login` or `/api/auth/register`
2. **Token Storage**: JWT tokens are stored securely using `expo-secure-store`
3. **API Requests**: All API requests automatically include the JWT token in the `Authorization` header
4. **Auto Logout**: If a 401 response is received, the user is automatically logged out

## API Endpoints

All data operations go through the Next.js backend:

- **Auth**: `/api/auth/*`
- **Donors**: `/api/donors/*`
- **Notifications**: `/api/notifications/*`
- **Alerts**: `/api/alerts/*`
- **Donations**: `/api/donations/*`
- **Blood Requests**: `/api/blood-requests/*`
- **Reports**: `/api/reports/*`
- **Users**: `/api/users/*`
- **Messages**: `/api/messages/*`

## Chatbot

The chatbot operates independently:
- Uses OpenRouter API directly (not through Next.js backend)
- Requires internet connection
- Stores conversation history locally using SQLite
- Falls back to rule-based responses if API keys are not configured

## Removed Dependencies

The following have been removed:
- `@libsql/client` - No longer using Turso directly
- Direct database access - All data goes through Next.js API
- Turso offline sync - Replaced with API-based architecture

## Migration Notes

If migrating from the old Turso-based app:
1. Ensure your Next.js backend is running and accessible
2. Update `EXPO_PUBLIC_API_BASE_URL` to point to your backend
3. All existing data should be in the Next.js backend database
4. Users will need to log in again to get new JWT tokens
