# Avatar and Email Implementation - Final Version

## Database Schema

### Separate Tables Created:
1. **user_avatars** - Stores avatars for all users
2. **user_emails** - Stores emails for all users
3. **donor_avatars** - Stores avatars for donors
4. **donor_emails** - Stores emails for donors
5. **donor_registration_avatars** - Stores avatars for pending registrations
6. **donor_registration_emails** - Stores emails for pending registrations

### Table Structure:
```sql
CREATE TABLE donor_registration_avatars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  avatar_data TEXT NOT NULL,        -- Base64 encoded image
  mime_type TEXT NOT NULL,          -- image/jpeg, image/png, etc.
  created_at TEXT NOT NULL,
  FOREIGN KEY (registration_id) REFERENCES donor_registrations(id)
);

CREATE TABLE donor_registration_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (registration_id) REFERENCES donor_registrations(id)
);
```

## Frontend Changes

### 1. Registration Form (app/register.tsx)
- ✅ Installed `expo-image-picker`
- ✅ Added image picker button with preview
- ✅ Converts selected image to base64
- ✅ Shows circular preview of selected avatar
- ✅ Email input field (optional, validated)
- ✅ Sends `avatar_data`, `avatar_mime_type`, and `email` to backend

### 2. Donor Management Screen
- ✅ Displays avatar from base64 data
- ✅ Shows first letter of name if no avatar
- ✅ Displays email with icon (📧)
- ✅ Shows "N/A" if no email

### 3. API Types Updated
- ✅ `DonorRegistrationResponse` uses `avatar_data` and `avatar_mime_type`
- ✅ `Donor` interface uses `avatar_data` and `avatar_mime_type`
- ✅ `PendingDonorRegistration` interface updated

## Backend Changes

### 1. Donor Registrations API
**POST /api/donor-registrations**
- Extracts `avatar_data`, `avatar_mime_type`, and `email` from request
- Saves registration to `donor_registrations` table
- Saves avatar to `donor_registration_avatars` table
- Saves email to `donor_registration_emails` table

**GET /api/donor-registrations**
- Fetches registrations from main table
- Joins with `donor_registration_avatars` to get avatar
- Joins with `donor_registration_emails` to get email
- Returns combined data

### 2. Donors API
**POST /api/donors**
- Extracts `avatar_data`, `avatar_mime_type`, and `email` from request
- Saves donor to `donors` table
- Saves avatar to `donor_avatars` table
- Saves email to `donor_emails` table

**GET /api/donors**
- Fetches donors from main table
- Joins with `donor_avatars` to get avatar
- Joins with `donor_emails` to get email
- Returns combined data

## Features

### Image Selection
- User taps "Tap to select photo" button
- System requests photo library permission
- User selects image from device
- Image is cropped to 1:1 aspect ratio
- Image is compressed to 50% quality
- Image is converted to base64
- Preview shown in circular frame

### Data Storage
- Avatar stored as base64 TEXT in separate table
- MIME type stored (image/jpeg, image/png, etc.)
- Email stored in separate table
- Foreign keys maintain referential integrity

### Display
- Avatar displayed from base64 data URI: `data:image/jpeg;base64,{data}`
- Fallback to initials if no avatar
- Email shown with icon, "N/A" if not provided

## Migration

Run migration script:
```bash
cd /home/jobel/projects/dugtong-nextjs
node create_avatar_email_tables.js
```

## Testing

1. **Register with avatar and email:**
   - Open registration form
   - Tap "Tap to select photo"
   - Select image from device
   - Enter email address
   - Submit registration

2. **View in donor list:**
   - Login as admin/hospital staff
   - Navigate to Donor Management
   - Verify avatar displays correctly
   - Verify email shows below contact info

3. **Register without avatar/email:**
   - Register without selecting photo
   - Leave email blank
   - Verify initials show as avatar
   - Verify "N/A" shows for email

## Benefits of Separate Tables

1. **Normalization** - Cleaner data structure
2. **Flexibility** - Can store multiple emails/avatars per user
3. **History** - Can track avatar/email changes over time
4. **Performance** - Main tables stay smaller
5. **Security** - Easier to implement access controls
6. **Scalability** - Can move to blob storage later

## Notes

- Avatar images are base64 encoded (increases size by ~33%)
- Quality set to 50% to reduce size
- Images cropped to 1:1 aspect ratio
- Separate tables allow for future enhancements (multiple emails, avatar history, etc.)
- All changes are backward compatible
