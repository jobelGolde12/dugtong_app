#!/usr/bin/env node
/**
 * Final verification test for dashboard APIs
 * Run this after pushing backend changes
 */

const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function test(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { error: error.message };
  }
}

(async () => {
  console.log('🧪 Final Dashboard API Verification\n');
  
  // Step 1: Register new user
  console.log('1️⃣ Registering new test user...');
  const registerResult = await test('POST', '/auth/register', {
    email: `test${Date.now()}@test.com`,
    password: 'test123456',
    full_name: 'Test User',
    contact_number: '09111111111'
  });
  
  if (!registerResult.ok) {
    console.log(`   ❌ Register failed (${registerResult.status}):`, registerResult.data?.error);
    console.log('\n⚠️  Cannot proceed without successful registration');
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  console.log(`   ✅ Register successful, token received`);
  
  // Step 2: Test login with formatted number
  console.log('\n2️⃣ Testing login with formatted contact number...');
  const loginResult = await test('POST', '/auth/login', {
    full_name: 'Test User',
    contact_number: '0911-111-1111'
  });
  console.log(`   ${loginResult.ok ? '✅' : '❌'} Login: ${loginResult.status}`);
  
  // Step 3: Test all GET endpoints
  console.log('\n3️⃣ Testing GET endpoints with token...\n');
  
  const endpoints = [
    '/donors',
    '/notifications',
    '/blood-requests',
    '/donations',
    '/alerts',
    '/reports/summary',
    '/reports/blood-types',
    '/messages',
    '/users/profile'
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const endpoint of endpoints) {
    const result = await test('GET', endpoint, null, token);
    const status = result.ok ? '✅' : '❌';
    console.log(`   ${status} GET ${endpoint} (${result.status})`);
    
    if (result.ok) {
      successCount++;
      const dataKeys = Object.keys(result.data?.data || result.data || {});
      if (dataKeys.length > 0) {
        console.log(`      Data: ${dataKeys.join(', ')}`);
      }
    } else {
      failCount++;
      console.log(`      Error: ${result.data?.error || 'Unknown'}`);
    }
  }
  
  console.log(`\n📊 Results: ${successCount} passed, ${failCount} failed`);
  
  if (successCount === endpoints.length) {
    console.log('✅ All dashboard APIs are working!');
  } else {
    console.log('⚠️  Some APIs are not working. Check backend implementation.');
  }
})();
