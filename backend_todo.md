✅ TODO 1 — Replace Mock Services with Real API Layer

Refactor the React Native (Expo + TypeScript) project to integrate with a FastAPI backend instead of using mock services and AsyncStorage.

Tasks:

Create a centralized API client using Axios.

Configure baseURL from environment variables.

Implement request/response interceptors.

Automatically attach Authorization: Bearer <access_token> header.

Handle 401 errors by calling /auth/refresh.

If refresh fails, redirect to login screen.

Remove all mocked service files under lib/services.

Output:

api/client.ts

api/auth.ts

api/donors.ts

api/notifications.ts

Proper error handling structure

✅ TODO 2 — Implement Authentication Flow (JWT Based)

Prompt to AI:

Implement full authentication flow using FastAPI endpoints:

POST /auth/login

POST /auth/refresh

POST /auth/logout

Requirements:

On login, store access_token and refresh_token securely (use Expo SecureStore).

Decode JWT to extract user role.

Persist session across app restarts.

Auto-refresh token when expired.

Implement logout by calling /auth/logout and clearing tokens.

Redirect users based on role (admin → dashboard, donor → donor home).

Remove:

AsyncStorage login hacks.

Output:

AuthContext with login/logout/refresh logic

Secure token storage implementation

Protected route wrapper

✅ TODO 3 — Implement User Profile & Preferences Integration

Prompt to AI:

Integrate User & Preferences module using:

GET /users/me

PUT /users/me

PUT /users/me/preferences

Tasks:

On app load, fetch /users/me and store in global context.

Update Settings screen to call /users/me/preferences.

Remove local-only theme persistence.

Sync theme mode (light/dark/system) with backend.

Handle loading and optimistic updates.

Output:

Updated Settings screen

UserContext

API calls with proper types

✅ TODO 4 — Implement Donor Registration Workflow

Prompt to AI:

Refactor registration screen to use:

POST /donor-registrations

Requirements:

Submit form data to backend.

Show success message if status = pending.

Handle validation errors from backend.

Remove AsyncStorage donorProfile logic.

After approval, allow donor to login normally.

Output:

Updated register.tsx

Error handling UI

Loading states

✅ TODO 5 — Implement Donor Search & Management

Prompt to AI:

Replace local donor search with real API calls:

GET /donors

GET /donors/{id}

PATCH /donors/{id}/availability

DELETE /donors/{id}

Requirements:

Implement query-based filtering:

blood_type

municipality

availability

q (search query)

Implement pagination.

Debounce search input.

Update availability via PATCH endpoint.

Soft delete confirmation modal before DELETE.

Remove:

donorService mock.

Output:

Updated search.tsx

Updated DonorManagementScreen

Proper loading + empty states

✅ TODO 6 — Implement Alerts & Notification System

Prompt to AI:

Integrate alert and notification endpoints:

POST /alerts

GET /alerts

POST /alerts/{id}/send

GET /notifications

PATCH /notifications/{id}/read

PATCH /notifications/read-all

Requirements:

Admin: Create alert and optionally trigger send.

Donor: View notifications in inbox.

Show unread badge count.

Optimistically mark notification as read.

Remove mock notificationService.

Output:

Updated send-alerts.tsx

Updated NotificationsScreen

NotificationContext for unread count

✅ TODO 7 — Implement Donations & Requests

Prompt to AI:

Integrate:

POST /donations

GET /donations

POST /requests

GET /requests

Requirements:

Admin logs donation → refresh donor availability.

Show donation history in donor detail screen.

Add request blood form for hospitals.

Implement date filtering.

Output:

Donation form screen

Request form screen

History list UI

✅ TODO 8 — Implement Messaging System

Prompt to AI:

Replace local message simulation with:

POST /messages

GET /messages

Requirements:

Donor sends inquiry to admin.

Admin views inquiries list.

Show message status (open/closed).

Display success/failure feedback.

Output:

Updated DonorDashboard message form

Admin messages screen

✅ TODO 9 — Implement Chatbot Proxy Integration

Prompt to AI:

Replace direct OpenRouter API call with:

POST /chatbot/respond

Requirements:

Remove API key from frontend.

Send chat messages to backend proxy.

Display streaming or full response.

Handle rate limiting errors gracefully.

Output:

Updated chatbot.tsx

Secure proxy integration

✅ TODO 10 — Implement Analytics Integration (Admin)

Prompt to AI:

Integrate reporting endpoints:

GET /reports/summary

GET /reports/blood-type-distribution

GET /reports/availability-trend

Requirements:

Replace reportService mock.

Use real data in charts.

Support date range filter.

Handle loading states.

Output:

Updated ReportsScreen

Real API integration

Chart-ready data mapping

✅ TODO 11 — Global Improvements

Prompt to AI:

Apply the following improvements across the project:

Centralized error handling UI (Toast or Snackbar).

Standardized loading skeletons.

Proper empty states.

API retry strategy.

TypeScript types generated from backend OpenAPI schema.

Environment-based API URLs (dev, staging, prod).

Ensure the app is production-ready and no mock services remain.

If you complete all of these, your app transforms from:

“Frontend prototype with fake data”

into

“Real full-stack blood donor system connected to FastAPI.”
