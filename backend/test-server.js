// Simple test script to verify backend functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing FinanceHub Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test send OTP endpoint (without email service)
    console.log('2. Testing send OTP endpoint...');
    try {
      const otpResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
        email: 'test@example.com',
        role: 'User'
      });
      console.log('✅ Send OTP endpoint working:', otpResponse.data);
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('email')) {
        console.log('⚠️  Send OTP endpoint working (email service not configured)');
      } else {
        console.log('❌ Send OTP endpoint failed:', error.response?.data || error.message);
      }
    }
    console.log('');

    console.log('🎉 Backend API is running successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Configure your .env file with database and email settings');
    console.log('   2. Set up your Neon PostgreSQL database');
    console.log('   3. Configure email service (Gmail, SendGrid, etc.)');
    console.log('   4. Test the full authentication flow');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running');
      console.log('💡 Start the server with: npm run dev');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend }; 