# Debug: Avatar and Email Not Displaying

## Changes Made to Fix

### 1. Registration - Save to AsyncStorage
**File**: `app/register.tsx`
- ✅ Now saves `email`, `avatar_data`, and `avatar_mime_type` to AsyncStorage after registration

### 2. Login - Fetch from API
**File**: `contexts/AuthContext.tsx`
- ✅ Fetches donor profile including email and avatar from API
- ✅ Saves complete profile to AsyncStorage

### 3. API - Check Both Tables
**File**: `api/donors.ts` - `getDonorByContact()`
- ✅ First checks `donors` table (approved donors)
- ✅ Then checks `donor_registrations` table (pending donors)
- ✅ Returns email and avatar from whichever table has the data

### 4. Dashboard - Display Avatar and Email
**File**: `app/DonorDashboard.tsx`
- ✅ Loads from AuthContext or AsyncStorage
- ✅ Displays avatar (image or initials)
- ✅ Displays email with icon

## Debug Steps

### Step 1: Check Console Logs
After registering and logging in, check the console for these logs:

```
📝 Submitting donor registration: {...}
✅ Registration successful: {...}
💾 Saving to AsyncStorage: {...}  // Should include email and avatar_data

🔐 Fetching donor profile for contact: 09XXXXXXXXX
🔍 getDonorByContact called with: 09XXXXXXXXX
🔍 Donors response: {...}
🔍 Clean number: 09XXXXXXXXX
✅ Found in registrations: {...}  // Should include email and avatar_data
✅ Mapped donor: {...}  // Should include email and avatar_data
🔐 Donor API result: {...}  // Should include email and avatar_data
🔐 Mapped donor profile data: {...}  // Should include email and avatar_data
🔐 Saving donor profile to AsyncStorage: {...}  // Should include email and avatar_data

📊 Loading donor data...
📊 donorProfile from context: {...}  // Should include email and avatar_data
🖼️ Rendering avatar. donorData: {
  has_avatar_data: true,
  has_mime_type: true,
  avatar_data_length: XXXX,
  mime_type: 'image/jpeg',
  email: 'test@example.com'
}
```

### Step 2: Verify Data in AsyncStorage
Check what's stored in AsyncStorage:
```javascript
// In React Native Debugger or console
AsyncStorage.getItem('donorProfile').then(data => console.log(JSON.parse(data)));
```

Should show:
```json
{
  "full_name": "John Doe",
  "age": 25,
  "sex": "Male",
  "blood_type": "O+",
  "contact_number": "09123456789",
  "municipality": "Sorsogon City",
  "availability": "available",
  "email": "john@example.com",
  "avatar_data": "base64_string_here...",
  "avatar_mime_type": "image/jpeg"
}
```

### Step 3: Check Backend Response
Verify the backend is returning avatar and email:

1. **Check donor_registrations GET endpoint**:
   ```
   GET https://dugtung-next.vercel.app/api/donor-registrations
   ```
   Response should include `avatar_data`, `avatar_mime_type`, and `email`

2. **Check donors GET endpoint**:
   ```
   GET https://dugtung-next.vercel.app/api/donors
   ```
   Response should include `avatar_data`, `avatar_mime_type`, and `email`

### Step 4: Test Flow

1. **Register with avatar and email**:
   - Select photo from device
   - Enter email
   - Submit registration
   - Check console logs for "💾 Saving to AsyncStorage"
   - Verify avatar_data and email are present

2. **Login**:
   - Login with same credentials
   - Check console logs for "🔐 Donor API result"
   - Verify avatar_data and email are present
   - Check console logs for "🖼️ Rendering avatar"
   - Verify has_avatar_data: true

3. **View Dashboard**:
   - Should see circular avatar image
   - Should see email below name

## Common Issues

### Issue 1: Avatar data is null
**Cause**: Backend not returning avatar from separate tables
**Fix**: Check backend GET endpoints are joining with avatar tables

### Issue 2: Avatar data exists but not displaying
**Cause**: Base64 string format issue
**Fix**: Verify format is `data:image/jpeg;base64,{base64_string}`

### Issue 3: Email not showing
**Cause**: Email field is undefined or null
**Fix**: Check backend is returning email from separate tables

### Issue 4: Data in AsyncStorage but not in context
**Cause**: AuthContext not loading from AsyncStorage
**Fix**: Check loadDonorData function is being called

## Quick Fix Commands

If data is not syncing, try:

1. **Clear AsyncStorage**:
   ```javascript
   AsyncStorage.clear();
   ```

2. **Re-register**:
   - Register again with photo and email
   - Login again

3. **Check backend tables**:
   ```sql
   SELECT * FROM donor_registration_avatars;
   SELECT * FROM donor_registration_emails;
   ```
