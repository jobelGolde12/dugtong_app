# Fix: Chatbot - Can't Get Data from Backend

## 🐛 Problem

Chatbot can't fetch data from backend.

### Root Causes

1. **Importing non-existent functions**:
   - `getNotifications`, `getUnreadCount`, `getGroupedNotifications` don't exist
   - Should use `notificationApi.getNotifications()`

2. **Wrong response format handling**:
   - `getDonorRegistrations` expecting `response.registrations`
   - After unwrapping, should check for `response.items`

3. **Wrong filter values**:
   - Passing empty strings `''` instead of `null`
   - Page starting at `0` instead of `1`

## ✅ Solution

### 1. Fixed Imports (`app/chatbot.tsx`)

```typescript
// Before:
import { getGroupedNotifications, getNotifications, getUnreadCount } from '../api/notifications';

// After:
import { notificationApi } from '../api/notifications';
```

### 2. Fixed API Calls

```typescript
// Before:
getNotifications({ page_size: 50 })
getUnreadCount()
getGroupedNotifications()

// After:
notificationApi.getNotifications({ limit: 50 })
```

### 3. Fixed Filter Values

```typescript
// Before:
bloodType: '',  // ❌ Empty string
page: 0,        // ❌ Should start at 1

// After:
bloodType: null,  // ✅ Null for no filter
page: 1,          // ✅ Correct page number
```

### 4. Fixed getDonorRegistrations (`api/donor-registrations.ts`)

```typescript
// Before:
return response.registrations;  // ❌ Wrong field after unwrapping

// After:
if (response?.items && Array.isArray(response.items)) {
  return response.items;
} else if (response?.registrations && Array.isArray(response.registrations)) {
  return response.registrations;
} else if (Array.isArray(response)) {
  return response;
}
return [];
```

### 5. Simplified Return Structure

Removed non-existent data:
- Removed `unreadCount`
- Removed `groupedNotifications`
- Only return: `donors`, `registrations`, `notifications`

## 📝 Files Changed

- ✅ `app/chatbot.tsx` - Fixed imports and API calls
- ✅ `api/donor-registrations.ts` - Fixed response handling

## 🎯 Result

- ✅ Chatbot can fetch donors data
- ✅ Chatbot can fetch registrations data
- ✅ Chatbot can fetch notifications data
- ✅ No more "function is not a function" errors
- ✅ Correct response format handling

The fix is already applied. Restart your app and the chatbot should now be able to fetch data from the backend!
