# Donor Dashboard Avatar and Email Display

## Changes Made

### 1. DonorDashboard.tsx
- ✅ Added `Image` import from react-native
- ✅ Updated `DonorProfile` interface to include `email?`, `avatar_data?`, and `avatar_mime_type?`
- ✅ Added profile section in header with avatar and email display
- ✅ Avatar shows image if available, otherwise shows first letter of name
- ✅ Email displayed below name with mail icon
- ✅ Added styles for avatar, profile section, and email display

### 2. AuthContext.tsx
- ✅ Updated `DonorProfileData` interface to include `email?`, `avatar_data?`, and `avatar_mime_type?`
- ✅ Modified donor profile fetching to include email and avatar fields from API

## UI Layout

### Profile Section (in Header)
```
┌─────────────────────────────────────┐
│  [Avatar]  Name                     │
│            📧 email@example.com     │
│                                     │
│  Donor Dashboard                    │
│  Your information is reviewed...    │
└─────────────────────────────────────┘
```

### Avatar Display
- **With Image**: Shows circular avatar (72x72) with purple border
- **Without Image**: Shows first letter of name in purple circle
- **Styling**: 
  - Border: 3px solid #6C63FF (purple)
  - Border radius: 36px (fully circular)
  - Size: 72x72 pixels

### Email Display
- **Icon**: Mail outline icon (14px)
- **Text**: Italic, gray color (#64748B)
- **Layout**: Horizontal with icon and text
- **Fallback**: Not displayed if email is not available

## Data Flow

1. **Login** → AuthContext fetches donor profile from API
2. **API Response** → Includes email, avatar_data, avatar_mime_type
3. **Storage** → Saved to AsyncStorage with all fields
4. **Dashboard** → Loads from AuthContext or AsyncStorage
5. **Display** → Shows avatar and email in header section

## Features

- ✅ Avatar displayed from base64 data
- ✅ Fallback to initials if no avatar
- ✅ Email shown with icon
- ✅ Email hidden if not available
- ✅ Responsive layout
- ✅ Consistent with app design (purple theme)
- ✅ Refresh functionality updates avatar and email

## Testing

1. **With Avatar and Email**:
   - Register with photo and email
   - Login as donor
   - Verify avatar and email display in dashboard header

2. **Without Avatar**:
   - Register without photo
   - Login as donor
   - Verify first letter shows in purple circle

3. **Without Email**:
   - Register without email
   - Login as donor
   - Verify email section is not displayed

4. **Refresh**:
   - Pull down to refresh
   - Verify avatar and email update if changed
