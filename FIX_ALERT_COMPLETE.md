# Fix: Alert Creation - Complete Solution

## 🐛 Problem
Alert creation returns 500 Internal Server Error

## ✅ Solutions Applied

### Frontend (`app/send-alerts.tsx`)

Added all required fields matching existing alerts structure:

```typescript
const now = new Date().toISOString();
await alertApi.createAlert({
  title: formData.title,
  message: formData.message,
  alert_type: formData.alertType,
  priority: formData.priority,
  target_audience: JSON.stringify(formData.targetAudience),  // ✅ JSON string
  location: formData.location || null,                        // ✅ null not undefined
  schedule_at: formData.sendNow ? null : formData.scheduleDate.toISOString(),
  send_now: formData.sendNow ? 1 : 0,                        // ✅ Integer
  created_by: user?.id || '',                                 // ✅ User ID
  status: formData.sendNow ? 'sent' : 'scheduled',           // ✅ Status
  sent_at: formData.sendNow ? now : null,                    // ✅ Sent timestamp
  created_at: now,                                            // ✅ Created timestamp
  updated_at: now,                                            // ✅ Updated timestamp
});
```

### Backend (`app/api/alerts/route.ts`)

Added better error logging to identify database issues:

```typescript
try {
  await db.execute(`INSERT INTO alerts ...`);
} catch (dbError: any) {
  console.error("Database error inserting alert:", dbError);
  console.error("SQL:", ...);
  console.error("Values:", values);
  throw new ApiError(500, `Database error: ${dbError.message}`);
}
```

## 📊 Required Fields

Based on existing alerts in database:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| title | string | ✅ | "Urgent O- Units Needed" |
| message | string | ✅ | "Hospital needs O- units..." |
| alert_type | string | ✅ | "urgent", "info", "event" |
| priority | string | ✅ | "low", "medium", "high", "critical" |
| target_audience | JSON string | ✅ | `"[\"all\"]"` or `"[\"O-\",\"O+\"]"` |
| location | string/null | ❌ | "Sorsogon City" or null |
| schedule_at | ISO string/null | ❌ | null or "2026-02-20T10:00:00Z" |
| send_now | integer | ✅ | 1 or 0 |
| created_by | string | ✅ | "41" (user ID) |
| status | string | ✅ | "sent" or "scheduled" |
| sent_at | ISO string/null | ✅ | "2026-02-15T10:30:00Z" or null |
| created_at | ISO string | ✅ | "2026-02-15T10:30:00Z" |
| updated_at | ISO string | ✅ | "2026-02-15T10:30:00Z" |

## 📝 Files Changed

### Frontend:
- ✅ `app/send-alerts.tsx` - Added all required fields

### Backend:
- ✅ `app/api/alerts/route.ts` - Added error logging

## 🚀 Push Backend Changes

```bash
cd dugtong-nextjs
git add app/api/alerts/route.ts
git commit -m "Add better error logging for alert creation"
git push
```

Wait for deployment, then check Vercel logs if still getting 500 errors.

## 🎯 Result

- ✅ All required fields included
- ✅ Proper data types (JSON string, integers, ISO dates)
- ✅ Better error messages for debugging
- ✅ UI unchanged

Frontend changes are applied. After pushing backend changes, alert creation should work or show specific error message.
