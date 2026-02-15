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
    
    console.log(`Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    if (!response.ok) {
      console.log(`Error:`, data.error || data);
    } else {
      console.log(`Success!`);
    }
    
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { error: error.message };
  }
}

(async () => {
  console.log('🧪 Testing Alert Creation with All Fields\n');
  
  const loginResult = await test('POST', '/auth/login', {
    full_name: 'Admin User',
    contact_number: '09888888888'
  });
  
  const token = loginResult.data?.data?.access_token;
  const userId = loginResult.data?.data?.user?.id;
  
  console.log(`Authenticated as User ID: ${userId}\n`);
  
  const now = new Date().toISOString();
  
  console.log('Creating alert with all required fields...');
  const result = await test('POST', '/alerts', {
    data: {
      title: 'Test Alert ' + Date.now(),
      message: 'Test message',
      alert_type: 'urgent',
      priority: 'high',
      target_audience: JSON.stringify(['all']),
      location: null,
      schedule_at: null,
      send_now: 1,
      created_by: userId,
      status: 'sent',
      sent_at: now,
      created_at: now,
      updated_at: now
    }
  }, token);
  
  if (result.ok) {
    console.log('\n✅ Alert created successfully!');
  }
})();
