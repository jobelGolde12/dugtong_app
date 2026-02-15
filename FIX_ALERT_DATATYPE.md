# Fix: Alert Creation - Datatype Mismatch

## 🐛 Problem
```
ERROR: Database error: SQLITE_MISMATCH: SQLite error: datatype mismatch
```

### Root Cause
The `id` field in the alerts table is INTEGER, but the backend was generating UUID strings.

```typescript
// Before (causing error):
data.id = randomUUID();  // ❌ Returns string like "550e8400-e29b-41d4-a716-446655440000"

// Database expects:
id INTEGER  // ❌ Mismatch!
```

## ✅ Solution

Changed backend to generate integer IDs like other tables (users, donors, etc.):

```typescript
// After (working):
const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM alerts");
const maxId = Number((result.rows[0] as any)?.max_id ?? 0);
data.id = maxId + 1;  // ✅ Returns integer like 5, 6, 7...
```

## 📝 Files Changed

### Backend:
- ✅ `app/api/alerts/route.ts` - Changed from UUID to integer ID generation

### Frontend:
- ✅ No changes needed (already fixed in previous iteration)

## 🚀 Push Backend Changes

```bash
cd dugtong-nextjs
git add app/api/alerts/route.ts
git commit -m "Fix alert creation: use integer ID instead of UUID"
git push
```

## 🎯 Result

- ✅ Alert creation now works
- ✅ ID type matches database schema
- ✅ Consistent with other tables (users, donors, etc.)
- ✅ No more datatype mismatch errors

After pushing, wait ~1-2 minutes for deployment, then test creating an alert.
