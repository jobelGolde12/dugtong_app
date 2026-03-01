# Add Donor Page - Avatar and Email Fields

## Changes Made

**File**: `app/AddDonorPage.tsx`

### 1. Added Imports
```typescript
import * as ImagePicker from 'expo-image-picker';
import { Image, ... } from 'react-native';
```

### 2. Updated Interfaces
```typescript
interface FormData {
  // ... existing fields
  email: string;
  avatarBase64: string;
  avatarMimeType: string;
}

interface Errors {
  // ... existing fields
  email?: string;
}
```

### 3. Added Image Picker Function
```typescript
const pickImage = async () => {
  // Request permission
  // Launch image picker
  // Convert to base64
  // Save to state
}
```

### 4. Added Email Validation
```typescript
case 'email':
  if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = 'Please enter a valid email address';
  }
  break;
```

### 5. Updated Form Submission
```typescript
await donorApi.createDonor({
  // ... existing fields
  email: formData.email.trim() || undefined,
  avatar_data: formData.avatarBase64 || undefined,
  avatar_mime_type: formData.avatarMimeType || undefined,
});
```

### 6. Added Form Fields
- **Email Input**: Optional text field with email validation
- **Avatar Picker**: Button to select photo from device with preview

### 7. Added Styles
- `avatarPickerButton`: Dashed border button
- `avatarPreviewContainer`: Container for preview
- `avatarPreview`: Circular image preview (100x100)
- `avatarPlaceholder`: Placeholder with camera icon
- `avatarPickerText`: Text styling

## Form Layout

```
┌─────────────────────────────┐
│  Full Name *                │
│  Age *                      │
│  Sex *                      │
│  Blood Type *               │
│  Contact Number *           │
│  Email (Optional)           │  ← NEW
│  Profile Photo (Optional)   │  ← NEW
│    [📷 Tap to select]       │
│  Municipality *             │
│  Availability Status *      │
│  [Submit Button]            │
└─────────────────────────────┘
```

## Features

- ✅ Email field (optional, validated)
- ✅ Avatar picker with device photo selection
- ✅ Image preview after selection
- ✅ Base64 encoding for storage
- ✅ 1:1 aspect ratio crop
- ✅ 50% quality compression
- ✅ Consistent with donor registration form

## Usage

### Admin/Hospital Staff Flow:
1. Navigate to Add Donor page
2. Fill in required fields
3. Optionally add email
4. Optionally tap to select photo
5. Submit form
6. Donor created with avatar and email in separate tables

### Data Storage:
- Avatar → `donor_avatars` table
- Email → `donor_emails` table
- Donor info → `donors` table

## Testing

1. **Add donor with avatar and email**:
   - Fill all required fields
   - Enter email
   - Select photo
   - Submit
   - ✅ Donor appears in list with avatar and email

2. **Add donor without avatar/email**:
   - Fill only required fields
   - Submit
   - ✅ Donor appears with initials and no email

3. **Email validation**:
   - Enter invalid email
   - ✅ Shows validation error
   - Enter valid email
   - ✅ Accepts and saves

## Benefits

1. **Consistency**: Same fields as donor registration
2. **Complete Data**: Admin can add full donor profile
3. **Visual Identity**: Avatar helps identify donors
4. **Contact Options**: Email provides additional contact method
5. **Professional**: Complete donor records from the start
