# Fix: Avatar Not Showing in Donor Dashboard

## Problem
Newly registered donors couldn't see their avatar in the dashboard because:
1. Avatar was saved to `donor_registration_avatars` table during registration
2. When donor logs in, the app fetches from `donors` table (for approved donors)
3. Newly registered donors are in `donor_registrations` table, not `donors` table yet
4. Avatar wasn't being copied when registration was approved

## Solution

### 1. Updated Registration Approval Process
**File**: `/home/jobel/projects/dugtong-nextjs/app/api/donor-registrations/[id]/route.ts`

When admin approves a registration:
- ✅ Copy avatar from `donor_registration_avatars` to `donor_avatars`
- ✅ Copy email from `donor_registration_emails` to `donor_emails`
- ✅ Ensures approved donors have their avatar and email in the donors tables

### 2. Updated Donor Profile Fetching
**File**: `/home/jobel/projects/app-project/api/donors.ts`

Modified `getDonorByContact()` to:
1. First check `donors` table (for approved donors)
2. If not found, check `donor_registrations` table (for pending registrations)
3. Return avatar and email from whichever table has the donor
4. Map registration data to Donor format

## Data Flow

### For Newly Registered Donors (Pending)
```
Register → donor_registrations table
         → donor_registration_avatars table
         → donor_registration_emails table
         
Login → getDonorByContact()
      → Check donors table (not found)
      → Check donor_registrations table (found!)
      → Return with avatar_data and email
      → Display in dashboard
```

### For Approved Donors
```
Admin Approves → Copy to donors table
               → Copy avatar to donor_avatars table
               → Copy email to donor_emails table
               
Login → getDonorByContact()
      → Check donors table (found!)
      → Return with avatar_data and email
      → Display in dashboard
```

## Benefits

1. **Immediate Display**: Newly registered donors see their avatar immediately
2. **Persistent Display**: Avatar remains visible after approval
3. **Fallback Support**: Shows initials if no avatar
4. **Seamless Experience**: No difference between pending and approved donors in dashboard

## Testing

1. **New Registration**:
   - Register with photo
   - Login immediately
   - ✅ Avatar should display in dashboard

2. **After Approval**:
   - Admin approves registration
   - Donor logs in again
   - ✅ Avatar still displays (now from donors table)

3. **Without Avatar**:
   - Register without photo
   - Login
   - ✅ Shows first letter in circle

## Technical Details

- Avatar stored as base64 in TEXT column
- MIME type stored separately (image/jpeg, image/png, etc.)
- Foreign keys maintain data integrity
- Approval process copies all related data
- Fallback chain: donors → donor_registrations → initials
