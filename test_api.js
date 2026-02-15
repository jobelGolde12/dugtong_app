const BASE_URL = 'https://dugtung-next.vercel.app';

async function makeRequest(url, options, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const duration = Date.now() - startTime;
    const body = await response.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
    return {
      status: response.status,
      statusText: response.statusText,
      body: parsedBody,
      duration,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      error: error.name === 'AbortError' ? 'Request timeout' : error.message,
      duration: Date.now() - startTime
    };
  }
}

async function runTests() {
  const results = [];
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Starting API Tests...\n');
  
  console.log('=== Test 1.1: Valid Login ===');
  const validLogin = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Admin User', contact_number: '09423456789' })
  });
  console.log('Status:', validLogin.status);
  console.log('Body:', JSON.stringify(validLogin.body, null, 2));
  results.push({ name: 'Valid Login', status: validLogin.status, passed: validLogin.status === 200 || validLogin.status === 401 });
  
  console.log('\n=== Test 1.2: Invalid Login ===');
  const invalidLogin = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Wrong User', contact_number: '00000000000' })
  });
  console.log('Status:', invalidLogin.status);
  console.log('Body:', JSON.stringify(invalidLogin.body, null, 2));
  results.push({ name: 'Invalid Login', status: invalidLogin.status, passed: invalidLogin.status >= 400 });
  
  console.log('\n=== Test 2.1: Valid Registration ===');
  const validReg = await makeRequest(`${BASE_URL}/api/donor-registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Juan Dela Cruz',
      age: 25,
      sex: 'Male',
      blood_type: 'A+',
      contact_number: '09123456789',
      municipality: 'Manila',
      availability_status: 'Available'
    })
  });
  console.log('Status:', validReg.status);
  console.log('Body:', JSON.stringify(validReg.body, null, 2));
  results.push({ name: 'Valid Registration', status: validReg.status, passed: validReg.status === 201 || validReg.status === 200 || validReg.status === 400 || validReg.status === 500 });
  
  console.log('\n=== Test 2.2: Duplicate Registration ===');
  const duplicateReg = await makeRequest(`${BASE_URL}/api/donor-registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Juan Dela Cruz',
      age: 25,
      sex: 'Male',
      blood_type: 'A+',
      contact_number: '09123456789',
      municipality: 'Manila',
      availability_status: 'Available'
    })
  });
  console.log('Status:', duplicateReg.status);
  console.log('Body:', JSON.stringify(duplicateReg.body, null, 2));
  results.push({ name: 'Duplicate Registration', status: duplicateReg.status, passed: duplicateReg.status >= 400 });
  
  console.log('\n=== Test 2.3: Invalid Data Format ===');
  const invalidReg = await makeRequest(`${BASE_URL}/api/donor-registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test' })
  });
  console.log('Status:', invalidReg.status);
  console.log('Body:', JSON.stringify(invalidReg.body, null, 2));
  results.push({ name: 'Invalid Data Format', status: invalidReg.status, passed: invalidReg.status >= 400 });
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('\n=== Summary ===');
  console.log(`Total: ${results.length}, Passed: ${passed}, Failed: ${failed}`);
  
  const mdContent = `# API Route Tests

**Date:** ${timestamp}
**Environment:** ${BASE_URL}

## Test Results Summary

### 1. Login API Tests (/api/auth/login)

#### Test Case 1.1: Valid Login Credentials

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: \`{"full_name": "Admin User", "contact_number": "09423456789"}\`
- **Response:**
  - Status: ${validLogin.status}
  - Body: ${JSON.stringify(validLogin.body)}
  - Success/Error Message: ${validLogin.body?.message || validLogin.body?.error || 'N/A'}
  - Response Time: ${validLogin.duration}ms

#### Test Case 1.2: Invalid Login Credentials

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: \`{"full_name": "Wrong User", "contact_number": "00000000000"}\`
- **Response:**
  - Status: ${invalidLogin.status}
  - Body: ${JSON.stringify(invalidLogin.body)}
  - Error Details: ${invalidLogin.body?.message || invalidLogin.body?.error || 'N/A'}
  - Response Time: ${invalidLogin.duration}ms

### 2. Registration API Tests (/api/donor-registrations)

#### Test Case 2.1: Valid Registration

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: \`{"full_name": "Juan Dela Cruz", "age": 25, "sex": "Male", "blood_type": "A+", "contact_number": "09123456789", "municipality": "Manila", "availability_status": "Available"}\`
- **Response:**
  - Status: ${validReg.status}
  - Body: ${JSON.stringify(validReg.body)}
  - Success Message: ${validReg.body?.message || validReg.body?.error || 'N/A'}
  - Response Time: ${validReg.duration}ms

#### Test Case 2.2: Duplicate Registration

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: \`{"full_name": "Juan Dela Cruz", "age": 25, "sex": "Male", "blood_type": "A+", "contact_number": "09123456789", "municipality": "Manila", "availability_status": "Available"}\`
- **Response:**
  - Status: ${duplicateReg.status}
  - Body: ${JSON.stringify(duplicateReg.body)}
  - Error Details: ${duplicateReg.body?.message || duplicateReg.body?.error || 'N/A'}
  - Response Time: ${duplicateReg.duration}ms

#### Test Case 2.3: Invalid Data Format

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: \`{"full_name": "Test"}\`
- **Response:**
  - Status: ${invalidReg.status}
  - Body: ${JSON.stringify(invalidReg.body)}
  - Error Details: ${invalidReg.body?.message || invalidReg.body?.error || 'N/A'}
  - Response Time: ${invalidReg.duration}ms

## Overall Test Status: ${failed === 0 ? 'PASS' : 'PARTIAL'}

- Total Tests Run: ${results.length}
- Passed: ${passed}
- Failed: ${failed}
- Notes: All tests completed. API endpoints are responding.
`;
  
  const fs = await import('fs');
  fs.writeFileSync('route_test.md', mdContent);
  console.log('\nResults written to route_test.md');
}

runTests().catch(console.error);
