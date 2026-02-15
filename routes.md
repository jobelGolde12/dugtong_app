# Application Routes and Turso Database Interactions

This document outlines the API endpoints (Turso database interactions) and the role-based access control rules implemented in the application.

## 🗄️ Turso Database Interactions (API Endpoints)

The application interacts with the Turso database primarily through SQL queries executed via `src/lib/database-api.ts`. The following are the significant database operations identified from the `api/` directory, serving as the application's "routes" for data manipulation and retrieval.

---

### `api/users.ts`

*   **`getUserProfile`**
    *   **Description**: Retrieves a user's profile from the `users` table.
    *   **SQL**: `SELECT * FROM users WHERE id = ?`
*   **`getUserPreferences`**
    *   **Description**: Retrieves user preferences from the `user_preferences` table. If not found, inserts default preferences.
    *   **SQL**: `SELECT * FROM user_preferences WHERE user_id = ?`
    *   **SQL (Conditional)**: `INSERT INTO user_preferences (...) VALUES (...)`
*   **`updateUserProfile`**
    *   **Description**: Updates a user's profile in the `users` table.
    *   **SQL**: `UPDATE users SET ... WHERE id = ?`
*   **`updateUserPreferences`**
    *   **Description**: Inserts default preferences if they don't exist, then updates user preferences in the `user_preferences` table.
    *   **SQL**: `INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)`
    *   **SQL**: `UPDATE user_preferences SET ... WHERE user_id = ?`

---

### `api/donations.ts`

*   **`donationsApi.getDonations`**
    *   **Description**: Retrieves all donations, ordered by `donation_date` descending.
    *   **SQL**: `SELECT * FROM donations ORDER BY donation_date DESC`
*   **`donationsApi.createDonation`**
    *   **Description**: Inserts a new donation into the `donations` table, then retrieves the newly created donation.
    *   **SQL**: `INSERT INTO donations (...) VALUES (?, ?, ?, ?, ?)`
    *   **SQL**: `SELECT * FROM donations WHERE id = ?`
*   **`donationsApi.getBloodRequests`**
    *   **Description**: Retrieves all blood requests, ordered by `created_at` descending.
    *   **SQL**: `SELECT * FROM blood_requests ORDER BY created_at DESC`
*   **`donationsApi.createBloodRequest`**
    *   **Description**: Inserts a new blood request into the `blood_requests` table with a default 'pending' status, then retrieves the newly created request.
    *   **SQL**: `INSERT INTO blood_requests (...) VALUES (?, ?, ?, ?, ?, ?, ?)`
    *   **SQL**: `SELECT * FROM blood_requests WHERE id = ?`

---

### `api/donors.ts`

*   **`donorApi.getDonors`**
    *   **Description**: Retrieves a paginated list of donors based on filters (blood type, municipality, availability, search query) and their total count.
    *   **SQL**: `SELECT * FROM donors WHERE is_deleted = 0 [AND ...] ORDER BY created_at DESC LIMIT ? OFFSET ?`
    *   **SQL**: `SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0 [AND ...]`
*   **`donorApi.getDonor`**
    *   **Description**: Retrieves a single donor by ID.
    *   **SQL**: `SELECT * FROM donors WHERE id = ? AND is_deleted = 0`
*   **`donorApi.createDonor`**
    *   **Description**: Inserts a new donor into the `donors` table, then retrieves the newly created donor.
    *   **SQL**: `INSERT INTO donors (...) VALUES (?, ..., ?)`
    *   **SQL**: `SELECT * FROM donors WHERE id = ?`
*   **`donorApi.updateDonor`**
    *   **Description**: Updates an existing donor's information in the `donors` table.
    *   **SQL**: `UPDATE donors SET ... WHERE id = ? AND is_deleted = 0`
*   **`donorApi.updateAvailability`**
    *   **Description**: Updates the `availability_status` of a donor.
    *   **SQL**: `UPDATE donors SET availability_status = ? WHERE id = ? AND is_deleted = 0`
