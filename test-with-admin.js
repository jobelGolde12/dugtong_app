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
  console.log('🧪 Testing with Admin Role\n');
  
  // Register as admin
  console.log('1️⃣ Registering admin user...');
  const registerResult = await test('POST', '/auth/register', {
    email: `admin${Date.now()}@test.com`,
    password: 'admin123456',
    full_name: 'Admin User',
    contact_number: '09222222222',
    role: 'admin'
  });
  
  if (!registerResult.ok) {
    console.log(`   ❌ Failed (${registerResult.status}):`, registerResult.data?.error);
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  const user = registerResult.data?.data?.user;
  console.log(`   ✅ Success - Role: ${user?.role}`);
  
  // Test endpoints
  console.log('\n2️⃣ Testing GET endpoints...\n');
  
  const endpoints = [
    '/donors',
    '/notifications',
    '/blood-requests',
    '/donations',
    '/alerts',
    '/reports/summary',
    '/reports/blood-types'
  ];
  
  for (const endpoint of endpoints) {
    const result = await test('GET', endpoint, null, token);
    console.log(`   ${result.ok ? '✅' : '❌'} ${endpoint} (${result.status})`);
    if (!result.ok) {
      console.log(`      Error: ${result.data?.error}`);
    } else {
      const keys = Object.keys(result.data?.data || result.data || {});
      console.log(`      Keys: ${keys.join(', ')}`);
    }
  }
})();
