const BASE_URL = 'https://dugtung-next.vercel.app/api';

async function testRegister() {
  const url = `${BASE_URL}/auth/register`;
  const body = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    full_name: 'Test User',
    contact_number: '09123456789',
    role: 'donor'
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(`${response.ok ? '✅' : '❌'} POST /auth/register (${response.status})`);
    if (!response.ok) console.log('   Error:', data.error || data.message);
    else console.log('   Token:', data.data?.access_token ? 'Received' : 'None');
    return response.ok ? data.data?.access_token : null;
  } catch (error) {
    console.log(`❌ POST /auth/register - Error:`, error.message);
    return null;
  }
}

async function testLogin(contact) {
  const url = `${BASE_URL}/auth/login`;
  const body = { full_name: 'Test User', contact_number: contact };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(`${response.ok ? '✅' : '❌'} POST /auth/login (${response.status})`);
    if (!response.ok) console.log('   Error:', data.error || data.message);
    else console.log('   Token:', data.data?.access_token ? 'Received' : 'None');
    return response.ok ? data.data?.access_token : null;
  } catch (error) {
    console.log(`❌ POST /auth/login - Error:`, error.message);
    return null;
  }
}

async function testGetDonors(token) {
  const url = `${BASE_URL}/donors`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log(`${response.ok ? '✅' : '❌'} GET /donors (${response.status})`);
    if (!response.ok) console.log('   Error:', data.error || data.message);
    else console.log('   Donors count:', data.data?.donors?.length || 0);
  } catch (error) {
    console.log(`❌ GET /donors - Error:`, error.message);
  }
}

(async () => {
  console.log('🧪 Testing Register -> Login -> GET Flow\n');
  
  console.log('Step 1: Register new user');
  const token1 = await testRegister();
  
  console.log('\nStep 2: Login with contact number (no dashes)');
  const token2 = await testLogin('09123456789');
  
  console.log('\nStep 3: Login with contact number (with dashes)');
  const token3 = await testLogin('0912-345-6789');
  
  if (token1 || token2 || token3) {
    const token = token1 || token2 || token3;
    console.log('\nStep 4: Test GET /donors with token');
    await testGetDonors(token);
  }
})();
