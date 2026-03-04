# Privacy Policy and User Agreement Implementation Documentation

This document provides a detailed guide on how to implement the Privacy Policy and User Agreement in the DUGTONG (Dugo Ko, Tulong Ko) Mobile Application registration flow, in compliance with the Data Privacy Act of 2012 (RA 10173).

## Table of Contents
1. [Overview](#overview)
2. [Frontend Implementation (React Native)](#frontend-implementation-react-native)
    - [State Management](#state-management)
    - [UI Components](#ui-components)
    - [Form Validation](#form-validation)
3. [Backend Implementation (Next.js)](#backend-implementation-nextjs)
    - [Database Schema Update](#database-schema-update)
    - [API Route Update](#api-route-update)
4. [User Interface Design](#user-interface-design)

---

## 1. Overview
To ensure legal compliance and transparency, users must explicitly agree to the Privacy Policy before submitting their donor registration. This involves:
- Displaying the full Privacy Policy text.
- Requiring a mandatory checkbox agreement.
- Storing the agreement status in the database.

---

## 2. Frontend Implementation (React Native)

### State Management
In `app/register.tsx`, add a new state to track the agreement status:

```typescript
const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);
```

### UI Components

#### Privacy Policy Modal
Create a new modal component or use the existing `Modal` structure to display the policy content from `verification.md`.

```tsx
<Modal
  visible={showPrivacyModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowPrivacyModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.policyModalContent}>
      <Text style={styles.modalTitle}>Privacy Policy & User Agreement</Text>
      <ScrollView style={styles.policyScrollView}>
        <Text style={styles.policyText}>
          {/* Content from verification.md */}
          By registering and using the DUGTONG...
          (Full text here)
        </Text>
      </ScrollView>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => setShowPrivacyModal(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

#### Checkbox Component
Since the project uses a custom UI, implement a styled checkbox before the "Submit Registration" button:

```tsx
<View style={styles.checkboxContainer}>
  <TouchableOpacity 
    style={[styles.checkbox, agreedToPrivacyPolicy && styles.checkboxChecked]}
    onPress={() => setAgreedToPrivacyPolicy(!agreedToPrivacyPolicy)}
  >
    {agreedToPrivacyPolicy && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
  <Text style={styles.checkboxLabel}>
    I have read and agree to the{" "}
    <Text style={styles.linkText} onPress={() => setShowPrivacyModal(true)}>
      Privacy Policy and Terms of Use
    </Text>{" "}
    in accordance with the Data Privacy Act of 2012 (RA 10173).
  </Text>
</View>
```

### Form Validation
Update the `validateForm` function in `app/register.tsx` to ensure the user has checked the box:

```typescript
const validateForm = (): boolean => {
  // ... existing validation logic
  
  if (!agreedToPrivacyPolicy) {
    Alert.alert('Agreement Required', 'You must agree to the Privacy Policy to register.');
    return false;
  }
  
  return isValid;
};
```

---

## 3. Backend Implementation (Next.js)

### Database Schema Update
To store the agreement, add an `accepted_privacy_policy` column to the `donor_registrations` table in Turso.

**Action:** Run a migration or execute the following SQL in the Turso CLI:
```sql
ALTER TABLE donor_registrations ADD COLUMN accepted_privacy_policy INTEGER DEFAULT 0;
```
*(Note: 0 for false, 1 for true)*

### API Route Update
Update `../dugtong-nextjs/app/api/donor-registrations/route.ts` to handle the new field.

1.  **POST Handler:** The dynamic insertion logic already handles new keys, but ensure `accepted_privacy_policy` is passed from the frontend and converted to an integer if necessary.

```typescript
// Example snippet in POST handler
if (data.accepted_privacy_policy !== undefined) {
    data.accepted_privacy_policy = data.accepted_privacy_policy ? 1 : 0;
}
```

---

## 4. User Interface Design

### Suggested Styles
To maintain consistency with the current registration page theme:

```typescript
checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 20,
  paddingHorizontal: 4,
},
checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.5)',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
},
checkboxChecked: {
  backgroundColor: '#1E90FF',
  borderColor: '#1E90FF',
},
checkmark: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
checkboxLabel: {
  flex: 1,
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 14,
  lineHeight: 20,
},
linkText: {
  color: '#1E90FF',
  textDecorationLine: 'underline',
  fontWeight: '600',
},
policyModalContent: {
  backgroundColor: '#1E1E2E',
  borderRadius: 20,
  padding: 20,
  width: '90%',
  maxHeight: '80%',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#FFFFFF',
  marginBottom: 15,
  textAlign: 'center',
},
policyScrollView: {
  marginBottom: 15,
},
policyText: {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: 14,
  lineHeight: 22,
},
closeButton: {
  backgroundColor: '#1E90FF',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},
closeButtonText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
},
```

## Implementation Checklist
- [ ] Create Privacy Policy Modal in `RegisterScreen`.
- [ ] Add `agreedToPrivacyPolicy` state.
- [ ] Add Checkbox UI before the Submit button.
- [ ] Update `validateForm` to check agreement state.
- [ ] Update `DonorRegistrationRequest` type in `api/donor-registrations.ts`.
- [ ] (Backend) Add column to `donor_registrations` table.
- [ ] (Backend) Verify POST endpoint correctly stores the value.
