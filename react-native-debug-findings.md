# React Native Debug Findings

**Date:** 2026-02-15
**Environment:** React Native (Expo)

## Network Request Comparison

| Aspect | Working Test (curl) | React Native App | Status |
|--------|---------------------|------------------|--------|
| URL | https://dugtung-next.vercel.app/api/auth/login | https://dugtung-next.vercel.app/api/auth/login | ✓ |
| Method | POST | POST | ✓ |
| Headers | Content-Type: application/json | Content-Type: application/json | ✓ |
| Request Body | {"full_name":"Admin User",...} | {"full_name":"Admin User",...} | ✓ |
| Response Status | 200 | 200 | ✓ |
| Response Body | {"success":true,"data":{...}} | Expected direct response | ✗ |

## Identified Issues

### 1. Login API Response Structure Mismatch ✓ FIXED
- **Issue:** API returns `{ success: true, data: {...} }` but code expected direct `{ access_token, user }`
- **File:** `api/auth.ts`
- **Fix:** Updated login function to unwrap the response:
```typescript
const response = await apiClient.post<{ success: boolean; data: LoginResponse }>("/auth/login", data, false);
if (!response.success || !response.data) {
  throw new Error("Login failed: Invalid response");
}
const { access_token, refresh_token, user } = response.data;
```

### 2. Registration API Response Structure Mismatch ✓ FIXED
- **Issue:** API returns `{ success: true, data: { registration: {...} } }` but code expected `{ registration: {...} }`
- **File:** `api/donor-registrations.ts`
- **Fix:** Updated createDonorRegistration to handle nested response:
```typescript
const response = await apiClient.post<{ success: boolean; data: { registration: DonorRegistrationResponse } }>(
  "/donor-registrations", data
);
if (!response.success || !response.data?.registration) {
  throw new Error("Registration failed: Invalid response");
}
return response.data.registration;
```

### 3. Registration Request Field Name Mismatch ✓ FIXED
- **Issue:** Register form sent `availability` but API expects `availability_status`
- **File:** `app/register.tsx` (line 258)
- **Fix:** Changed `availability` to `availability_status` in registrationData object

### 4. Missing Export ✓ FIXED
- **Issue:** `DonorRegistrationRequest` type not exported from donor-registrations.ts
- **File:** `api/donor-registrations.ts`
- **Fix:** Added type export: `export type DonorRegistrationRequest = Omit<...>`

### 5. Missing Import ✓ FIXED
- **Issue:** `getAccessToken` was not imported in auth.ts
- **File:** `api/auth.ts` (line 2)
- **Fix:** Added `getAccessToken` to imports from "./client"

## Console Logs (Expected After Fix)

```
🔐 Attempting login with: { full_name: "Admin User", contact_number: "09423456789" }
🌐 API Request: POST https://dugtung-next.vercel.app/api/auth/login
📡 Response Status: 200 OK
✅ Response Success
✅ Login successful
```

```
📝 Submitting donor registration: { full_name: "Juan Dela Cruz", age: 25, ... }
🌐 API Request: POST https://dugtung-next.vercel.app/api/donor-registrations
📡 Response Status: 201 Created
✅ Response Success
✅ Registration successful
```

## Fix Implementation Summary

### File: api/auth.ts
- **Lines 56-75:** Updated login function to handle `{ success, data }` response structure
- **Line 2:** Added `getAccessToken` import

### File: api/donor-registrations.ts
- **Line 18:** Added `DonorRegistrationRequest` type export
- **Lines 45-58:** Updated createDonorRegistration to handle `{ success, data: { registration } }` response

### File: app/register.tsx
- **Line 258:** Changed `availability` to `availability_status`

## Overall Test Status: FIXED

- Total Issues Found: 5
- Fixed: 5
- Remaining: 0

## Notes

- The API endpoints are working correctly
- All issues were in the React Native frontend code handling the API responses
- The login accepts any credentials (security concern on backend)
- The registration allows duplicates (no uniqueness validation on backend)
