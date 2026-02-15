URGENT: React Native Login/Registration Not Working - API Tests Successful but UI Fails
Problem Statement
The API endpoints on https://dugtung-next.vercel.app/ are confirmed working via tests (see route_test.md), but the React Native mobile app's login (@app/login.tsx) and registration (@app/register.tsx) pages fail to authenticate or register users. Need to identify and fix all issues preventing successful communication between React Native frontend and Next.js backend.

Technical Stack
Frontend: React Native + TypeScript (Mobile App)

Backend: Next.js API Routes hosted on Vercel

API Base URL: https://dugtung-next.vercel.app/

Endpoints:

Login: /api/auth/login

Register: /api/donor-registrations

Working Test Evidence (from route_test.md)
typescript
// LOGIN TEST - WORKING
fetch('https://dugtung-next.vercel.app/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
full_name: "Admin User",
contact_number: "09423456789"
})
});
// Response: 200 OK with JWT token

// REGISTER TEST - WORKING
fetch('https://dugtung-next.vercel.app/api/donor-registrations', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
full_name: "Juan Dela Cruz",
age: 25,
sex: "Male",
blood_type: "A+",
contact_number: "09123456789",
municipality: "Manila",
availability_status: "Available"
})
});
// Response: 201 Created with donor data
Required Investigation Areas

1. React Native Specific Issues
   Network/Security Configuration
   typescript
   // CHECK: iOS Info.plist (ios/YourApp/Info.plist)
   // Add this for HTTP (if developing locally)
   <key>NSAppTransportSecurity</key>
   <dict>
   <key>NSAllowsArbitraryLoads</key>
   <true/>
   </dict>

// CHECK: Android network security (android/app/src/main/AndroidManifest.xml)
<application
android:usesCleartextTraffic="true" // For HTTP local development
...>
Environment Configuration
typescript
// CHECK: .env file configuration
// Should be:
API_URL=https://dugtung-next.vercel.app/api
// NOT:
API_URL=http://localhost:3000/api
// OR relative URLs which won't work in React Native 2. Code-Level Debugging Required
Login Page Analysis (@app/login.tsx)
typescript
// CHECK THESE SPECIFIC AREAS:

// 1. API URL Construction
const API_BASE_URL = 'https://dugtung-next.vercel.app'; // Should be absolute URL
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

// 2. Form State & Types
interface LoginFormData {
full_name: string; // Verify exact field name matches API
contact_number: string; // Should be string, not number
}

// 3. Submit Handler
const handleLogin = async (formData: LoginFormData) => {
try {
// Log the exact data being sent
console.log('🔍 Sending login data:', JSON.stringify(formData, null, 2));

    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any required custom headers
      },
      body: JSON.stringify(formData)
    });

    // Log raw response for debugging
    console.log('🔍 Response status:', response.status);
    const responseText = await response.text();
    console.log('🔍 Raw response:', responseText);

    // Parse response
    const data = JSON.parse(responseText);
    console.log('🔍 Parsed response:', data);

    // Handle response based on actual structure from API
    if (response.ok && data.success) {
      // Store token securely (AsyncStorage)
      await AsyncStorage.setItem('userToken', data.data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

      // Navigate to main app
      navigation.navigate('Home');
    } else {
      // Show error message
      Alert.alert('Login Failed', data.error || 'Invalid credentials');
    }

} catch (error) {
console.error('❌ Login error:', error);
Alert.alert('Error', 'Network error. Please check your connection.');
}
};

// 4. Check form validation
const validateForm = (data: LoginFormData) => {
if (!data.full_name?.trim()) {
Alert.alert('Validation Error', 'Full name is required');
return false;
}
if (!data.contact_number?.trim()) {
Alert.alert('Validation Error', 'Contact number is required');
return false;
}
// Add Philippine mobile number format validation
if (!/^(09|\+639)\d{9}$/.test(data.contact_number)) {
Alert.alert('Validation Error', 'Invalid contact number format');
return false;
}
return true;
};
Registration Page Analysis (@app/register.tsx)
typescript
// CHECK THESE SPECIFIC AREAS:

// 1. Interface matching API expectations
interface RegistrationData {
full_name: string;
age: number; // Note: number, not string
sex: string; // "Male", "Female", etc.
blood_type: string; // "A+", "O-", etc.
contact_number: string;
municipality: string;
availability_status: string; // "Available", "Unavailable", etc.
}

// 2. Data transformation before sending
const transformFormData = (formData: any): RegistrationData => {
return {
full_name: formData.fullName.trim(), // Map form field names if different
age: parseInt(formData.age, 10), // Ensure age is number
sex: formData.sex,
blood_type: formData.bloodType,
contact_number: formData.contactNumber.replace(/\s/g, ''), // Remove spaces
municipality: formData.municipality,
availability_status: formData.availabilityStatus || 'Available'
};
};

