const jwt = require('jsonwebtoken');
require('dotenv').config();

const testJWT = () => {
  console.log('🧪 Testing JWT Token Generation and Verification...\n');

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in environment variables');
    return;
  }

  console.log('✅ JWT_SECRET is configured');
  console.log('✅ JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '7d');

  // Test token generation
  const testUserId = 'test-user-123';
  const token = jwt.sign(
    { userId: testUserId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  console.log('✅ Token generated successfully');
  console.log('Token length:', token.length);

  // Test token verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', decoded);
    
    if (decoded.userId === testUserId) {
      console.log('✅ User ID matches');
    } else {
      console.log('❌ User ID mismatch');
    }
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
  }

  // Test token expiration
  const expiredToken = jwt.sign(
    { userId: testUserId },
    process.env.JWT_SECRET,
    { expiresIn: '1s' }
  );

  console.log('\n⏰ Testing token expiration...');
  setTimeout(() => {
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
      console.log('❌ Expired token should have failed verification');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('✅ Expired token correctly rejected');
      } else {
        console.log('❌ Unexpected error for expired token:', error.message);
      }
    }
  }, 2000);

  console.log('\n🎉 JWT testing completed!');
};

testJWT(); 