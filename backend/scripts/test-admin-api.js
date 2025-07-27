const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin';

const testEndpoints = async () => {
  console.log('🧪 Testing Admin API Endpoints...\n');

  try {
    // Test dashboard stats
    console.log('1. Testing /dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`);
    console.log('✅ Stats endpoint working:', {
      totalTransactions: statsResponse.data.totalTransactions,
      totalAmount: statsResponse.data.totalAmount,
      fraudCount: statsResponse.data.fraudCount,
      uniqueCustomers: statsResponse.data.uniqueCustomers
    });

    // Test transactions by step
    console.log('\n2. Testing /dashboard/transactions-by-step...');
    const stepResponse = await axios.get(`${BASE_URL}/dashboard/transactions-by-step`);
    console.log('✅ Transactions by step working:', stepResponse.data.length, 'data points');

    // Test amount by category
    console.log('\n3. Testing /dashboard/amount-by-category...');
    const categoryResponse = await axios.get(`${BASE_URL}/dashboard/amount-by-category`);
    console.log('✅ Amount by category working:', categoryResponse.data.length, 'categories');

    // Test fraud stats
    console.log('\n4. Testing /dashboard/fraud-stats...');
    const fraudResponse = await axios.get(`${BASE_URL}/dashboard/fraud-stats`);
    console.log('✅ Fraud stats working:', fraudResponse.data);

    // Test transactions with pagination
    console.log('\n5. Testing /dashboard/transactions...');
    const transactionsResponse = await axios.get(`${BASE_URL}/dashboard/transactions?page=1&limit=10`);
    console.log('✅ Transactions endpoint working:', {
      transactionsCount: transactionsResponse.data.transactions.length,
      totalPages: transactionsResponse.data.pagination.totalPages,
      total: transactionsResponse.data.pagination.total
    });

    console.log('\n🎉 All admin API endpoints are working correctly!');
    console.log('\n📊 Dashboard Summary:');
    console.log(`   • Total Transactions: ${statsResponse.data.totalTransactions.toLocaleString()}`);
    console.log(`   • Total Amount: $${statsResponse.data.totalAmount.toLocaleString()}`);
    console.log(`   • Fraud Rate: ${statsResponse.data.fraudPercentage}%`);
    console.log(`   • Unique Customers: ${statsResponse.data.uniqueCustomers.toLocaleString()}`);
    console.log(`   • Unique Merchants: ${statsResponse.data.uniqueMerchants.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testEndpoints(); 