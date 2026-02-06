# Blood Donor App - Full Stack Implementation TODO

## Project Overview

Transform the React Native (Expo + TypeScript) blood donor app from a frontend prototype with mock data into a real full-stack application connected to a FastAPI backend.

---

## ✅ Phase 1 — Core Infrastructure (Already Implemented) ✅

### TODO 1.1 — API Client Setup

- [x] Install axios and configure base client
- [x] Configure baseURL from environment variables
- [x] Implement request/response interceptors
- [x] Automatically attach Authorization: Bearer <access_token> header
- [x] Handle 401 errors by calling /auth/refresh
- [x] Redirect to login if refresh fails
- [x] Remove all mocked service files under lib/services

**Output:**

- [x] `api/client.ts`
- [x] `api/auth.ts`
- [x] Proper error handling structure

### TODO 1.2 — Authentication Flow (JWT Based)

- [x] Implement login/logout/refresh with FastAPI endpoints
- [x] Store access_token and refresh_token securely (SecureStore)
- [x] Decode JWT to extract user role
- [x] Persist session across app restarts
- [x] Auto-refresh token when expired
- [x] Redirect users based on role (admin → dashboard, donor → donor home)
- [x] Remove AsyncStorage login hacks

**Output:**

- [x] AuthContext with login/logout/refresh logic
- [x] Secure token storage implementation
- [x] Protected route wrapper

---

## 🔄 Phase 2 — Core Features (Pending)

### TODO 2.1 — User Profile & Preferences Integration

- [x] Integrate GET /users/me and PUT /users/me
- [x] Integrate PUT /users/me/preferences
- [x] On app load, fetch /users/me and store in global context
- [x] Update Settings screen to call /users/me/preferences
- [x] Remove local-only theme persistence
- [x] Sync theme mode (light/dark/system) with backend
- [x] Handle loading and optimistic updates

**Output:**

- [x] Updated Settings screen
- [x] UserContext
- [x] API calls with proper types

### TODO 2.2 — Donor Registration Workflow

- [x] Refactor registration screen to use POST /donor-registrations
- [x] Submit form data to backend
- [x] Show success message if status = pending
- [x] Handle validation errors from backend
- [x] Remove AsyncStorage donorProfile logic
- [x] After approval, allow donor to login normally

**Output:**

- [x] Updated register.tsx
- [x] Error handling UI
- [x] Loading states

### TODO 2.3 — Donor Search & Management

- [ ] Replace local donor search with real API calls
- [ ] Implement GET /donors with query-based filtering:
  - [ ] blood_type
  - [ ] municipality
  - [ ] availability
  - [ ] q (search query)
- [ ] Implement pagination
- [ ] Debounce search input
- [ ] Update availability via PATCH endpoint
- [ ] Soft delete confirmation modal before DELETE
- [ ] Remove donorService mock

**Output:**

- [ ] Updated search.tsx
- [ ] Updated DonorManagementScreen
- [ ] Proper loading + empty states
- [ ] api/donors.ts

---

## 🔄 Phase 3 — Notifications & Admin (Pending)

### TODO 3.1 — Alerts & Notification System

- [ ] Integrate POST /alerts
- [ ] Integrate GET /alerts
- [ ] Integrate POST /alerts/{id}/send
- [ ] Integrate GET /notifications
- [ ] Integrate PATCH /notifications/{id}/read
- [ ] Integrate PATCH /notifications/read-all
- [ ] Admin: Create alert and optionally trigger send
- [ ] Donor: View notifications in inbox
- [ ] Show unread badge count
- [ ] Optimistically mark notification as read
- [ ] Remove mock notificationService

**Output:**

- [ ] Updated send-alerts.tsx
- [ ] Updated NotificationsScreen
- [ ] NotificationContext for unread count
- [ ] api/notifications.ts

### TODO 3.2 — Donations & Requests

- [ ] Integrate POST /donations
- [ ] Integrate GET /donations
- [ ] Integrate POST /requests
- [ ] Integrate GET /requests
- [ ] Admin logs donation → refresh donor availability
- [ ] Show donation history in donor detail screen
- [ ] Add request blood form for hospitals
- [ ] Implement date filtering

