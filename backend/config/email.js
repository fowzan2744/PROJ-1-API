const nodemailer = require('nodemailer');

// Check if email service is configured
const isEmailConfigured = () => {
  return process.env.EMAIL_HOST && 
         process.env.EMAIL_USER && 
         process.env.EMAIL_PASS;
};

// Create transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.log('📧 Email service not configured - using console fallback');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  otpVerification: (otp, username) => ({
    subject: 'FinanceHub - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">FinanceHub</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Financial Analytics</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Hello ${username || 'there'},<br><br>
            Thank you for registering with FinanceHub! To complete your registration, please use the verification code below:
          </p>
          
          <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Verification Code</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 FinanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  welcomeEmail: (username, role) => ({
    subject: 'Welcome to FinanceHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">FinanceHub</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Financial Analytics</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to FinanceHub! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Hello ${username},<br><br>
            Welcome to FinanceHub! Your account has been successfully created and verified. You're now ready to explore our powerful financial analytics platform.
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Your Account Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Role:</strong> ${role}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745;">✓ Verified</span></p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Get Started
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 FinanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    console.log(transporter);
    console.log("yes sent");
    if (!transporter) {
      // Fallback: Log OTP to console for development
      console.log('📧 [EMAIL FALLBACK] OTP for', to, ':', data.otp || data.code);
      console.log('📧 [EMAIL FALLBACK] Template:', template);
      return { success: true, messageId: 'console-fallback', fallback: true };
    }

    let emailContent;
    if (template === 'welcomeEmail') {
      emailContent = emailTemplates[template](data.username, data.role);
    } else if (template === 'otpVerification') {
      emailContent = emailTemplates[template](data.otp || data.code, data.username);
    } else {
      emailContent = emailTemplates[template](data.otp || data.code, data.username);
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Fallback: Log OTP to console if email fails
    console.log('📧 [EMAIL FALLBACK] OTP for', to, ':', data.otp || data.code);
    return { success: true, messageId: 'console-fallback', fallback: true, error: error.message };
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendEmail,
  generateOTP,
  emailTemplates,
  isEmailConfigured
}; 