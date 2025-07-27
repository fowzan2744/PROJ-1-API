const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin';

async function testEndpoints() {
  console.log('🧪 Testing Admin API Endpoints...\n');

  try {
    // Test dashboard stats
    console.log('1. Testing /dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`);
    console.log('✅ Stats endpoint working:', {
      totalTransactions: statsResponse.data.totalTransactions,
      totalAmount: statsResponse.data.totalAmount,
      fraudCount: statsResponse.data.fraudCount
    });

    // Test transactions by date
    console.log('\n2. Testing /dashboard/transactions-by-step...');
    const dateResponse = await axios.get(`${BASE_URL}/dashboard/transactions-by-step`);
    console.log('✅ Transactions by date working:', dateResponse.data.length, 'data points');
    console.log('Sample data:', dateResponse.data.slice(0, 3));

    // Test amounts by date
    console.log('\n3. Testing /dashboard/amounts-by-date...');
    const amountsResponse = await axios.get(`${BASE_URL}/dashboard/amounts-by-date`);
    console.log('✅ Amounts by date working:', amountsResponse.data.length, 'data points');
    console.log('Sample data:', amountsResponse.data.slice(0, 3));

    console.log('\n🎉 All endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints(); 