*   **`donorApi.deleteDonor`**
    *   **Description**: Marks a donor as deleted by setting `is_deleted = 1`.
    *   **SQL**: `UPDATE donors SET is_deleted = 1 WHERE id = ?`

---

### `api/donor-registrations.ts`

*   **`createDonorRegistration`**
    *   **Description**: Inserts a new donor registration into the `donor_registrations` table and retrieves the newly created registration.
    *   **SQL**: `INSERT INTO donor_registrations (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    *   **SQL**: `SELECT * FROM donor_registrations WHERE id = ?`
*   **`getDonorRegistration`**
    *   **Description**: Retrieves a single donor registration by ID (for admin use).
    *   **SQL**: `SELECT * FROM donor_registrations WHERE id = ?`
*   **`getDonorRegistrations`**
    *   **Description**: Retrieves a paginated and filtered list of donor registrations (for admin use).
    *   **SQL**: `SELECT * FROM donor_registrations [WHERE ...] ORDER BY created_at DESC LIMIT ? OFFSET ?`
*   **`updateDonorRegistrationStatus`**
    *   **Description**: Updates the status of a donor registration and, if approved, creates a new donor record.
    *   **SQL**: `UPDATE donor_registrations SET status = ?, updated_at = ? WHERE id = ?`
*   **`deleteDonorRegistration`**
    *   **Description**: Deletes a donor registration by ID.
    *   **SQL**: `DELETE FROM donor_registrations WHERE id = ?`

---

### `api/alerts.ts`

*   **`alertApi.createAlert`**
    *   **Description**: Inserts a new alert into the `alerts` table and retrieves the newly created alert.
    *   **SQL**: `INSERT INTO alerts (...) VALUES (?, ..., ?)`
    *   **SQL**: `SELECT * FROM alerts WHERE id = ?`
*   **`alertApi.getAlerts`**
    *   **Description**: Retrieves a paginated list of alerts and their total count.
    *   **SQL**: `SELECT * FROM alerts ORDER BY created_at DESC LIMIT ? OFFSET ?`
    *   **SQL**: `SELECT COUNT(*) as count FROM alerts`
*   **`alertApi.getAlert`**
    *   **Description**: Retrieves a single alert by ID.
    *   **SQL**: `SELECT * FROM alerts WHERE id = ?`
*   **`alertApi.sendAlert`**
    *   **Description**: Updates the status and `sent_at` timestamp for a given alert.
    *   **SQL**: `UPDATE alerts SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?`

---

### `api/auth.ts`

*   **`login`**
    *   **Description**: Authenticates a user by checking `full_name` and `contact_number` in the `users` table. If the user doesn't exist, it creates a new user with a "donor" role.
    *   **SQL**: `SELECT * FROM users WHERE full_name = ? AND contact_number = ?`
    *   **SQL (Conditional)**: `INSERT INTO users (full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?)`
    *   **SQL**: `SELECT * FROM users WHERE id = ?`
*   **`refreshToken`**
    *   **Description**: Retrieves user information from the `users` table based on a user ID extracted from the access token to refresh authentication.
    *   **SQL**: `SELECT * FROM users WHERE id = ?`
*   **`getCurrentUser`**
    *   **Description**: Retrieves user information from the `users` table based on a user ID extracted from the access token.
    *   **SQL**: `SELECT * FROM users WHERE id = ?`

---

### `api/messages.ts`

*   **`messageApi.sendMessage`**
    *   **Description**: Inserts a new message into the `messages` table and retrieves the newly created message along with sender details.
    *   **SQL**: `INSERT INTO messages (...) VALUES (?, ?, ?, ?, ?, ?)`
    *   **SQL**: `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.id = ?`
*   **`messageApi.getMessages`**
    *   **Description**: Retrieves a paginated and filtered list of messages along with sender details and their total count.
    *   **SQL**: `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id [WHERE ...] ORDER BY m.created_at DESC LIMIT ? OFFSET ?`
    *   **SQL**: `SELECT COUNT(*) as count FROM messages m [WHERE ...]`
*   **`messageApi.closeMessage`**
    *   **Description**: Marks a message as closed (`is_closed = 1`) and updates the `updated_at` timestamp, then retrieves the updated message.
    *   **SQL**: `UPDATE messages SET is_closed = 1, updated_at = ? WHERE id = ?`
    *   **SQL**: `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.id = ?`

---

### `api/notifications.ts`

*   **`getNotifications`**
    *   **Description**: Retrieves a paginated and filtered list of notifications, along with total and unread counts.
    *   **SQL**: `SELECT * FROM notifications [WHERE ...] ORDER BY created_at DESC LIMIT ? OFFSET ?`
    *   **SQL**: `SELECT COUNT(*) as count FROM notifications [WHERE ...]`
    *   **SQL**: `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0`
*   **`getNotificationById`**
    *   **Description**: Retrieves a single notification by ID.
    *   **SQL**: `SELECT * FROM notifications WHERE id = ?`
*   **`markAsRead`**
    *   **Description**: Marks a single notification as read.
    *   **SQL**: `UPDATE notifications SET is_read = 1 WHERE id = ?`
*   **`markAllAsRead`**
    *   **Description**: Marks all notifications as read.
    *   **SQL**: `UPDATE notifications SET is_read = 1`
*   **`deleteNotification`**
    *   **Description**: Deletes a single notification by ID.
    *   **SQL**: `DELETE FROM notifications WHERE id = ?`
*   **`deleteAllNotifications`**
    *   **Description**: Deletes all notifications.
    *   **SQL**: `DELETE FROM notifications`
*   **`getUnreadCount`**
    *   **Description**: Retrieves the count of unread notifications.
    *   **SQL**: `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0`
*   **`getGroupedNotifications`**
    *   **Description**: Retrieves all notifications, ordered by creation date, and groups them into "today", "yesterday", and "earlier".
    *   **SQL**: `SELECT * FROM notifications ORDER BY created_at DESC`

---

### `api/reports.ts`

*   **`reportsApi.getSummary`**
    *   **Description**: Retrieves various summary statistics (total donors, available donors, blood requests this month, successful donations).
    *   **SQL**: `SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0`
    *   **SQL**: `SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0 AND availability_status = 'Available'`
    *   **SQL**: `SELECT COUNT(*) as count FROM blood_requests WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    *   **SQL**: `SELECT COUNT(*) as count FROM donations`
