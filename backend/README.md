# FinanceHub Backend API

A robust Express.js backend API for the FinanceHub application with authentication, email verification, and PostgreSQL database integration.

## 🚀 Features

- **Authentication System**: JWT-based authentication with role-based access control
- **Email Verification**: OTP-based email verification using Nodemailer
- **Database**: PostgreSQL with Neon DB integration
- **Security**: Password hashing, rate limiting, CORS, and Helmet security
- **Validation**: Request validation using express-validator
- **Error Handling**: Comprehensive error handling middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Neon DB recommended)
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration (Neon PostgreSQL)
   DATABASE_URL=postgresql://username:password@host:port/database

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=FinanceHub <your-email@gmail.com>

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up your database:**
   - Create a PostgreSQL database (Neon DB recommended)
   - Update the `DATABASE_URL` in your `.env` file
   - The application will automatically create tables on first run

5. **Configure email service:**
   - For Gmail: Enable 2-factor authentication and generate an app password
   - For other providers: Use appropriate SMTP settings

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📚 API Endpoints

### Authentication Routes

#### POST `/api/auth/send-otp`
Send OTP for email verification during registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "User"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "email": "user@example.com"
}
```

#### POST `/api/auth/verify-otp`
Verify OTP and complete user registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "full_name": "John Doe",
  "role": "User",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "User",
    "email_verified": true
  },
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123",
  "role": "User"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "User",
    "email_verified": true
  },
  "token": "jwt-token"
}
```

#### POST `/api/auth/resend-otp`
Resend OTP for email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "User"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Health Check

#### GET `/health`
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "FinanceHub API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎭 User Roles

- **Admin**: System administration and full access
- **Client**: Business analytics and client-specific features
- **User**: Personal finance management

## 📧 Email Templates

The application includes beautiful HTML email templates for:
- OTP verification emails
- Welcome emails

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Client', 'User')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Verifications Table
```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | - |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 