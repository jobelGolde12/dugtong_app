# Backend Analysis and API Design (FastAPI)

## Project Overview
The app is a React Native (Expo + TypeScript) blood donor coordination product for Sorsogon Province. It includes donor self-registration, donor search and management, alerts/notifications, reporting dashboards, and a chatbot. State is mostly local (React `useState`) with AsyncStorage for donor profiles and admin donor lists. Services are currently mocked in `lib/services` (donors, notifications, reports). The backend should centralize donor data, provide search/filtering, manage alerts and notifications, and serve analytics.

## App Structure Summary
Screens/pages (app route files)
1. `app/index.tsx` and `app/(tabs)/index.tsx` (welcome/landing)
2. `app/login.tsx` (login)
3. `app/register.tsx` (donor registration)
4. `app/DonorDashboard.tsx` (donor profile + message to admin)
5. `app/AddDonorPage.tsx` (admin add donor)
6. `app/search.tsx` (donor search/browse)
7. `app/donor-management.tsx` -> `app/screens/dashboard/DonorManagementScreen.tsx` (admin donor management)
8. `app/notifications.tsx` -> `app/screens/dashboard/NotificationsScreen.tsx`
9. `app/reports.tsx` -> `app/screens/dashboard/ReportsScreen.tsx`
10. `app/send-alerts.tsx` (admin create alerts)
11. `app/settings.tsx` (profile + theme)
12. `app/map.tsx` (map view)
13. `app/chatbot.tsx` (chatbot via OpenRouter API)
14. `app/(tabs)/explore.tsx` and `app/(tabs)/profile.tsx` (placeholder)
15. `app/dashboard.tsx` (redirect to search)

Key components
1. `app/components/DonorCard.tsx` and `app/components/dashboard/DonorTable.tsx` (donor display)
2. `app/components/dashboard/NotificationItem.tsx` and filter bars (notification display)
3. `app/components/dashboard/ReportCard.tsx` (report display)
4. `app/components/SearchFilters.tsx` (search filters)
5. `app/components/ProfileCard.tsx` and `app/components/ThemeOption.tsx` (settings)
6. `app/components/AIChatBot.tsx` (legacy/alt chatbot UI)

Hooks and state management
1. `hooks/useAppLoading.ts` uses AsyncStorage (`donorProfile`) to decide initial route.
2. `hooks/useSettings.ts` stores profile/theme options in local state only.
3. `contexts/ThemeContext.tsx` provides theme mode and colors in context.
4. AsyncStorage keys used: `donorProfile`, `adminDonors`.

Services (mocked)
1. `lib/services/donorService.ts` provides filtered donor list and availability updates.
2. `lib/services/notificationService.ts` provides notifications and read/delete behavior.
3. `lib/services/reportService.ts` provides report stats and chart data.

## Screen-by-Screen Analysis
### `app/index.tsx` and `app/(tabs)/index.tsx`
Data displayed
1. App name, marketing copy, background image, CTA buttons.
User inputs
1. CTA to continue or register.
API calls
1. None.
CRUD
1. None.

### `app/login.tsx`
Data displayed
1. Login form labels, errors, loading state.
User inputs
1. `fullName`.
2. `contactNumber`.
API calls
1. Simulated login call.
CRUD
1. Read (authentication check).

### `app/register.tsx`
Data displayed
1. Donor registration form labels, validation errors.
User inputs
1. `fullName`, `age`, `sex`, `bloodType`, `contactNumber`, `municipality`, `availabilityStatus`.
API calls
1. Currently saves to AsyncStorage; implies `POST /donors` or `POST /donor-registrations`.
CRUD
1. Create donor profile.

### `app/DonorDashboard.tsx`
Data displayed
1. Donor profile fields from AsyncStorage.
2. Availability status badge.
User inputs
1. Message to admin (`message`).
2. Clear donor data.
API calls
1. Simulated message send; implies `POST /messages`.
CRUD
1. Read donor profile.
2. Create message to admin.
3. Delete donor profile (if allowed).

