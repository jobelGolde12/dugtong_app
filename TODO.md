# PROJECT CONTEXT & TASK PROMPT (UPDATED)

## Task Objective

Debug and fix the 404 error during admin login by ensuring the API endpoints in your React Native app correctly match the existing routes in your Next.js backend, which is deployed on Vercel. Do not modify any existing UI/design.

## Project Structure

- **React Native App (Current Directory)**: Your frontend mobile application.
- **Next.js Backend (../dugtong-nextjs)**: Your backend project, already deployed and connected to a Turso database.
- **Base URL in React Native**: `EXPO_PUBLIC_API_BASE_URL=https://dugtung-next.vercel.app/api`

## Current Issue Analysis

When the admin tries to log in, the app receives an HTML 404 error page. This happens because the React Native app is making a request to an API endpoint that does not exist on your deployed backend.

The base URL `https://dugtung-next.vercel.app/api` itself returns a 404. This tells us two critical things:

1.  The root `/api` path on your Vercel deployment does not have a default route, which is normal.
2.  **Your AI agent must verify if the _specific_ endpoints for login and registration exist. For example, if your React Native app is calling `https://dugtung-next.vercel.app/api/auth/login`, but your Next.js project only has an endpoint at `https://dugtung-next.vercel.app/api/login`, you will get this exact 404 error.**

## Updated Requirements for AI Agent

### 1. Analyze Endpoint Mismatch

- **In React Native project:** Find all authentication-related API calls. Extract the **exact full paths** being used for login and registration (e.g., `/auth/login`, `/users/register`, `/login`).
- **In Next.js project (../dugtong-nextjs):** List all existing API route files. Pay close attention to the folder structure inside `pages/api/` or `app/api/`. Determine the **exact paths** as defined by your Next.js file structure (e.g., `pages/api/login.js` creates `/api/login`, `app/api/auth/login/route.js` creates `/api/auth/login`).

### 2. Create an Endpoint Mapping Table

| React Native Called Path | Should Map To (Actual Next.js Path) | Status           |
| :----------------------- | :---------------------------------- | :--------------- |
| `/login`                 | `/login` or `/auth/login`?          | Mismatch/Pending |
| `/register`              | `/register` or `/users/register`?   | Mismatch/Pending |

### 3. Implement the Fix

**Constraint: Do NOT change any UI code. Only modify the URL strings in your API service/fetch calls.**

- If the Next.js paths are correct (e.g., `/api/login` exists) but React Native is calling a different path (e.g., `/api/auth/login`), update the React Native code to use the correct path.
- If the Next.js backend is missing the required endpoints, you will need to create them, ensuring they work with your existing Turso database logic.

### 4. Testing After Fix

- **Login Test:** Attempt an admin login and confirm you receive a JSON response (not an HTML 404 page) and successful authentication.
- **Network Verification:** Use React Native debugging tools to check the Network tab and confirm the exact URL being called returns a 200 OK status.

## Success Criteria

- [ ] Login and registration API calls return JSON responses, not HTML.
- [ ] All UI and visual designs remain completely unchanged.
- [ ] The Turso database integration works correctly for authentication.