**Output:**

- [ ] Donation form screen
- [ ] Request form screen
- [ ] History list UI
- [ ] api/donations.ts
- [ ] api/requests.ts

### TODO 3.3 — Messaging System

- [ ] Replace local message simulation with POST /messages
- [ ] Replace GET /messages endpoint
- [ ] Donor sends inquiry to admin
- [ ] Admin views inquiries list
- [ ] Show message status (open/closed)
- [ ] Display success/failure feedback

**Output:**

- [ ] Updated DonorDashboard message form
- [ ] Admin messages screen
- [ ] api/messages.ts

### TODO 3.4 — Analytics Integration (Admin)

- [ ] Integrate GET /reports/summary
- [ ] Integrate GET /reports/blood-type-distribution
- [ ] Integrate GET /reports/availability-trend
- [ ] Replace reportService mock
- [ ] Use real data in charts
- [ ] Support date range filter
- [ ] Handle loading states

**Output:**

- [ ] Updated ReportsScreen
- [ ] Real API integration
- [ ] Chart-ready data mapping
- [ ] api/reports.ts

---

## 🔄 Phase 4 — Integrations & Polish (Pending)

### TODO 4.1 — Chatbot Proxy Integration

- [ ] Replace direct OpenRouter API call with POST /chatbot/respond
- [ ] Remove API key from frontend
- [ ] Send chat messages to backend proxy
- [ ] Display streaming or full response
- [ ] Handle rate limiting errors gracefully

**Output:**

- [ ] Updated chatbot.tsx
- [ ] Secure proxy integration

### TODO 4.2 — Global Improvements

- [ ] Centralized error handling UI (Toast or Snackbar)
- [ ] Standardized loading skeletons
- [ ] Proper empty states
- [ ] API retry strategy
- [ ] TypeScript types generated from backend OpenAPI schema
- [ ] Environment-based API URLs (dev, staging, prod)
- [ ] Ensure no mock services remain

**Output:**

- [ ] ErrorToast component
- [ ] LoadingSkeleton component
- [ ] EmptyState component
- [ ] api/retry.ts
- [ ] Updated types/ folder

---

## File Structure (After Implementation)

```
app/
├── api/
│   ├── client.ts           # Axios client with interceptors
│   ├── auth.ts             # Authentication endpoints
│   ├── donors.ts           # Donor CRUD endpoints
│   ├── notifications.ts    # Notification endpoints
│   ├── alerts.ts           # Alert endpoints
│   ├── messages.ts         # Message endpoints
│   ├── donations.ts        # Donation endpoints
│   ├── requests.ts          # Blood request endpoints
│   ├── reports.ts          # Report endpoints
│   └── chatbot.ts          # Chatbot proxy endpoint
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   ├── UserContext.tsx     # User profile state
│   ├── ThemeContext.tsx     # Theme state
│   └── NotificationContext.tsx # Notification state
├── components/
│   ├── LoadingSkeleton.tsx
│   ├── ErrorToast.tsx
│   └── ...
├── lib/
│   └── utils/
│       └── retry.ts        # API retry utility
├── types/
│   ├── api.ts              # API response types
│   └── ...
└── ...
```

---

## Success Criteria

The app will transform from:
❌ "Frontend prototype with fake data"

Into:
✅ "Real full-stack blood donor system connected to FastAPI"

---

## Progress Tracking

| Phase                          | Status         | Completion Date |
| ------------------------------ | -------------- | --------------- |
| Phase 1: Core Infrastructure   | ✅ Complete    | -               |
| Phase 2: Core Features         | 🔄 In Progress | -               |
| Phase 3: Notifications & Admin | ⏳ Pending     | -               |
| Phase 4: Integrations & Polish | ⏳ Pending     | -               |

---

## Notes

- All API endpoints documented in `backend_info.md`
- Mock services to be removed after real implementation
- Ensure proper error handling for offline scenarios
- Consider implementing offline queue for critical operations