### `app/AddDonorPage.tsx`
Data displayed
1. Add donor form + errors.
User inputs
1. Same fields as registration.
API calls
1. Currently local; implies admin `POST /donors`.
CRUD
1. Create donor (admin).

### `app/search.tsx`
Data displayed
1. Donor list with name, age, sex, blood type, availability, municipality, last donation date, contact number.
User inputs
1. Search query.
2. Filters: blood type, municipality, status.
3. Long-press actions (call/message) are implied.
API calls
1. None currently; implies `GET /donors` with filters.
CRUD
1. Read donors.

### `app/screens/dashboard/DonorManagementScreen.tsx`
Data displayed
1. Donor list with detailed fields.
2. Stats bar (total, available, etc.).
User inputs
1. Search query.
2. Filters: blood type, municipality, availability.
3. Actions: view details, edit, toggle availability, add donor.
API calls
1. None currently; implies donors CRUD and availability update.
CRUD
1. Read donors.
2. Update donor (edit, availability).
3. Create donor.
4. Delete donor (implied by admin manage).

### `app/screens/dashboard/NotificationsScreen.tsx`
Data displayed
1. Notifications list grouped by time.
2. Unread count.
User inputs
1. Filter chips (all, unread, system, etc.).
2. Search query.
3. Mark all read.
4. Mark single read.
5. Modal actions imply archive/delete/reply.
API calls
1. `notificationService.getNotifications`, `markAsRead`, `markAllAsRead`.
CRUD
1. Read notifications.
2. Update notification read status.
3. Delete/archive (implied).

### `app/screens/dashboard/ReportsScreen.tsx`
Data displayed
1. Report summary stats.
2. Blood type distribution.
3. Monthly donation data.
4. Availability trend.
User inputs
1. Search query.
2. Filters: blood type, municipality, date range.
API calls
1. `reportService.getReportSummary`, `getBloodTypeDistribution`, `getMonthlyDonationData`, `getAvailabilityTrend`.
CRUD
1. Read analytics.

### `app/send-alerts.tsx`
Data displayed
1. Alert form, validation errors.
User inputs
1. Title, message, alert type, target audience, priority, schedule date, location, send now/scheduled.
API calls
1. Simulated; implies `POST /alerts` and notification fan-out.
CRUD
1. Create alert.

### `app/settings.tsx`
Data displayed
1. Profile card (name, email, avatar).
2. Theme options.
User inputs
1. Edit profile (implied navigation).
2. Theme selection.
API calls
1. None; implies `GET/PUT /users/me` and `PUT /users/me/preferences`.
CRUD
1. Read/update user profile and preferences.

### `app/map.tsx`
Data displayed
1. Embedded map of Sorsogon City.
User inputs
1. None.
API calls
1. Google Maps embed (public). Backend not required.
CRUD
1. None.

### `app/chatbot.tsx` and `app/components/AIChatBot.tsx`
Data displayed
1. Chat messages (user and bot).
User inputs
1. Text input, mic toggle.
API calls
1. OpenRouter `POST /chat/completions` with API key from env.
CRUD
1. Create chat message and read response.

## Required Backend Modules/Resources
1. Auth (login, token refresh, role-based access)
2. Users (admin staff and donor accounts)
3. Donors (profiles, availability, status)
4. Donor registration reviews (pending/approved/rejected)
5. Messages (donor -> admin)
6. Alerts (admin -> donors)
7. Notifications (per user, read/archive)
8. Donations (donation events)
9. Blood requests (for analytics and alert targeting)
10. Reports/analytics (aggregate endpoints)
11. Preferences (theme and UI settings)
12. Optional chatbot proxy (to hide OpenRouter API key)