// 3. Submit handler with proper error handling
const handleRegister = async (formData: any) => {
try {
// Transform data to match API expectations
const apiData = transformFormData(formData);
console.log('🔍 Transformed registration data:', apiData);

    // Validate all required fields are present
    const requiredFields = ['full_name', 'age', 'sex', 'blood_type', 'contact_number', 'municipality'];
    const missingFields = requiredFields.filter(field => !apiData[field]);

    if (missingFields.length > 0) {
      Alert.alert('Validation Error', `Missing fields: ${missingFields.join(', ')}`);
      return;
    }

    // Make API call
    const response = await fetch('https://dugtung-next.vercel.app/api/donor-registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(apiData)
    });

    const responseText = await response.text();
    console.log('🔍 Registration response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse response:', responseText);
      throw new Error('Invalid server response');
    }

    if (response.status === 201 && data.success) {
      Alert.alert(
        'Success',
        'Registration successful! You can now login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Registration Failed', data.error || 'Please try again');
    }

} catch (error) {
console.error('❌ Registration error:', error);
Alert.alert('Error', 'Network error. Please check your connection.');
}
}; 3. Common React Native Pitfalls to Check
❌ Using Localhost URLs
typescript
// WRONG - won't work on device/emulator
const API_URL = 'http://localhost:3000/api';

// CORRECT for emulator
const API_URL = Platform.select({
ios: 'http://localhost:3000/api', // iOS simulator
android: 'http://10.0.2.2:3000/api', // Android emulator
default: 'https://dugtung-next.vercel.app/api' // Real device/production
});

// BEST - use environment variable with fallback
const API_URL = process.env.API_URL || 'https://dugtung-next.vercel.app/api';
❌ Not Handling Network Errors Properly
typescript
// Add network status checking
import NetInfo from '@react-native-community/netinfo';

const checkNetwork = async () => {
const state = await NetInfo.fetch();
if (!state.isConnected) {
Alert.alert('No Internet', 'Please check your connection');
return false;
}
return true;
};

// Use in handlers
const handleSubmit = async () => {
const isConnected = await checkNetwork();
if (!isConnected) return;
// ... proceed with API call
};
❌ Not Handling Timeouts
typescript
// Add timeout to fetch requests
const fetchWithTimeout = async (url: string, options: any, timeout = 10000) => {
const controller = new AbortController();
const id = setTimeout(() => controller.abort(), timeout);

try {
const response = await fetch(url, {
...options,
signal: controller.signal
});
clearTimeout(id);
return response;
} catch (error) {
clearTimeout(id);
if (error.name === 'AbortError') {
throw new Error('Request timeout');
}
throw error;
}
}; 4. Debugging Checklist
Immediate Actions:
Add comprehensive console.log statements throughout the flow

Test API directly from React Native using browser console on mobile device

Use React Native Debugger or Chrome DevTools for network inspection

Check if CORS is properly configured on Next.js backend

Verify environment variables are correctly set in React Native

For Android:
Check AndroidManifest.xml for internet permission

Test with 10.0.2.2 instead of localhost for emulator

Check if cleartext traffic is enabled for HTTP (if testing locally)

For iOS:
Check Info.plist for ATS settings

Test with localhost for simulator

Check if using real device needs SSL certificate

5. Expected Output
   Create a file react-native-debug-findings.md with:

Network Request Comparison

typescript
| Aspect | Working Test | React Native App | Status |
|--------|--------------|------------------|--------|
| URL | https://dugtung-next.vercel.app/api/auth/login | [actual URL] | ✓/✗ |
| Method | POST | [actual method] | ✓/✗ |
| Headers | Content-Type: application/json | [actual headers] | ✓/✗ |
| Request Body | {"full_name":"Admin User",...} | [actual body] | ✓/✗ |
| Response Status | 200 | [actual status] | ✓/✗ |
| Response Body | {"success":true,...} | [actual response] | ✓/✗ |
Console Logs from Both Scenarios

typescript
// Success scenario logs
[TIMESTAMP] 🔍 Sending login data: {...}
[TIMESTAMP] 🔍 Response status: 200
[TIMESTAMP] 🔍 Raw response: {...}

// Failure scenario logs  
[TIMESTAMP] 🔍 Sending login data: {...}
[TIMESTAMP] ❌ Error: TypeError: Network request failed
Identified Issues (check all that apply)

Wrong API URL (using relative path)

Missing required headers

Data format mismatch (age as string vs number)

Field name mismatch (fullName vs full_name)

CORS blocking requests

Network timeout

SSL/ATS blocking on iOS

Missing internet permission on Android

AsyncStorage issues with token storage

Navigation after success not working

Fix Implementation

typescript
// Provide exact code changes needed with file paths and line numbers
File: app/login.tsx
Line: 45-67
Current code: ...
Fixed code: ... 6. Success Criteria
Login successfully authenticates with credentials from test

Registration creates new donor in database

Proper error messages shown for invalid inputs

Network requests match successful test patterns

Token stored securely and persists after app restart

Navigation works after successful login/registration

Works on both iOS and Android (emulator and physical devices)
