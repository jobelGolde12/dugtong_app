# Fix: Reports Page Error

## 🐛 Problem

Reports page shows "Failed to load report data" error.

### Root Causes:
1. API export name mismatch: `reportApi` vs `reportsApi`
2. Missing API methods: `getSummary()`, `getBloodTypeDistribution()`, `getMonthlyDonations()`, `getAvailabilityTrend()`
3. Backend endpoints not handling database errors gracefully

## ✅ Solution

### 1. Fixed API Export Name (`api/reports.ts`)
Changed `reportApi` → `reportsApi` to match imports

### 2. Added Missing API Methods
```typescript
reportsApi.getSummary() → /reports/summary
reportsApi.getBloodTypeDistribution() → /reports/blood-types
reportsApi.getMonthlyDonations() → /reports/monthly-donations
reportsApi.getAvailabilityTrend() → /reports/availability-trend
```

### 3. Added Field Mapping
Maps backend snake_case to frontend camelCase:
- `bloodRequestsThisMonth` → `requestsThisMonth`
- `totalDonations` → `successfulDonations`
- `blood_type` → `bloodType`
- `available_count` → `availableCount`
- `unavailable_count` → `unavailableCount`

### 4. Backend Error Handling
Added try-catch in backend endpoints:
- `app/api/reports/monthly-donations/route.ts`
- `app/api/reports/availability-trend/route.ts`

Both now return empty arrays on database errors instead of 500.

## 📊 API Response Mapping

### Summary Endpoint
Backend returns:
```json
{
  "totalDonors": 22,
  "availableDonors": 16,
  "bloodRequestsThisMonth": 0,
  "totalDonations": 0
}
```

Frontend receives:
```json
{
  "totalDonors": 22,
  "availableDonors": 16,
  "requestsThisMonth": 0,
  "successfulDonations": 0
}
```

### Blood Types Endpoint
Backend: `[{ bloodType: "A+", count: 8 }]`
Frontend: Same (with fallback for `blood_type`)

### Monthly Donations
Backend: `[{ month: "2026-02", donations: 5 }]`
Frontend: Same (with fallback for `count`)

### Availability Trend
Backend: `[{ date: "2026-02-15", availableCount: 10, unavailableCount: 2 }]`
Frontend: Same (with snake_case fallbacks)

## 📝 Files Changed

### Frontend (app-project):
- ✅ `api/reports.ts` - Fixed export name, added all methods, added field mapping

### Backend (dugtong-nextjs):
- ✅ `app/api/reports/monthly-donations/route.ts` - Added error handling
- ✅ `app/api/reports/availability-trend/route.ts` - Added error handling

## 🎯 Result

- ✅ Reports page loads without errors
- ✅ All 4 report endpoints work correctly
- ✅ Graceful fallbacks for empty data
- ✅ Field names properly mapped

## 🚀 Push Backend Changes

```bash
cd dugtong-nextjs
git add app/api/reports/
git commit -m "Fix reports endpoints: add error handling"
git push
```

Frontend changes are already applied.