## API Endpoint Table
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /auth/login | Login with name + contact or phone OTP | Public |
| POST | /auth/refresh | Refresh access token | Authenticated |
| POST | /auth/logout | Revoke refresh token | Authenticated |
| GET | /users/me | Get current user profile | Authenticated |
| PUT | /users/me | Update user profile | Authenticated |
| PUT | /users/me/preferences | Update theme/preferences | Authenticated |
| GET | /donors | List donors with filters | Authenticated |
| POST | /donors | Create donor (admin) | Admin |
| GET | /donors/{donor_id} | Get donor detail | Authenticated |
| PATCH | /donors/{donor_id} | Update donor | Admin |
| PATCH | /donors/{donor_id}/availability | Update availability status | Admin |
| DELETE | /donors/{donor_id} | Soft-delete donor | Admin |
| POST | /donor-registrations | Self-register donor (pending) | Public |
| GET | /donor-registrations | List pending registrations | Admin |
| PATCH | /donor-registrations/{id} | Approve/reject | Admin |
| POST | /messages | Donor message to admin | Authenticated (Donor) |
| GET | /messages | List messages | Admin |
| POST | /alerts | Create alert | Admin |
| GET | /alerts | List alerts | Admin |
| GET | /alerts/{id} | Alert detail | Admin |
| POST | /alerts/{id}/send | Send now (fan-out) | Admin |
| GET | /notifications | List notifications | Authenticated |
| PATCH | /notifications/{id}/read | Mark read | Authenticated |
| PATCH | /notifications/read-all | Mark all read | Authenticated |
| DELETE | /notifications/{id} | Delete notification | Authenticated |
| GET | /donations | List donations | Admin |
| POST | /donations | Create donation event | Admin |
| GET | /requests | List blood requests | Admin |
| POST | /requests | Create blood request | Admin |
| GET | /reports/summary | Summary stats | Admin |
| GET | /reports/blood-type-distribution | Blood type counts | Admin |
| GET | /reports/monthly-donations | Monthly donation counts | Admin |
| GET | /reports/availability-trend | Availability trend | Admin |
| POST | /chatbot/respond | Optional proxy to LLM | Authenticated |

## Sample Request/Response Bodies
### POST /auth/login
Request
```json
{
  "full_name": "Jane Dela Cruz",
  "contact_number": "09123456789"
}
```
Response
```json
{
  "access_token": "jwt-access",
  "refresh_token": "jwt-refresh",
  "token_type": "bearer",
  "user": {
    "id": "usr_123",
    "role": "admin",
    "name": "Jane Dela Cruz",
    "contact_number": "09123456789"
  }
}
```

### POST /donor-registrations
Request
```json
{
  "full_name": "Juan Dela Cruz",
  "age": 32,
  "sex": "Male",
  "blood_type": "O+",
  "contact_number": "09123456789",
  "municipality": "Sorsogon City",
  "availability_status": "Available"
}
```
Response
```json
{
  "id": "reg_001",
  "status": "pending",
  "created_at": "2026-02-06T10:15:00Z"
}
```

