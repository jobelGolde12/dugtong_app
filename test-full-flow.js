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
  console.log('🔍 Testing Full Flow: React Native → Next.js → Turso DB\n');
  
  // Step 1: Register admin user
  console.log('1️⃣ REGISTER (POST /auth/register)');
  const registerResult = await test('POST', '/auth/register', {
    email: `admin${Date.now()}@test.com`,
    password: 'admin123456',
    full_name: 'Admin Test',
    contact_number: '09333333333',
    role: 'admin'
  });
  console.log(`   ${registerResult.ok ? '✅' : '❌'} Status: ${registerResult.status}`);
  if (!registerResult.ok) {
    console.log(`   Error: ${registerResult.data?.error}`);
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  const user = registerResult.data?.data?.user;
  console.log(`   User: ${user?.name} (${user?.role})`);
  
  // Step 2: Login with contact
  console.log('\n2️⃣ LOGIN (POST /auth/login)');
  const loginResult = await test('POST', '/auth/login', {
    full_name: 'Admin Test',
    contact_number: '0933-333-3333'
  });
  console.log(`   ${loginResult.ok ? '✅' : '❌'} Status: ${loginResult.status}`);
  
  // Step 3: Get current user
  console.log('\n3️⃣ GET CURRENT USER (GET /auth/me)');
  const meResult = await test('GET', '/auth/me', null, token);
  console.log(`   ${meResult.ok ? '✅' : '❌'} Status: ${meResult.status}`);
  if (meResult.ok) {
    console.log(`   User: ${meResult.data?.user?.name}`);
  }
  
  // Step 4: Test all GET endpoints
  console.log('\n4️⃣ TESTING ALL GET ENDPOINTS\n');
  
  const endpoints = [
    { path: '/donors', name: 'Donors' },
    { path: '/donors?bloodType=A+', name: 'Donors (filtered)' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/notifications/unread-count', name: 'Unread Count' },
    { path: '/blood-requests', name: 'Blood Requests' },
    { path: '/donations', name: 'Donations' },
    { path: '/alerts', name: 'Alerts' },
    { path: '/reports/summary', name: 'Reports Summary' },
    { path: '/reports/blood-types', name: 'Blood Types Report' },
    { path: '/reports/monthly-donations', name: 'Monthly Donations' },
    { path: '/reports/availability-trend', name: 'Availability Trend' },
    { path: '/messages', name: 'Messages' },
    { path: '/users/profile', name: 'User Profile' },
    { path: '/users/preferences', name: 'User Preferences' }
  ];
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await test('GET', endpoint.path, null, token);
    const status = result.ok ? '✅' : '❌';
    console.log(`   ${status} ${endpoint.name.padEnd(25)} (${result.status})`);
    
    if (result.ok) {
      passed++;
      const data = result.data?.data || result.data;
      const keys = Object.keys(data || {});
      if (keys.length > 0) {
        console.log(`      → ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
      }
    } else {
      failed++;
      console.log(`      → Error: ${result.data?.error}`);
    }
    
    results.push({ endpoint: endpoint.name, ok: result.ok, status: result.status });
  }
  
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);
  
  // Summary
  if (failed === 0) {
    console.log('✅ ALL ENDPOINTS WORKING!');
    console.log('✅ Flow verified: React Native → Next.js → Turso DB');
  } else {
    console.log('⚠️  Some endpoints failed:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`   - ${r.endpoint} (${r.status})`);
    });
  }
})();
