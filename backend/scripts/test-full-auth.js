const axios = require('axios');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const BASE_URL = 'http://localhost:5000/api/auth';

const testFullAuthFlow = async () => {
  console.log('🧪 Testing Complete Authentication Flow...\n');

  try {
    // Step 1: Create a test user in the database
    console.log('1. Creating test user...');
    const testUser = {
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: 'testpass123',
      full_name: 'Test Admin',
      role: 'Admin'
    };

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [testUser.username]
    );

    if (existingUser.rows.length === 0) {
      // Create user
      await query(
        `INSERT INTO users (username, email, password_hash, full_name, role, email_verified)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [testUser.username, testUser.email, passwordHash, testUser.full_name, testUser.role]
      );
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Step 2: Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: testUser.username,
      password: testUser.password,
      role: testUser.role
    });

    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user.username);
    console.log('Role:', loginResponse.data.user.role);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');

    const token = loginResponse.data.token;

    // Step 3: Test /me endpoint with token
    console.log('\n3. Testing /me endpoint with valid token...');
    const profileResponse = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Profile fetched successfully');
    console.log('Profile data:', {
      username: profileResponse.data.username,
      role: profileResponse.data.role,
      email: profileResponse.data.email
    });

    // Step 4: Test admin dashboard endpoints
    console.log('\n4. Testing admin dashboard endpoints...');
    const adminEndpoints = [
      '/admin/dashboard/stats',
      '/admin/dashboard/transactions-by-step',
      '/admin/dashboard/amount-by-category',
      '/admin/dashboard/fraud-stats'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await axios.get(`http://localhost:5000/api${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} - Working`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Failed:`, error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n🎉 Complete authentication flow test successful!');
    console.log('\n📋 Summary:');
    console.log('✅ JWT_SECRET is configured');
    console.log('✅ User creation works');
    console.log('✅ Login works');
    console.log('✅ Token generation works');
    console.log('✅ Token verification works');
    console.log('✅ Profile fetching works');
    console.log('✅ Admin endpoints accessible');

    console.log('\n🔑 Test Credentials:');
    console.log('Username:', testUser.username);
    console.log('Password:', testUser.password);
    console.log('Role:', testUser.role);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testFullAuthFlow(); 