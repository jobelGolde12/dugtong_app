# Fix: Newly Registered Donors Not Showing in Admin Dashboard

## Problem
Newly registered donors were not appearing in the Donor Management page because:
- The page only fetched from `donors` table (approved donors)
- Newly registered donors are in `donor_registrations` table with status "pending"
- The `showPending` filter existed but wasn't being used to fetch registrations

## Solution

### Updated DonorManagementScreen.tsx

**File**: `app/screens/dashboard/DonorManagementScreen.tsx`

Modified `fetchDonors()` function to:
1. ✅ Fetch approved donors from `donors` table
2. ✅ Check if `showPending` filter is enabled
3. ✅ If enabled, fetch pending registrations from `donor_registrations` table
4. ✅ Map registrations to match Donor type format
5. ✅ Combine both lists and display together
6. ✅ Include `email`, `avatar_data`, and `avatar_mime_type` in mapping

## Data Flow

### For Newly Registered Donors
```
Register → donor_registrations table (status: pending)
         → donor_registration_avatars table
         → donor_registration_emails table

Admin Dashboard → fetchDonors()
                → getDonors() - gets approved donors
                → getDonorRegistrations({ status: 'pending' }) - gets pending
                → Map registrations to Donor format
                → Combine both lists
                → Display with avatar and email
```

### Display Features
- ✅ Avatar shows from base64 data if available
- ✅ Avatar shows first letter if no image
- ✅ Email displays with icon if available
- ✅ Email shows "N/A" if not provided
- ✅ Status badge shows "PENDING" for registrations
- ✅ Status shows "Pending Review" for availability

## Filter Toggle

The "Show Pending" filter button:
- **Enabled by default** (`showPending: true`)
- **Toggle ON**: Shows both approved donors + pending registrations
- **Toggle OFF**: Shows only approved donors

## Mapping Details

Registrations are mapped to match Donor type:
```javascript
{
  id: String(reg.id),
  full_name: reg.full_name,
  name: reg.full_name,
  age: reg.age,
  sex: reg.sex,
  blood_type: reg.blood_type,
  bloodType: reg.blood_type,
  contact_number: reg.contact_number,
  contactNumber: reg.contact_number,
  email: reg.email,                    // ← Email included
  avatar_data: reg.avatar_data,        // ← Avatar data included
  avatar_mime_type: reg.avatar_mime_type, // ← MIME type included
  municipality: reg.municipality,
  availabilityStatus: 'Pending Review',
  status: reg.status,
  dateRegistered: reg.created_at,
}
```

## Testing

### Test 1: Register New Donor
1. Register with photo and email
2. Login as admin
3. Go to Donor Management
4. ✅ Should see new donor in list
5. ✅ Should see avatar (or initials)
6. ✅ Should see email (or N/A)
7. ✅ Should see "PENDING" badge

### Test 2: Toggle Filter
1. Click "Show Pending" button to disable
2. ✅ Pending registrations disappear
3. Click again to enable
4. ✅ Pending registrations reappear

### Test 3: Approve Registration
1. Click on pending donor
2. Approve registration
3. ✅ Donor moves to approved list
4. ✅ Avatar and email persist

## Benefits

1. **Immediate Visibility**: Admins see new registrations immediately
2. **Complete Information**: Avatar and email displayed for pending donors
3. **Flexible Filtering**: Can toggle pending registrations on/off
4. **Consistent Display**: Same card design for both approved and pending
5. **No Data Loss**: Avatar and email preserved through approval process

## Console Logs

When fetching donors, you'll see:
```
🔍 Fetching donors with filters: { showPending: true, ... }
📊 Donor result: { items: [...], total: X }
🔍 Fetching pending registrations...
📊 Registrations result: [...]
✅ Added registrations, total: Y
✅ Combined results: Z
```

Where Z = X (approved) + Y (pending)
