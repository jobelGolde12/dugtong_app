# Donor Details Modal - Avatar and Email Display

## Changes Made

**File**: `app/screens/dashboard/DonorDetailsModal.tsx`

### 1. Added Image Import
```typescript
import { Image, Modal, ScrollView, ... } from 'react-native';
```

### 2. Avatar Display
- ✅ Shows circular avatar image (80x80) if `avatar_data` and `avatar_mime_type` exist
- ✅ Shows first letter of name in colored circle if no avatar
- ✅ Maintains 3px border with transparency

### 3. Email Display
- ✅ Shows email below name with mail icon
- ✅ Only displays if email exists
- ✅ Styled with italic text and secondary color

### 4. Styles Added
```typescript
avatarImage: {
  width: 80,
  height: 80,
},
avatarInitial: {
  fontSize: 36,
  fontWeight: '700',
},
emailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 8,
},
emailText: {
  fontSize: 14,
  fontStyle: 'italic',
},
```

## Modal Layout

```
┌─────────────────────────────┐
│         [Avatar]            │
│                        [X]  │
│                             │
│      John Doe               │
│   📧 john@example.com       │
│   [O+]        ID: 123       │
├─────────────────────────────┤
│  📍 Location: Sorsogon      │
│  📞 Contact: 09123456789    │
│  📅 Last Donation: ...      │
│  ...                        │
└─────────────────────────────┘
```

## Features

- ✅ Avatar shows from base64 data
- ✅ Fallback to initials if no avatar
- ✅ Email with icon below name
- ✅ Email hidden if not available
- ✅ Consistent with card design
- ✅ Works for both approved donors and pending registrations

## Testing

1. Click on any donor in the list
2. Modal opens with donor details
3. ✅ Avatar displays (image or initial)
4. ✅ Email displays below name (if available)
5. ✅ All other info displays correctly
