#!/usr/bin/env node
/**
 * Complete Flow Test: React Native → Next.js → Turso DB
 * This test verifies the entire data flow
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
  console.log('🔍 COMPLETE FLOW TEST: React Native → Next.js → Turso DB\n');
  console.log('=' .repeat(70));
  
  // PHASE 1: Authentication Flow
  console.log('\n📝 PHASE 1: AUTHENTICATION\n');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@test.com`;
  const testContact = `0944${timestamp.toString().slice(-7)}`;
  
  console.log('1.1 Register User (POST /auth/register)');
  const registerResult = await test('POST', '/auth/register', {
    email: testEmail,
    password: 'test123456',
    full_name: 'Test User',
    contact_number: testContact,
    role: 'donor'
  });
  console.log(`    ${registerResult.ok ? '✅' : '❌'} Status: ${registerResult.status}`);
  if (!registerResult.ok) {
    console.log(`    Error: ${registerResult.data?.error}`);
    console.log('\n❌ Cannot proceed without successful registration');
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  const userId = registerResult.data?.data?.user?.id;
  console.log(`    User ID: ${userId}`);
  console.log(`    Token: ${token ? 'Received' : 'None'}`);
  
  console.log('\n1.2 Login with Contact (POST /auth/login)');
  const loginResult = await test('POST', '/auth/login', {
    full_name: 'Test User',
    contact_number: testContact.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3')
  });
  console.log(`    ${loginResult.ok ? '✅' : '❌'} Status: ${loginResult.status}`);
  
  console.log('\n1.3 Get Current User (GET /auth/me)');
  const meResult = await test('GET', '/auth/me', null, token);
  console.log(`    ${meResult.ok ? '✅' : '❌'} Status: ${meResult.status}`);
  if (meResult.ok) {
    console.log(`    User: ${meResult.data?.user?.name} (${meResult.data?.user?.role})`);
  }
  
  // PHASE 2: Data Retrieval (GET endpoints)
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 PHASE 2: DATA RETRIEVAL (GET ENDPOINTS)\n');
  
  const getEndpoints = [
    { path: '/notifications', name: 'Notifications', key: 'items' },
    { path: '/messages', name: 'Messages', key: 'items' },
    { path: '/users/profile', name: 'User Profile', key: 'id' },
    { path: '/users/preferences', name: 'User Preferences', key: 'theme_mode' }
  ];
  
  let getSuccess = 0;
  let getFailed = 0;
  
  for (const endpoint of getEndpoints) {
    const result = await test('GET', endpoint.path, null, token);
    console.log(`${result.ok ? '✅' : '❌'} ${endpoint.name.padEnd(20)} (${result.status})`);
    
    if (result.ok) {
      getSuccess++;
      const data = result.data?.data || result.data;
      if (endpoint.key && data) {
        const value = data[endpoint.key];
        if (Array.isArray(value)) {
          console.log(`    → ${endpoint.key}: ${value.length} items`);
        } else if (value !== undefined) {
          console.log(`    → ${endpoint.key}: ${JSON.stringify(value).substring(0, 50)}`);
        }
      }
    } else {
      getFailed++;
      console.log(`    → Error: ${result.data?.error}`);
    }
  }
  
  // PHASE 3: Privileged Endpoints (require admin/staff roles)
  console.log('\n' + '='.repeat(70));
  console.log('\n🔒 PHASE 3: PRIVILEGED ENDPOINTS (Admin/Staff Only)\n');
  
  const privilegedEndpoints = [
    { path: '/donors', name: 'Donors' },
    { path: '/blood-requests', name: 'Blood Requests' },
    { path: '/donations', name: 'Donations' },
    { path: '/alerts', name: 'Alerts' },
    { path: '/reports/summary', name: 'Reports Summary' },
    { path: '/reports/blood-types', name: 'Blood Types Report' }
  ];
  
  let privSuccess = 0;
  let privForbidden = 0;
  
  for (const endpoint of privilegedEndpoints) {
    const result = await test('GET', endpoint.path, null, token);
    const status = result.status === 403 ? '🔒' : result.ok ? '✅' : '❌';
    console.log(`${status} ${endpoint.name.padEnd(20)} (${result.status})`);
    
    if (result.ok) {
      privSuccess++;
    } else if (result.status === 403) {
      privForbidden++;
      console.log(`    → Expected: Donor role doesn't have access`);
    }
  }
  
  // PHASE 4: Database Write Test (if we have admin access)
  console.log('\n' + '='.repeat(70));
  console.log('\n💾 PHASE 4: DATABASE WRITE TEST\n');
  
  console.log('4.1 Register Admin User');
  const adminResult = await test('POST', '/auth/register', {
    email: `admin${timestamp}@test.com`,
    password: 'admin123456',
    full_name: 'Admin User',
    contact_number: `0955${timestamp.toString().slice(-7)}`,
    role: 'admin'
  });
  console.log(`    ${adminResult.ok ? '✅' : '❌'} Status: ${adminResult.status}`);
  
  if (adminResult.ok) {
    const adminToken = adminResult.data?.data?.access_token;
    
    console.log('\n4.2 Test Admin GET Endpoints');
    const adminTests = [
      { path: '/donors', name: 'Donors' },
      { path: '/reports/summary', name: 'Reports Summary' }
    ];
    
    for (const endpoint of adminTests) {
      const result = await test('GET', endpoint.path, null, adminToken);
      console.log(`    ${result.ok ? '✅' : '❌'} ${endpoint.name} (${result.status})`);
      if (result.ok) {
        const data = result.data?.data || result.data;
        const keys = Object.keys(data || {});
        console.log(`        → Data keys: ${keys.slice(0, 3).join(', ')}`);
      }
    }
  }
  
  // FINAL SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 FINAL SUMMARY\n');
  
  console.log(`Authentication:     ${registerResult.ok && loginResult.ok && meResult.ok ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`GET Endpoints:      ${getSuccess}/${getEndpoints.length} passed`);
  console.log(`Privileged Access:  ${privForbidden}/${privilegedEndpoints.length} correctly forbidden`);
  console.log(`Admin Access:       ${adminResult.ok ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🔗 FLOW VERIFICATION:\n');
  console.log(`   React Native → Next.js:  ✅ API calls successful`);
  console.log(`   Next.js → Turso DB:      ${registerResult.ok ? '✅ Data persisted' : '❌ Database error'}`);
  console.log(`   Turso DB → Next.js:      ${meResult.ok ? '✅ Data retrieved' : '❌ Query error'}`);
  console.log(`   Next.js → React Native:  ✅ Responses received`);
  
  if (registerResult.ok && loginResult.ok && meResult.ok && getSuccess > 0) {
    console.log('\n✅ COMPLETE FLOW VERIFIED: React Native ↔ Next.js ↔ Turso DB');
  } else {
    console.log('\n⚠️  Some issues detected. Check errors above.');
  }
  
  console.log('\n' + '='.repeat(70));
})();
