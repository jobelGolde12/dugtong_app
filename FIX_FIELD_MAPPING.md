# Fix: Field Name Mismatch (Backend vs Frontend)

## 🐛 Problem

Backend returns donor data with snake_case fields:
```json
{
  "id": 22,
  "full_name": "John Doe",
  "blood_type": "A+",
  "contact_number": "09123456789",
  "availability_status": "Available",
  "last_donation_date": null,
  "created_at": "2026-02-11T10:20:46.393Z"
}
```

Frontend expects camelCase fields:
```typescript
{
  id: "22",
  name: "John Doe",
  bloodType: "A+",
  contactNumber: "09123456789",
  availabilityStatus: "Available",
  lastDonationDate: null,
  dateRegistered: "2026-02-11T10:20:46.393Z"
}
```

## ✅ Solution

### 1. Added Field Mapping in `api/donors.ts`

Maps backend snake_case to frontend camelCase:

```typescript
response.items = response.items.map((donor: any) => ({
  id: String(donor.id),
  name: donor.full_name || donor.name,
  age: donor.age,
  sex: donor.sex,
  bloodType: donor.blood_type || donor.bloodType,
  contactNumber: donor.contact_number || donor.contactNumber,
  municipality: donor.municipality,
  availabilityStatus: donor.availability_status || donor.availabilityStatus,
  lastDonationDate: donor.last_donation_date || donor.lastDonationDate,
  dateRegistered: donor.created_at || donor.dateRegistered,
  notes: donor.notes
}));
```

### 2. Added Safety Checks in `DonorCard.tsx`

```typescript
// Before: donor.name.charAt(0)
// After: donor.name ? donor.name.charAt(0).toUpperCase() : '?'

// Before: {donor.name}
// After: {donor.name || 'Unknown'}
```

## 📋 Field Mapping

| Backend (snake_case) | Frontend (camelCase) |
|---------------------|---------------------|
| `full_name` | `name` |
| `blood_type` | `bloodType` |
| `contact_number` | `contactNumber` |
| `availability_status` | `availabilityStatus` |
| `last_donation_date` | `lastDonationDate` |
| `created_at` | `dateRegistered` |

## 📝 Files Changed

- ✅ `api/donors.ts` - Added field mapping for getDonors() and getDonor()
- ✅ `app/components/DonorCard.tsx` - Added safety checks for donor.name

## 🎯 Result

- ✅ Donor cards display correctly
- ✅ No more "Cannot read property 'charAt' of undefined" errors
- ✅ All donor data properly mapped from backend to frontend
- ✅ Graceful fallbacks for missing data

## 🧪 Testing

The fix is applied. Test by:
1. Login with admin account
2. Navigate to search/donors page
3. Donor cards should display with names and all data
