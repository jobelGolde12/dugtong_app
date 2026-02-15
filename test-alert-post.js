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
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    return { status: response.status, ok: response.ok, data, text };
  } catch (error) {
    return { error: error.message };
  }
}

(async () => {
  console.log('🧪 Testing Alert POST Request\n');
  
  // Use existing admin credentials or register
  console.log('1️⃣ Login...');
  const loginResult = await test('POST', '/auth/login', {
    full_name: 'Admin User',
    contact_number: '09888888888'
  });
  
  if (!loginResult.ok) {
    console.log('Login failed, trying registration...');
    const registerResult = await test('POST', '/auth/register', {
      email: `admin${Date.now()}@test.com`,
      password: 'admin123456',
      full_name: 'Admin Test',
      contact_number: '09777777777',
      role: 'admin'
    });
    
    if (!registerResult.ok) {
      console.log('❌ Cannot authenticate');
      return;
    }
    
    var token = registerResult.data?.data?.access_token;
    var userId = registerResult.data?.data?.user?.id;
  } else {
    var token = loginResult.data?.data?.access_token;
    var userId = loginResult.data?.data?.user?.id;
  }
  
  console.log(`✅ Authenticated (User ID: ${userId})\n`);
  
  // Test 1: Minimal alert
  console.log('2️⃣ Test 1: Minimal alert data');
  await test('POST', '/alerts', {
    data: {
      title: 'Test Alert',
      message: 'Test message'
    }
  }, token);
  
  // Test 2: With all fields
  console.log('\n3️⃣ Test 2: Complete alert data');
  await test('POST', '/alerts', {
    data: {
      title: 'Complete Alert',
      message: 'Complete message',
      alert_type: 'urgent',
      priority: 'high',
      target_audience: JSON.stringify(['all']),
      location: 'Test Location',
      schedule_at: null,
      send_now: 1,
      created_by: userId,
      created_at: new Date().toISOString()
    }
  }, token);
  
  // Test 3: Check what existing alerts look like
  console.log('\n4️⃣ Test 3: Get existing alerts structure');
  const getResult = await test('GET', '/alerts', null, token);
  if (getResult.ok && getResult.data?.data?.items?.length > 0) {
    console.log('\nExisting alert fields:');
    console.log(Object.keys(getResult.data.data.items[0]).join(', '));
  }
})();
