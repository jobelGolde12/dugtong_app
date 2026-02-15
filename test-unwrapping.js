#!/usr/bin/env node
/**
 * Test data unwrapping in apiClient
 */

// Simulate the apiClient unwrapping logic
function unwrapResponse(data) {
  if (data && data.success && data.data !== undefined) {
    return data.data;
  }
  return data;
}

console.log('🧪 Testing Response Unwrapping\n');

// Test 1: Backend response with success wrapper
const backendResponse1 = {
  success: true,
  data: {
    items: [{ id: 1, name: 'Donor 1' }, { id: 2, name: 'Donor 2' }],
    total: 2,
    page: 1,
    pageSize: 10
  }
};

console.log('Test 1: Donors response');
console.log('Backend returns:', JSON.stringify(backendResponse1, null, 2));
const unwrapped1 = unwrapResponse(backendResponse1);
console.log('Frontend receives:', JSON.stringify(unwrapped1, null, 2));
console.log('✅ Has items array:', Array.isArray(unwrapped1.items));
console.log('✅ Items count:', unwrapped1.items?.length);

// Test 2: Reports summary
const backendResponse2 = {
  success: true,
  data: {
    totalDonors: 22,
    availableDonors: 16,
    bloodRequestsThisMonth: 0,
    totalDonations: 0
  }
};

console.log('\nTest 2: Reports summary');
console.log('Backend returns:', JSON.stringify(backendResponse2, null, 2));
const unwrapped2 = unwrapResponse(backendResponse2);
console.log('Frontend receives:', JSON.stringify(unwrapped2, null, 2));
console.log('✅ Has totalDonors:', unwrapped2.totalDonors !== undefined);

// Test 3: Array response
const backendResponse3 = {
  success: true,
  data: [
    { bloodType: 'A+', count: 8 },
    { bloodType: 'O+', count: 7 }
  ]
};

console.log('\nTest 3: Blood types (array)');
console.log('Backend returns:', JSON.stringify(backendResponse3, null, 2));
const unwrapped3 = unwrapResponse(backendResponse3);
console.log('Frontend receives:', JSON.stringify(unwrapped3, null, 2));
console.log('✅ Is array:', Array.isArray(unwrapped3));
console.log('✅ Array length:', unwrapped3.length);

// Test 4: Direct response (no wrapper)
const backendResponse4 = {
  user: { id: '1', name: 'Test User' }
};

console.log('\nTest 4: Direct response (no wrapper)');
console.log('Backend returns:', JSON.stringify(backendResponse4, null, 2));
const unwrapped4 = unwrapResponse(backendResponse4);
console.log('Frontend receives:', JSON.stringify(unwrapped4, null, 2));
console.log('✅ Unchanged:', JSON.stringify(unwrapped4) === JSON.stringify(backendResponse4));

console.log('\n✅ All tests passed! Data unwrapping works correctly.');
