const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/client';

const testClientEndpoints = async () => {
  console.log('🧪 Testing Client/Merchant API Endpoints...\n');

  try {
    // Test dashboard stats
    console.log('1. Testing /dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats?merchant_id=M1823072687`);
    console.log('✅ Client stats endpoint working:', {
      totalTransactions: statsResponse.data.totalTransactions,
      totalAmount: statsResponse.data.totalAmount,
      fraudCount: statsResponse.data.fraudCount,
      uniqueCustomers: statsResponse.data.uniqueCustomers,
      merchantInfo: statsResponse.data.merchantInfo
    });

    // Test transactions by step
    console.log('\n2. Testing /dashboard/transactions-by-step...');
    const stepResponse = await axios.get(`${BASE_URL}/dashboard/transactions-by-step?merchant_id=M1823072687`);
    console.log('✅ Client transactions by step working:', stepResponse.data.length, 'data points');

    // Test amount by customer
    console.log('\n3. Testing /dashboard/amount-by-customer...');
    const customerResponse = await axios.get(`${BASE_URL}/dashboard/amount-by-customer?merchant_id=M1823072687`);
    console.log('✅ Client amount by customer working:', customerResponse.data.length, 'customers');

    // Test fraud stats
    console.log('\n4. Testing /dashboard/fraud-stats...');
    const fraudResponse = await axios.get(`${BASE_URL}/dashboard/fraud-stats?merchant_id=M1823072687`);
    console.log('✅ Client fraud stats working:', fraudResponse.data);

    // Test transactions with pagination
    console.log('\n5. Testing /dashboard/transactions...');
    const transactionsResponse = await axios.get(`${BASE_URL}/dashboard/transactions?page=1&limit=10&merchant_id=M1823072687`);
    console.log('✅ Client transactions endpoint working:', {
      transactionsCount: transactionsResponse.data.transactions.length,
      totalPages: transactionsResponse.data.pagination.totalPages,
      total: transactionsResponse.data.pagination.total
    });

    // Test category breakdown
    console.log('\n6. Testing /dashboard/category-breakdown...');
    const categoryResponse = await axios.get(`${BASE_URL}/dashboard/category-breakdown?merchant_id=M1823072687`);
    console.log('✅ Client category breakdown working:', categoryResponse.data.length, 'categories');

    console.log('\n🎉 All client API endpoints are working correctly!');
    console.log('\n📊 Client Dashboard Summary:');
    console.log(`   • Total Transactions: ${statsResponse.data.totalTransactions.toLocaleString()}`);
    console.log(`   • Total Revenue: $${statsResponse.data.totalAmount.toLocaleString()}`);
    console.log(`   • Fraud Rate: ${statsResponse.data.fraudPercentage}%`);
    console.log(`   • Unique Customers: ${statsResponse.data.uniqueCustomers.toLocaleString()}`);
    console.log(`   • Merchant: ${statsResponse.data.merchantInfo.name || 'N/A'}`);
    console.log(`   • Category: ${statsResponse.data.merchantInfo.category || 'N/A'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testClientEndpoints(); 