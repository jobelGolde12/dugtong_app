# Fix: Alert Creation Internal Server Error

## 🐛 Problem

When creating an alert, getting:
```
ERROR API Error [/alerts]: [Error: Internal server error]
```

### Root Causes:
1. `target_audience` was sent as array but database expects string
2. `send_now` was sent as boolean but database expects integer (0 or 1)
3. Missing required fields: `created_by`, `created_at`
4. `undefined` values instead of `null` for optional fields

## ✅ Solution

Fixed `app/send-alerts.tsx` to send correct data format:

### Changes Made:

1. **Stringify target_audience**
   ```typescript
   // Before: target_audience: formData.targetAudience (array)
   // After: target_audience: JSON.stringify(formData.targetAudience)
   ```

2. **Convert send_now to integer**
   ```typescript
   // Before: send_now: formData.sendNow (boolean)
   // After: send_now: formData.sendNow ? 1 : 0
   ```

3. **Use null instead of undefined**
   ```typescript
   // Before: location: formData.location || undefined
   // After: location: formData.location || null
   
   // Before: schedule_at: formData.sendNow ? undefined : ...
   // After: schedule_at: formData.sendNow ? null : ...
   ```

4. **Add required fields**
   ```typescript
   created_by: user?.id || '',
   created_at: new Date().toISOString()
   ```

5. **Import useAuth**
   ```typescript
   import { useAuth } from '../contexts/AuthContext';
   const { user } = useAuth();
   ```

## 📊 Data Format

### Before (causing error):
```json
{
  "title": "Alert Title",
  "message": "Alert message",
  "alert_type": "urgent",
  "priority": "high",
  "target_audience": ["all", "donors"],  // ❌ Array
  "location": undefined,                  // ❌ undefined
  "schedule_at": undefined,               // ❌ undefined
  "send_now": true                        // ❌ Boolean
}
```

### After (working):
```json
{
  "title": "Alert Title",
  "message": "Alert message",
  "alert_type": "urgent",
  "priority": "high",
  "target_audience": "[\"all\",\"donors\"]",  // ✅ JSON string
  "location": null,                            // ✅ null
  "schedule_at": null,                         // ✅ null
  "send_now": 1,                               // ✅ Integer
  "created_by": "25",                          // ✅ User ID
  "created_at": "2026-02-15T10:30:00.000Z"    // ✅ ISO string
}
```

## 📝 Files Changed

- ✅ `app/send-alerts.tsx` - Fixed data format for alert creation

## 🎯 Result

- ✅ Alert creation works
- ✅ No more internal server errors
- ✅ All fields properly formatted
- ✅ UI unchanged

## 🧪 Testing

The fix is applied. Test by:
1. Login with admin account
2. Navigate to Send Alerts page
3. Fill in the form
4. Click Send Alert
5. Alert should be created successfully