*   **`reportsApi.getBloodTypeDistribution`**
    *   **Description**: Retrieves the count of donors for each blood type.
    *   **SQL**: `SELECT blood_type as bloodType, COUNT(*) as count FROM donors WHERE is_deleted = 0 GROUP BY blood_type`
*   **`reportsApi.getMonthlyDonations`**
    *   **Description**: Retrieves the count of donations per month.
    *   **SQL**: `SELECT strftime('%Y-%m', donation_date) as month, COUNT(*) as donations FROM donations GROUP BY month ORDER BY month`
*   **`reportsApi.getAvailabilityTrend`**
    *   **Description**: Retrieves the trend of available and unavailable donors over the last 30 days.
    *   **SQL**: `SELECT date(created_at) as date, SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as availableCount, SUM(CASE WHEN availability_status != 'Available' THEN 1 ELSE 0 END) as unavailableCount FROM donors WHERE is_deleted = 0 AND date(created_at) >= date('now', '-30 day') GROUP BY date(created_at) ORDER BY date(created_at)`

## 🔐 Role-Based Access Control (RBAC)

This section details the user roles and the navigation/feature access rules associated with each role, as defined in `role-base.md` and implemented in `app/utils/roleNavigation.ts` and `app/components/RoleGuard.tsx`.

### Supported User Roles

*   **`admin`**: Has full access to all features and administrative functions.
*   **`donor`**: The default role for general users. Primarily focuses on personal information, messaging, and donation-related activities.
*   **`hospital_staff`**: Role for hospital personnel who need to manage donors and blood requests.
*   **`health_officer`**: Role for health officials responsible for monitoring and reporting.

