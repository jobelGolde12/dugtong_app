const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function testEndpoint(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    
    return { status: response.status, ok: response.ok, data, text };
  } catch (error) {
    return { error: error.message };
  }
}

(async () => {
  console.log('🔍 Diagnosing Backend Issues\n');
  
  // Test 1: Check if API is reachable
  console.log('1️⃣ Testing API reachability...');
  const health = await testEndpoint('GET', '/auth/me');
  console.log(`   Status: ${health.status} (${health.ok ? 'OK' : 'Error'})`);
  console.log(`   Response:`, JSON.stringify(health.data).substring(0, 100));
  
  // Test 2: Try login with email (if supported)
  console.log('\n2️⃣ Testing email login...');
  const emailLogin = await testEndpoint('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'password123'
  });
  console.log(`   Status: ${emailLogin.status}`);
  console.log(`   Response:`, JSON.stringify(emailLogin.data).substring(0, 200));
  
  // Test 3: Try contact login
  console.log('\n3️⃣ Testing contact login (no format)...');
  const contactLogin1 = await testEndpoint('POST', '/auth/login', {
    full_name: 'Admin',
    contact_number: '09123456789'
  });
  console.log(`   Status: ${contactLogin1.status}`);
  console.log(`   Response:`, JSON.stringify(contactLogin1.data).substring(0, 200));
  
  // Test 4: Try contact login with dashes
  console.log('\n4️⃣ Testing contact login (with dashes)...');
  const contactLogin2 = await testEndpoint('POST', '/auth/login', {
    full_name: 'Admin',
    contact_number: '0912-345-6789'
  });
  console.log(`   Status: ${contactLogin2.status}`);
  console.log(`   Response:`, JSON.stringify(contactLogin2.data).substring(0, 200));
  
  // Test 5: Check if we can access any endpoint without auth
  console.log('\n5️⃣ Testing public endpoints...');
  const donors = await testEndpoint('GET', '/donors');
  console.log(`   GET /donors: ${donors.status}`);
  
  const reports = await testEndpoint('GET', '/reports/summary');
  console.log(`   GET /reports/summary: ${reports.status}`);
  
  // Test 6: Try to register a new user
  console.log('\n6️⃣ Testing registration...');
  const register = await testEndpoint('POST', '/auth/register', {
    email: `test${Date.now()}@test.com`,
    password: 'test123456',
    full_name: 'Test User',
    contact_number: '09999999999'
  });
  console.log(`   Status: ${register.status}`);
  console.log(`   Response:`, JSON.stringify(register.data).substring(0, 200));
  
  if (register.ok && register.data?.data?.access_token) {
    const token = register.data.data.access_token;
    console.log('\n7️⃣ Testing authenticated endpoints with new token...');
    
    const authTest1 = await testEndpoint('GET', '/donors', null, token);
    console.log(`   GET /donors: ${authTest1.status} - ${authTest1.ok ? 'SUCCESS' : 'FAILED'}`);
    if (authTest1.ok) console.log(`   Data keys:`, Object.keys(authTest1.data?.data || authTest1.data || {}).join(', '));
    
    const authTest2 = await testEndpoint('GET', '/notifications', null, token);
    console.log(`   GET /notifications: ${authTest2.status} - ${authTest2.ok ? 'SUCCESS' : 'FAILED'}`);
    
    const authTest3 = await testEndpoint('GET', '/reports/summary', null, token);
    console.log(`   GET /reports/summary: ${authTest3.status} - ${authTest3.ok ? 'SUCCESS' : 'FAILED'}`);
  }
  
  console.log('\n✅ Diagnosis complete');
})();
