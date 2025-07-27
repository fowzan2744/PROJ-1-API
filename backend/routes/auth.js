const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { query } = require('../config/database');
const { sendEmail, generateOTP } = require('../config/email');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateSendOTP,
  validatePasswordReset,
  validatePasswordUpdate
} = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP for email verification
// @access  Public
router.post('/send-otp', validateSendOTP, async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await query(
      'DELETE FROM email_verifications WHERE email = $1',
      [email]
    );

    // Save OTP to database
    await query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // Send email
    const emailResult = await sendEmail(email, 'otpVerification', {
      otp,
      username: email.split('@')[0]
    });

    if (!emailResult.success) {
      return res.status(500).json({
        error: 'Email sending failed',
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      message: 'OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send OTP'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration
// @access  Public
router.post('/verify-otp', validateOTP, async (req, res) => {
  try {
    const { email, username, password, full_name, role, otp } = req.body;

    // Verify OTP
    const otpResult = await query(
      'SELECT * FROM email_verifications WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'Invalid or expired verification code'
      });
    }

    // Check if username already exists
    const existingUsername = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({
        error: 'Username taken',
        message: 'This username is already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await query(
      `INSERT INTO users (username, email, password_hash, full_name, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, username, email, full_name, role, email_verified`,
      [username, email, passwordHash, full_name, role]
    );

    const user = userResult.rows[0];

    // Delete used OTP
    await query(
      'DELETE FROM email_verifications WHERE email = $1',
      [email]
    );

    // Generate JWT token
    const token = generateToken(user.id);

    // Send welcome email
    await sendEmail(email, 'welcomeEmail', {
      username: user.username,
      role: user.role
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified
      },
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Find user by username
    const userResult = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email address before logging in'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        error: 'Role mismatch',
        message: `Access denied for role: ${role}`
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', validateSendOTP, async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await query(
      'DELETE FROM email_verifications WHERE email = $1',
      [email]
    );

    // Save new OTP to database
    await query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // Send email
    const emailResult = await sendEmail(email, 'otpVerification', {
      otp,
      username: email.split('@')[0]
    });

    if (!emailResult.success) {
      return res.status(500).json({
        error: 'Email sending failed',
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      message: 'OTP resent successfully',
      email: email
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resend OTP'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get profile'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // You could implement a blacklist here if needed
    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Logout failed'
    });
  }
});

module.exports = router; 