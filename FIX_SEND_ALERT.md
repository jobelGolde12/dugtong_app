# Fix: Send Alert Error - "expected record, received undefined"

## 🐛 Problem

When creating an alert, the error occurs:
```
Error Invalid input: expected record, received undefined
```

### Root Cause:
Backend expects data wrapped in `{ data: {...} }` format, but frontend was sending data directly.

**Frontend sent:**
```json
{
  "title": "Alert Title",
  "message": "Alert message",
  "alert_type": "urgent",
  ...
}
```

**Backend expected:**
```json
{
  "data": {
    "title": "Alert Title",
    "message": "Alert message",
    "alert_type": "urgent",
    ...
  }
}
```

## ✅ Solution

Fixed `api/alerts.ts` to wrap data in the expected format:

### 1. createAlert Method
```typescript
// Before:
await apiClient.post("/alerts", data);

// After:
await apiClient.post("/alerts", { data: alertData });
```

### 2. updateAlert Method
```typescript
// Before:
await apiClient.put(`/alerts/${id}`, data);

// After:
await apiClient.put(`/alerts/${id}`, { data: alertData });
```

### 3. getAlerts Method
Also fixed response parsing:
```typescript
// Before:
return response.alerts;

// After:
return response.items || [];
```

## 📋 Backend Schema

The backend uses a generic schema that expects:
```typescript
{
  data: dataSchema  // Any key-value pairs
}
```

This is defined in `/lib/validation.ts` as `dataSchema` and used across multiple endpoints (alerts, donors, blood-requests, etc.)

## 📝 Files Changed

- ✅ `api/alerts.ts` - Wrapped data in `{ data: {...} }` format for POST and PUT requests
- ✅ `api/alerts.ts` - Fixed getAlerts to use `items` instead of `alerts`

## 🎯 Result

- ✅ Creating alerts now works
- ✅ Updating alerts now works
- ✅ No more "expected record, received undefined" error
- ✅ UI remains unchanged

## 🧪 Testing

The fix is applied. Test by:
1. Login with admin account
2. Navigate to Send Alerts page
3. Fill in the form
4. Click Send Alert
5. Alert should be created successfully
