# DUGTONG System Schematic Diagram

This document illustrates the architectural structure and data flow of the DUGTONG (Dugo Ko, Tulong Ko) Mobile Application and its Next.js backend.

## System Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React Native / Expo Mobile App]
        UI[User Interface - React Native Components]
        Router[Expo Router - Navigation]
        
        subgraph Contexts [State Management]
            AuthCtx[AuthContext - JWT/Session]
            UserCtx[UserContext - Profile]
            ThemeCtx[ThemeContext - UI Styles]
            NotifCtx[NotificationContext]
            ConnCtx[ConnectionContext - Offline Sync]
        end
        
        subgraph APIServices [API Services Layer]
            Client[apiClient - Axios/Fetch Wrapper]
            AuthAPI[auth.ts]
            DonorAPI[donors.ts]
            AlertAPI[alerts.ts]
            ReportAPI[reports.ts]
        end
        
        UI --> Router
        Router --> Contexts
        Contexts --> APIServices
    end

    subgraph Backend [Next.js Backend API]
        subgraph Routes [API Routes /app/api]
            AuthRoutes[/auth/login, /auth/register]
            DonorRoutes[/donors, /donor-registrations]
            AlertRoutes[/alerts]
            ReportRoutes[/reports]
            MsgRoutes[/messages]
        end
        
        subgraph Lib [Middleware & Logic]
            AuthLib[lib/auth.ts - JWT Verify/Hash]
            HttpLib[lib/http.ts - Response Handling]
            DbLib[lib/db.ts - Query Utils]
            ValLib[lib/validation.ts - Zod]
        end
        
        subgraph Database [Storage Layer]
            Turso[(Turso DB - LibSQL/SQLite)]
        end
    end

    %% External Services
    ImagePicker[Expo Image Picker] --> UI
    SecureStore[Expo Secure Store] <--> AuthCtx

    %% Communication Flow
    APIServices -- "HTTPS / JSON / JWT" --> Routes
    Routes --> Lib
    Lib --> Database
    
    %% Authentication Flow
    AuthRoutes -- "Returns JWT" --> AuthAPI
    AuthAPI -- "Stores Token" --> SecureStore
    APIServices -- "Authorization: Bearer <Token>" --> Routes
```

## 1. Frontend Architecture (React Native)
- **Framework:** React Native via Expo (SDK 50+).
- **Navigation:** Expo Router (File-based routing).
- **Persistence:** 
    - `expo-secure-store`: Stores sensitive authentication tokens.
    - `@react-native-async-storage/async-storage`: Stores non-sensitive user preferences and donor profiles.
- **Context API:** Handles global state for authentication, role-based access control (RBAC), and connection status.

## 2. Backend Architecture (Next.js)
- **Framework:** Next.js 14/15 using the App Router.
- **Language:** TypeScript.
- **Authentication:**
    - `bcryptjs`: Password hashing.
    - `jsonwebtoken`: JWT generation and verification.
    - Role-based middleware implemented in `lib/auth.ts` (`requireRole`).

## 3. Database Layer
- **Engine:** Turso (Edge-hosted LibSQL/SQLite).
- **Tables:**
    - `users`: Core authentication data (email, password_hash, role).
    - `donors`: Approved donor profiles.
    - `donor_registrations`: Pending registrations for approval.
    - `alerts`: Blood request alerts.
    - `messages`: Chat/communication data.
    - `notifications`: User-specific notifications.

## 4. Data & Request Flow
1. **Request:** The Mobile App makes an async call via `apiClient`.
2. **Auth:** If the route is protected, the `Authorization` header is attached with the JWT.
3. **Backend Processing:**
    - The request hits a Next.js API route.
    - `lib/auth.ts` validates the JWT and checks the user's role.
    - `lib/validation.ts` (Zod) parses the request body.
    - `lib/turso.ts` executes SQL queries against the database.
4. **Response:** The backend returns a standardized JSON object (via `lib/http.ts`).
5. **Update:** React Contexts update the UI state, triggering a re-render.

## 5. External Integrations
- **Expo Image Picker:** Used for uploading donor profile avatars (base64).
- **LibSQL Client:** Interface for connecting to the Turso database.
