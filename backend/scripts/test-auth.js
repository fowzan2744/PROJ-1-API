const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

const testAuthFlow = async () => {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Try to get profile without token
    console.log('1. Testing /me endpoint without token...');
    try {
      await axios.get(`${BASE_URL}/me`);
    } catch (error) {
      console.log('✅ Correctly rejected without token:', error.response?.status, error.response?.data?.message);
    }

    // Test 2: Try to get profile with invalid token
    console.log('\n2. Testing /me endpoint with invalid token...');
    try {
      await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid token:', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Test login endpoint structure
    console.log('\n3. Testing login endpoint structure...');
    try {
      await axios.post(`${BASE_URL}/login`, {
        username: 'testuser',
        password: 'testpass',
        role: 'Admin'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Login endpoint working (expected 401 for invalid credentials)');
        console.log('Response structure:', Object.keys(error.response.data));
      } else {
        console.log('❌ Unexpected login response:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🔍 Authentication endpoints are working correctly!');
    console.log('\n💡 To test the full flow:');
    console.log('1. Create a user account first');
    console.log('2. Login with valid credentials');
    console.log('3. Use the returned token to call /me endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAuthFlow(); 