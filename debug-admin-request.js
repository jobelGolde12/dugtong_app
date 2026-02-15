const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function test(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    
    return { status: response.status, ok: response.ok, data, text };
  } catch (error) {
    return { error: error.message };
  }
}

(async () => {
  console.log('🔍 DEBUG: Admin Request Test\n');
  
  // Register admin
  console.log('1️⃣ Registering admin user...');
  const registerResult = await test('POST', '/auth/register', {
    email: `admin${Date.now()}@test.com`,
    password: 'admin123456',
    full_name: 'Admin User',
    contact_number: '09888888888',
    role: 'admin'
  });
  
  console.log(`Status: ${registerResult.status}`);
  console.log(`Response:`, JSON.stringify(registerResult.data, null, 2));
  
  if (!registerResult.ok) {
    console.log('\n❌ Registration failed');
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  const user = registerResult.data?.data?.user;
  
  console.log(`\n✅ Registered: ${user?.name} (Role: ${user?.role})`);
  console.log(`Token: ${token?.substring(0, 20)}...`);
  
  // Test each endpoint with detailed logging
  console.log('\n2️⃣ Testing GET endpoints with admin token...\n');
  
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
    console.log(`\n📡 GET ${endpoint}`);
    const result = await test('GET', endpoint, null, token);
    
    console.log(`   Status: ${result.status} ${result.ok ? '✅' : '❌'}`);
    console.log(`   Response structure:`, JSON.stringify(result.data, null, 2).substring(0, 500));
    
    if (result.ok) {
      const data = result.data;
      
      // Check response structure
      console.log(`\n   📊 Response Analysis:`);
      console.log(`   - Has 'success' field: ${data.success !== undefined}`);
      console.log(`   - Has 'data' field: ${data.data !== undefined}`);
      console.log(`   - Top-level keys: ${Object.keys(data).join(', ')}`);
      
      if (data.data) {
        console.log(`   - data keys: ${Object.keys(data.data).join(', ')}`);
        
        // Check for items array
        if (data.data.items) {
          console.log(`   - items count: ${data.data.items.length}`);
        }
        
        // Check for direct array
        if (Array.isArray(data.data)) {
          console.log(`   - data is array with ${data.data.length} items`);
        }
      } else if (Array.isArray(data)) {
        console.log(`   - Response is direct array with ${data.length} items`);
      }
    } else {
      console.log(`   ❌ Error: ${result.data?.error}`);
    }
  }
})();
