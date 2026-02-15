#!/usr/bin/env node

/**
 * API Test Script for Dashboard
 * Tests all GET and POST endpoints used in the dashboard
 */

const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function testEndpoint(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200));
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log('Error:', data);
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests for Dashboard\n');
  console.log('Base URL:', BASE_URL);
  
  // Test 1: Login to get token
  console.log('\n=== Authentication Tests ===');
  const loginResult = await testEndpoint('POST', '/auth/login', {
    full_name: 'Test User',
    contact_number: '09123456789'
  });
  
  const token = loginResult.data?.data?.access_token;
  
  if (!token) {
    console.log('\n⚠️  No token received, some tests will be skipped');
  }

  // Test 2: Get current user
  await testEndpoint('GET', '/auth/me', null, token);

  // Test 3: Notifications
  console.log('\n=== Notification Tests ===');
  await testEndpoint('GET', '/notifications', null, token);
  await testEndpoint('GET', '/notifications/unread-count', null, token);

  // Test 4: Donors
  console.log('\n=== Donor Tests ===');
  await testEndpoint('GET', '/donors', null, token);
  await testEndpoint('GET', '/donors?blood_type=A+', null, token);

  // Test 5: Blood Requests
  console.log('\n=== Blood Request Tests ===');
  await testEndpoint('GET', '/blood-requests', null, token);

  // Test 6: Donations
  console.log('\n=== Donation Tests ===');
  await testEndpoint('GET', '/donations', null, token);

  // Test 7: Alerts
  console.log('\n=== Alert Tests ===');
  await testEndpoint('GET', '/alerts', null, token);

  // Test 8: Reports
  console.log('\n=== Report Tests ===');
  await testEndpoint('GET', '/reports/summary', null, token);
  await testEndpoint('GET', '/reports/blood-types', null, token);

  // Test 9: Messages
  console.log('\n=== Message Tests ===');
  await testEndpoint('GET', '/messages', null, token);

  console.log('\n\n✨ Tests Complete!\n');
}

runTests().catch(console.error);
