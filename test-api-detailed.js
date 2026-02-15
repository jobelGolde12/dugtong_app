const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function testGet(endpoint, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();
    console.log(`${response.ok ? '✅' : '❌'} GET ${endpoint} (${response.status})`);
    if (!response.ok) console.log('   Error:', data.error || data.message);
    else console.log('   Data keys:', Object.keys(data.data || data).join(', '));
    return { ok: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ GET ${endpoint} - Network Error:`, error.message);
    return { ok: false, error: error.message };
  }
}

async function testLogin() {
  const url = `${BASE_URL}/auth/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Admin User', contact_number: '09123456789' })
    });
    const data = await response.json();
    console.log(`${response.ok ? '✅' : '❌'} POST /auth/login (${response.status})`);
    if (!response.ok) console.log('   Error:', data.error || data.message);
    return response.ok ? data.data?.access_token : null;
  } catch (error) {
    console.log(`❌ POST /auth/login - Network Error:`, error.message);
    return null;
  }
}

(async () => {
  console.log('🧪 Testing Dashboard GET Endpoints\n');
  
  // Try to login
  console.log('=== Authentication ===');
  const token = await testLogin();
  console.log('Token:', token ? 'Received' : 'None');
  
  console.log('\n=== Donors ===');
  await testGet('/donors', token);
  await testGet('/donors?blood_type=A+', token);
  
  console.log('\n=== Notifications ===');
  await testGet('/notifications', token);
  await testGet('/notifications/unread-count', token);
  
  console.log('\n=== Blood Requests ===');
  await testGet('/blood-requests', token);
  
  console.log('\n=== Donations ===');
  await testGet('/donations', token);
  
  console.log('\n=== Alerts ===');
  await testGet('/alerts', token);
  
  console.log('\n=== Reports ===');
  await testGet('/reports/summary', token);
  await testGet('/reports/blood-types', token);
  await testGet('/reports/monthly-donations', token);
  await testGet('/reports/availability-trend', token);
  
  console.log('\n=== Messages ===');
  await testGet('/messages', token);
  
  console.log('\n=== Users ===');
  await testGet('/users/profile', token);
  await testGet('/users/preferences', token);
})();