### Screen Access Matrix

The following table summarizes which screens/features each role can access:

| Screen             | Admin | Donor | Hospital Staff | Health Officer |
| :----------------- | :---- | :---- | :------------- | :------------- |
| Dashboard          | ✅    | ❌    | ✅             | ✅             |
| DonorDashboard     | ❌    | ✅    | ❌             | ❌             |
| Search             | ✅    | ❌    | ✅             | ✅             |
| Reports            | ✅    | ❌    | ❌             | ✅             |
| Donor Management   | ✅    | ❌    | ✅             | ❌             |
| Chatbot (AI)       | ✅    | ❌    | ❌             | ❌             |
| Notifications      | ✅    | ❌    | ✅             | ✅             |
| Settings           | ✅    | ✅    | ✅             | ✅             |

### Role-Specific Navigation Rules (from `app/utils/roleNavigation.ts`)

These are the conceptual navigation paths and their associated allowed roles:

*   `/search`: `admin`, `hospital_staff`, `health_officer`
*   `/reports`: `admin`, `health_officer`
*   `/donor-management`: `admin`, `hospital_staff`
*   `/chatbot`: `admin`
*   `/notifications`: `admin`, `hospital_staff`, `health_officer`
*   `/settings`: `admin`, `hospital_staff`, `health_officer`, `donor`
*   `/DonorDashboard`: `donor`
*   `/dashboard`: `admin`, `hospital_staff`, `health_officer`

### Role-Specific Flows

#### 🩸 Donor Flow
*   **Login → Donor Dashboard**
*   **Features**: View Donor Information, Leave Message to Admin, Delete Donor Data.

#### 🛠 Admin Flow
*   **Login → Admin Dashboard**
*   **Features**: View Reports, Find Donors, Manage Donors, Access Dugtong Bot (AI), Send Notifications, Settings.

#### 🏥 Hospital Staff Flow
*   **Login → Hospital Dashboard**
*   **Features**: Search Donors, View Donor Profiles, Send Blood Request Notifications, Update Request Status.

#### 🏢 Health Officer Flow
*   **Login → Health Officer Dashboard**
*   **Features**: View Donor List by Municipality, Monitor Donor Availability, Send Notifications to Donors, Generate Simple Reports.

---

This document provides a comprehensive overview of how the application handles data persistence via Turso and how user access to various features is managed through role-based controls.


---

## 📡 API Request/Response Specifications

This section documents the exact data structures expected by each API endpoint, based on the React Native app implementation.

### Authentication APIs

#### POST `/api/auth/login`
**Used in**: `app/login.tsx`

**Request Body**:
```json
{
  "full_name": "Juan Dela Cruz",
  "contact_number": "09123456789"
}
```

