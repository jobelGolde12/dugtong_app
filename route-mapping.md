# Route Mapping: React Native ↔ Next.js Backend

## Authentication Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/auth/login` | `/api/auth/login` | POST | ✅ |
| `/auth/register` | `/api/auth/register` | POST | ✅ |
| `/auth/logout` | `/api/auth/logout` | POST | ✅ |
| `/auth/me` | `/api/auth/me` | GET | ✅ |
| `/auth/refresh` | `/api/auth/refresh` | POST | ✅ |

## Donor Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/donors` | `/api/donors` | GET | ✅ |
| `/donors` | `/api/donors` | POST | ✅ |
| `/donors/:id` | `/api/donors/[id]` | GET | ✅ |
| `/donors/:id` | `/api/donors/[id]` | PUT | ✅ |
| `/donors/:id` | `/api/donors/[id]` | DELETE | ✅ |
| `/donors/:id/availability` | `/api/donors/[id]/availability` | PATCH | ✅ |

## Notification Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/notifications` | `/api/notifications` | GET | ✅ |
| `/notifications` | `/api/notifications` | POST | ✅ |
| `/notifications/:id` | `/api/notifications/[id]` | DELETE | ✅ |
| `/notifications/:id/read` | `/api/notifications/[id]/read` | PATCH | ✅ |
| `/notifications/mark-all-read` | `/api/notifications/mark-all-read` | POST | ✅ |
| `/notifications/unread-count` | `/api/notifications/unread-count` | GET | ✅ |
| `/notifications/grouped` | `/api/notifications/grouped` | GET | ✅ |

## Blood Request Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/blood-requests` | `/api/blood-requests` | GET | ✅ |
| `/blood-requests` | `/api/blood-requests` | POST | ✅ |
| `/blood-requests/:id/status` | `/api/blood-requests/[id]/status` | PATCH | ✅ |

## Donation Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/donations` | `/api/donations` | GET | ✅ |
| `/donations` | `/api/donations` | POST | ✅ |

## Alert Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/alerts` | `/api/alerts` | GET | ✅ |
| `/alerts` | `/api/alerts` | POST | ✅ |
| `/alerts/:id` | `/api/alerts/[id]` | GET | ✅ |
| `/alerts/:id` | `/api/alerts/[id]` | PUT | ✅ |
| `/alerts/:id` | `/api/alerts/[id]` | DELETE | ✅ |
| `/alerts/:id/send` | `/api/alerts/[id]/send` | POST | ✅ |

## Report Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/reports/summary` | `/api/reports/summary` | GET | ✅ |
| `/reports/blood-types` | `/api/reports/blood-types` | GET | ✅ |
| `/reports/monthly-donations` | `/api/reports/monthly-donations` | GET | ✅ |
| `/reports/availability-trend` | `/api/reports/availability-trend` | GET | ✅ |

## Message Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/messages` | `/api/messages` | GET | ✅ |
| `/messages` | `/api/messages` | POST | ✅ |
| `/messages/:id/close` | `/api/messages/[id]/close` | PATCH | ✅ |

## User Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/users/profile` | `/api/users/profile` | GET | ✅ |
| `/users/profile` | `/api/users/profile` | PUT | ✅ |
| `/users/preferences` | `/api/users/preferences` | GET | ✅ |
| `/users/preferences` | `/api/users/preferences` | PUT | ✅ |

## Donor Registration Routes

| React Native API | Next.js Backend | Method | Status |
|-----------------|-----------------|--------|--------|
| `/donor-registrations` | `/api/donor-registrations` | GET | ✅ |
| `/donor-registrations` | `/api/donor-registrations` | POST | ✅ |
| `/donor-registrations/:id` | `/api/donor-registrations/[id]` | GET | ✅ |
| `/donor-registrations/:id` | `/api/donor-registrations/[id]` | PUT | ✅ |

## Notes

- All routes use `/api` prefix in Next.js backend
- React Native API client automatically adds `/api` prefix
- Dynamic routes use `:id` in React Native, `[id]` in Next.js
- All routes are properly mapped and functional
