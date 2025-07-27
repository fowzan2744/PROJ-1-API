const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test customer ID with data
const TEST_CUSTOMER_ID = 'C99729647';

async function testUserAPI() {
  console.log('🧪 Testing User Dashboard API Endpoints...\n');

  try {
    // 1. Test dashboard stats
    console.log('1. Testing /dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/user/dashboard/stats?customer_id=${TEST_CUSTOMER_ID}`);
    const stats = statsResponse.data;
    console.log('✅ User stats endpoint working:', {
      totalTransactions: stats.totalTransactions,
      totalSpent: stats.totalSpent,
      fraudCount: stats.fraudCount,
      uniqueMerchants: stats.uniqueMerchants,
      spendingByCategory: stats.spendingByCategory?.length || 0,
      recentActivity: stats.recentActivity?.length || 0
    });

    // 2. Test spending timeline
    console.log('\n2. Testing /dashboard/spending-timeline...');
    const timelineResponse = await axios.get(`${BASE_URL}/user/dashboard/spending-timeline?customer_id=${TEST_CUSTOMER_ID}`);
    const timeline = timelineResponse.data;
    console.log(`✅ User spending timeline working: ${timeline.length} data points`);

    // 3. Test merchant preferences
    console.log('\n3. Testing /dashboard/merchant-preferences...');
    const preferencesResponse = await axios.get(`${BASE_URL}/user/dashboard/merchant-preferences?customer_id=${TEST_CUSTOMER_ID}`);
    const preferences = preferencesResponse.data;
    console.log(`✅ User merchant preferences working: ${preferences.length} merchants`);

    // 4. Test fraud alerts
    console.log('\n4. Testing /dashboard/fraud-alerts...');
    const alertsResponse = await axios.get(`${BASE_URL}/user/dashboard/fraud-alerts?customer_id=${TEST_CUSTOMER_ID}`);
    const alerts = alertsResponse.data;
    console.log(`✅ User fraud alerts working: ${alerts.length} alerts`);

    // 5. Test transactions
    console.log('\n5. Testing /dashboard/transactions...');
    const transactionsResponse = await axios.get(`${BASE_URL}/user/dashboard/transactions?customer_id=${TEST_CUSTOMER_ID}&page=1&limit=10`);
    const transactions = transactionsResponse.data;
    console.log('✅ User transactions endpoint working:', {
      transactionsCount: transactions.transactions?.length || 0,
      totalPages: transactions.pagination?.totalPages || 0,
      total: transactions.pagination?.total || 0
    });

    // Summary
    console.log('\n🎉 All user API endpoints are working correctly!');
    console.log('\n📊 User Dashboard Summary:');
    console.log(`   • Total Transactions: ${stats.totalTransactions}`);
    console.log(`   • Total Spent: $${stats.totalSpent?.toFixed(2) || 0}`);
    console.log(`   • Fraud Rate: ${stats.fraudPercentage || 0}%`);
    console.log(`   • Unique Merchants: ${stats.uniqueMerchants}`);
    console.log(`   • Spending Categories: ${stats.spendingByCategory?.length || 0}`);
    console.log(`   • Recent Activity: ${stats.recentActivity?.length || 0}`);
    console.log(`   • Timeline Data: ${timeline.length} days`);
    console.log(`   • Favorite Merchants: ${preferences.length}`);
    console.log(`   • Fraud Alerts: ${alerts.length}`);

  } catch (error) {
    console.error('❌ Error testing user API:', error.response?.data || error.message);
  }
}

testUserAPI(); 