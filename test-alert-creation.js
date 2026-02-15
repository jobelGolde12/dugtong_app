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
  console.log('🧪 Testing Alert Creation\n');
  
  // Register admin
  const registerResult = await test('POST', '/auth/register', {
    email: `admin${Date.now()}@test.com`,
    password: 'admin123456',
    full_name: 'Admin User',
    contact_number: '09999999999',
    role: 'admin'
  });
  
  if (!registerResult.ok) {
    console.log('❌ Registration failed');
    return;
  }
  
  const token = registerResult.data?.data?.access_token;
  console.log('✅ Registered admin\n');
  
  // Get existing alerts to see structure
  console.log('1️⃣ Getting existing alerts...');
  const getResult = await test('GET', '/alerts', null, token);
  console.log(`Status: ${getResult.status}`);
  if (getResult.ok && getResult.data?.data?.items?.length > 0) {
    console.log('Existing alert structure:');
    console.log(JSON.stringify(getResult.data.data.items[0], null, 2));
  }
  
  // Try creating alert with minimal data
  console.log('\n2️⃣ Creating alert with minimal data...');
  const createResult1 = await test('POST', '/alerts', {
    data: {
      title: 'Test Alert',
      message: 'Test message',
      alert_type: 'info',
      priority: 'low',
      target_audience: JSON.stringify(['all']),
      send_now: 1
    }
  }, token);
  console.log(`Status: ${createResult1.status}`);
  console.log('Response:', JSON.stringify(createResult1.data, null, 2).substring(0, 500));
  
  // Try with created_by
  console.log('\n3️⃣ Creating alert with created_by...');
  const userId = registerResult.data?.data?.user?.id;
  const createResult2 = await test('POST', '/alerts', {
    data: {
      title: 'Test Alert 2',
      message: 'Test message 2',
      alert_type: 'info',
      priority: 'low',
      target_audience: JSON.stringify(['all']),
      send_now: 1,
      created_by: userId,
      created_at: new Date().toISOString()
    }
  }, token);
  console.log(`Status: ${createResult2.status}`);
  console.log('Response:', JSON.stringify(createResult2.data, null, 2).substring(0, 500));
})();