**Expected Response**:
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "role": "donor",
    "name": "Juan Dela Cruz",
    "contact_number": "09123456789",
    "email": "optional@email.com",
    "avatar_url": "optional_url"
  }
}
```

#### POST `/api/auth/register`
**Used in**: `app/register.tsx`

**Request Body**:
```json
{
  "full_name": "Juan Dela Cruz",
  "contact_number": "09123456789",
  "email": "optional@email.com"
}
```

**Expected Response**: Same as login response

#### GET `/api/auth/me`
**Used in**: `contexts/AuthContext.tsx`

**Headers**: `Authorization: Bearer {token}`

**Expected Response**:
```json
{
  "user": {
    "id": "1",
    "role": "donor",
    "name": "Juan Dela Cruz",
    "contact_number": "09123456789",
    "email": "optional@email.com",
    "avatar_url": "optional_url"
  }
}
```

---

### Donor APIs

#### GET `/api/donors`
**Used in**: `app/search.tsx`, `app/components/dashboard/StatsGrid.tsx`, `app/screens/dashboard/DonorManagementScreen.tsx`

**Query Parameters**:
- `bloodType` (optional): Filter by blood type (e.g., "A+", "O-")
- `municipality` (optional): Filter by municipality
- `availability` (optional): Filter by availability status
- `search` (optional): Search query for name/contact/municipality
- `page` (optional): Page number (default: 0)
- `page_size` (optional): Items per page (default: 50)

**Example**: `/api/donors?bloodType=A+&municipality=Manila&page=0&page_size=50`

**Expected Response**:
```json
{
  "items": [
    {
      "id": "1",
      "name": "Juan Dela Cruz",
      "age": 25,
      "sex": "Male",
      "bloodType": "A+",
      "contactNumber": "09123456789",
      "municipality": "Manila",
      "availabilityStatus": "Available",
      "lastDonationDate": "2024-01-15",
      "dateRegistered": "2024-01-01T00:00:00Z",
      "notes": "Optional notes"
    }
  ],
  "total": 100,
  "page": 0,
  "page_size": 50
}
```

#### GET `/api/donors/:id`
**Used in**: `app/components/dashboard/StatsGrid.tsx`

**Headers**: `Authorization: Bearer {token}`

**Expected Response**:
```json
{
  "donor": {
    "id": "1",
    "name": "Juan Dela Cruz",
    "age": 25,
    "sex": "Male",
    "bloodType": "A+",
    "contactNumber": "09123456789",
    "municipality": "Manila",
    "availabilityStatus": "Available",
    "lastDonationDate": "2024-01-15",
    "dateRegistered": "2024-01-01T00:00:00Z",
    "notes": "Optional notes"
  }
}
```

#### POST `/api/donors`
**Used in**: `app/AddDonorPage.tsx`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "name": "Juan Dela Cruz",
  "age": 25,
  "sex": "Male",
  "bloodType": "A+",
  "contactNumber": "09123456789",
  "municipality": "Manila",
  "availabilityStatus": "Available",
  "lastDonationDate": "2024-01-15",
  "notes": "Optional notes"
}
```

**Expected Response**:
```json
{
  "donor": {
    "id": "1",
    "name": "Juan Dela Cruz",
    "age": 25,
    "sex": "Male",
    "bloodType": "A+",
    "contactNumber": "09123456789",
    "municipality": "Manila",
    "availabilityStatus": "Available",
    "lastDonationDate": "2024-01-15",
    "dateRegistered": "2024-01-01T00:00:00Z",
    "notes": "Optional notes"
  }
}
```