### GET /donors?blood_type=O%2B&municipality=Sorsogon%20City&availability=Available&q=Juan
Response
```json
{
  "items": [
    {
      "id": "don_001",
      "full_name": "Juan Dela Cruz",
      "age": 32,
      "sex": "Male",
      "blood_type": "O+",
      "contact_number": "09123456789",
      "municipality": "Sorsogon City",
      "availability_status": "Available",
      "last_donation_date": "2024-12-10",
      "date_registered": "2023-01-15"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### PATCH /donors/{donor_id}/availability
Request
```json
{
  "availability_status": "Temporarily Unavailable"
}
```
Response
```json
{
  "id": "don_001",
  "availability_status": "Temporarily Unavailable",
  "updated_at": "2026-02-06T10:30:00Z"
}
```

### POST /alerts
Request
```json
{
  "title": "Urgent Need for O+",
  "message": "Urgent need for O+ blood at Sorsogon General Hospital",
  "alert_type": "urgent",
  "priority": "high",
  "target_audience": ["blood_o", "available"],
  "location": "Sorsogon City",
  "send_now": true
}
```
Response
```json
{
  "id": "alt_001",
  "status": "sent",
  "sent_at": "2026-02-06T10:40:00Z"
}
```

### GET /notifications
Response
```json
{
  "items": [
    {
      "id": "ntf_001",
      "title": "Emergency Request",
      "message": "Urgent need for O+ blood in Sorsogon General Hospital",
      "type": "Emergency",
      "is_read": false,
      "created_at": "2026-02-06T10:45:00Z",
      "data": {"alert_id": "alt_001"}
    }
  ],
  "total": 1
}
```

### GET /reports/summary
Response
```json
{
  "total_donors": 125,
  "available_donors": 87,
  "requests_this_month": 24,
  "successful_donations": 18
}
```

## Suggested Database Schema
### users
1. `id` (PK)
2. `name`
3. `email` (nullable)
4. `contact_number` (unique)
5. `password_hash` (nullable if OTP)
6. `role` (admin, donor)
7. `status` (active, disabled)
8. `created_at`, `updated_at`

### donor_profiles
1. `id` (PK)
2. `user_id` (FK -> users.id, nullable for admin-created)
3. `full_name`
4. `age`
5. `sex`
6. `blood_type`
7. `contact_number`
8. `municipality`
9. `availability_status` (Available, Temporarily Unavailable, Recently Donated)
10. `last_donation_date` (nullable)
11. `status` (pending, approved, rejected)
12. `notes` (nullable)
13. `created_at`, `updated_at`

### donor_registrations
1. `id` (PK)
2. `donor_profile_id` (FK -> donor_profiles.id)
3. `reviewed_by` (FK -> users.id, nullable)
4. `review_status` (pending, approved, rejected)
5. `reviewed_at` (nullable)
6. `created_at`

### messages
1. `id` (PK)
2. `donor_profile_id` (FK -> donor_profiles.id)
3. `admin_user_id` (FK -> users.id, nullable)
4. `message`
5. `status` (open, closed)
6. `created_at`

### alerts
1. `id` (PK)
2. `title`
3. `message`
4. `alert_type` (urgent, reminder, info, event)
5. `priority` (low, medium, high, critical)
6. `target_audience` (JSON criteria)
7. `location` (nullable)
8. `schedule_at` (nullable)
9. `send_now` (bool)
10. `created_by` (FK -> users.id)
11. `status` (draft, scheduled, sent, canceled)
12. `created_at`, `updated_at`

### notifications
1. `id` (PK)
2. `user_id` (FK -> users.id)
3. `title`
4. `message`
5. `type` (Emergency, Update, System)
6. `is_read` (bool)
7. `data` (JSON)
8. `created_at`

### donations
1. `id` (PK)
2. `donor_profile_id` (FK -> donor_profiles.id)
3. `donation_date`
4. `location`
5. `units` (nullable)
6. `status` (completed, canceled)
7. `created_by` (FK -> users.id)
8. `created_at`

### blood_requests
1. `id` (PK)
2. `blood_type`
3. `quantity` (units)
4. `urgency` (low, medium, high, critical)
5. `requested_by` (hospital or org name)
6. `location`
7. `needed_by` (date)
8. `status` (open, fulfilled, closed)
9. `created_at`

### user_preferences
1. `user_id` (PK, FK -> users.id)
2. `theme_mode` (light, dark, system)
3. `updated_at`

Relationships
1. `users` 1 -> 0..1 `donor_profiles` (donor accounts)
2. `donor_profiles` 1 -> many `donations`
3. `alerts` 1 -> many `notifications` (fan-out)
4. `users` 1 -> many `notifications`
5. `donor_profiles` 1 -> many `messages`
6. `users` 1 -> many `messages` (admin replies)

## Validation and Business Logic Notes
1. Normalize and validate Philippine contact numbers (`09XXXXXXXXX`) as in the UI.
2. Enforce age range (1-120) and required fields.
3. Donor registration should default to `pending` and require admin approval before appearing in public search.
4. Availability transitions should be audited and optionally time-limited (e.g., “Recently Donated” for 90 days).
5. Alerts should validate target audience and schedule times; scheduled alerts must be processed by a background worker.
6. Notifications should be generated from alerts, donor status changes, and admin messages.
7. Reports should be queryable by date range, municipality, and blood type; prefer pre-aggregated views for scale.
8. Soft-delete donors and notifications to preserve audit history.
9. Protect donor PII; restrict read access to admin and authorized staff.
10. Implement rate limits for login and chatbot proxy endpoints.