#### PATCH `/api/donors/:id/availability`
**Used in**: `app/screens/dashboard/DonorManagementScreen.tsx`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "availabilityStatus": "Temporarily Unavailable"
}
```

**Expected Response**:
```json
{
  "donor": {
    "id": "1",
    "availabilityStatus": "Temporarily Unavailable",
    ...
  }
}
```

---

### Alert APIs

#### POST `/api/alerts`
**Used in**: `app/send-alerts.tsx`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "blood_type": "A+",
  "municipality": "Manila",
  "urgency": "high",
  "message": "Urgent need for A+ blood donors",
  "contact_info": "09123456789",
  "created_by": "user_id",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Expected Response**:
```json
{
  "alert": {
    "id": "1",
    "blood_type": "A+",
    "municipality": "Manila",
    "urgency": "high",
    "message": "Urgent need for A+ blood donors",
    "contact_info": "09123456789",
    "created_by": "user_id",
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z",
    "is_active": true
  }
}
```

---

### Blood Request APIs

#### GET `/api/blood-requests`
**Used in**: `app/components/dashboard/StatsGrid.tsx`

**Query Parameters**:
- `blood_type` (optional): Filter by blood type
- `urgency` (optional): Filter by urgency level
- `status` (optional): Filter by status
- `month` (optional): Filter by month (YYYY-MM format)
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset

**Example**: `/api/blood-requests?month=2024-01&limit=50`

**Expected Response**:
```json
{
  "requests": [
    {
      "id": "1",
      "requester_name": "Hospital Name",
      "blood_type": "A+",
      "urgency": "high",
      "location": "Manila",
      "contact_number": "09123456789",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "notes": "Optional notes"
    }
  ]
}
```

---

### Donation APIs

#### GET `/api/donations`
**Used in**: `app/components/dashboard/StatsGrid.tsx`

**Query Parameters**:
- `donor_id` (optional): Filter by donor ID
- `blood_type` (optional): Filter by blood type
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset

**Expected Response**:
```json
{
  "donations": [
    {
      "id": "1",
      "donor_id": "1",
      "donation_date": "2024-01-15",
      "blood_type": "A+",
      "quantity_ml": 450,
      "location": "Red Cross Manila",
      "notes": "Optional notes",
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### Notification APIs

#### GET `/api/notifications`
**Used in**: `contexts/NotificationContext.tsx`

**Query Parameters**:
- `user_id` (optional): Filter by user ID
- `is_read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by notification type
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset

**Expected Response**:
```json
{
  "notifications": [
    {
      "id": "1",
      "user_id": "1",
      "title": "Blood Request Alert",
      "message": "Urgent need for A+ blood donors in Manila",
      "type": "blood_request",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z",
      "metadata": {}
    }
  ]
}
```

#### PATCH `/api/notifications/:id/read`
**Used in**: `contexts/NotificationContext.tsx`

**Headers**: `Authorization: Bearer {token}`

**Expected Response**:
```json
{
  "notification": {
    "id": "1",
    "is_read": true,
    ...
  }
}
```

#### POST `/api/notifications/mark-all-read`
**Used in**: `contexts/NotificationContext.tsx`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "userId": "1"
}
```

**Expected Response**: `204 No Content` or `200 OK`

---

### Donor Registration APIs

#### GET `/api/donor-registrations`
**Used in**: `app/screens/dashboard/DonorManagementScreen.tsx`

**Query Parameters**:
- `status` (optional): Filter by status (pending/approved/rejected)
- `municipality` (optional): Filter by municipality
- `blood_type` (optional): Filter by blood type
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset

**Expected Response**:
```json
{
  "registrations": [
    {
      "id": "1",
      "full_name": "Juan Dela Cruz",
      "age": 25,
      "sex": "Male",
      "blood_type": "A+",
      "contact_number": "09123456789",
      "municipality": "Manila",
      "availability_status": "Available",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### PATCH `/api/donor-registrations/:id/status`
**Used in**: `app/screens/dashboard/DonorManagementScreen.tsx`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "status": "approved"
}
```

**Expected Response**:
```json
{
  "registration": {
    "id": "1",
    "status": "approved",
    "updated_at": "2024-01-01T00:00:00Z",
    ...
  }
}
```

---

### Report APIs

#### GET `/api/reports`
**Used in**: `app/screens/dashboard/ReportsScreen.tsx`

**Query Parameters**:
- `start_date` (optional): Report start date
- `end_date` (optional): Report end date

**Expected Response**:
```json
{
  "totalDonors": 100,
  "activeDonors": 80,
  "totalDonations": 50,
  "donationsByBloodType": {
    "A+": 20,
    "O+": 15,
    "B+": 10,
    "AB+": 5
  },
  "donationsByMonth": [
    {
      "month": "2024-01",
      "count": 10
    }
  ],
  "donorsByMunicipality": {
    "Manila": 30,
    "Quezon City": 25,
    "Makati": 20
  }
}
```

---

### User APIs

#### GET `/api/users/:id`
**Used in**: `api/auth.ts`

**Headers**: `Authorization: Bearer {token}`

**Expected Response**:
```json
{
  "user": {
    "id": "1",
    "role": "donor",
    "name": "Juan Dela Cruz",
    "contact_number": "09123456789",
    "email": "optional@email.com",
    "avatar_url": "optional_url"
  }
}
```

---

## 🔒 Authentication Requirements

All API endpoints except `/api/auth/login` and `/api/auth/register` require:

**Header**: `Authorization: Bearer {jwt_token}`

The JWT token is obtained from the login/register response and stored securely using `expo-secure-store`.

---

## ⚠️ Error Response Format

All API errors should follow this format:

```json
{
  "message": "Error description",
  "error": "Optional error code",
  "details": "Optional additional details"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
