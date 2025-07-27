import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🚨 API Error:', error.response?.status, error.response?.data?.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🔒 Token expired/invalid, redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const AUTH_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  RESEND_OTP: '/auth/resend-otp',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

// Authentication API functions
export const authAPI = {
  // Send OTP for registration
  sendOTP: async (email, role) => {
    const response = await api.post(AUTH_ENDPOINTS.SEND_OTP, { email, role });
    return response.data;
  },

  // Verify OTP and complete registration
  verifyOTP: async (email, username, password, full_name, role, otp) => {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, {
      email,
      username,
      password,
      full_name,
      role,
      otp,
    });
    return response.data;
  },

  // Login user
  login: async (username, password, role) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
      username,
      password,
      role,
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email, role) => {
    const response = await api.post(AUTH_ENDPOINTS.RESEND_OTP, { email, role });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const healthURL = baseURL.replace('/api', '');
  const response = await axios.get(`${healthURL}/health`);
  return response.data;
};

// Admin Dashboard API endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD_STATS: '/admin/dashboard/stats',
  TRANSACTIONS_BY_STEP: '/admin/dashboard/transactions-by-step',
  AMOUNTS_BY_DATE: '/admin/dashboard/amounts-by-date',
  AMOUNT_BY_CATEGORY: '/admin/dashboard/amount-by-category',
  FRAUD_STATS: '/admin/dashboard/fraud-stats',
  TRANSACTIONS: '/admin/dashboard/transactions',
};

// Admin Dashboard API functions
export const adminAPI = {
  // Get dashboard overview statistics
  getDashboardStats: async () => {
    const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  },

  // Get transactions by date for line chart
  getTransactionsByStep: async () => {
    const response = await api.get(ADMIN_ENDPOINTS.TRANSACTIONS_BY_STEP);
    return response.data;
  },

  // Get transaction amounts by date for line chart
  getAmountsByDate: async () => {
    const response = await api.get(ADMIN_ENDPOINTS.AMOUNTS_BY_DATE);
    return response.data;
  },

  // Get amount by category for bar chart
  getAmountByCategory: async () => {
    const response = await api.get(ADMIN_ENDPOINTS.AMOUNT_BY_CATEGORY);
    return response.data;
  },

  // Get fraud statistics for pie chart
  getFraudStats: async () => {
    const response = await api.get(ADMIN_ENDPOINTS.FRAUD_STATS);
    return response.data;
  },

  // Get transactions with pagination and search
  getTransactions: async (page = 1, limit = 50, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search
    });
    const response = await api.get(`${ADMIN_ENDPOINTS.TRANSACTIONS}?${params}`);
    return response.data;
  },
};

// Client Dashboard API endpoints
export const CLIENT_ENDPOINTS = {
  DASHBOARD_STATS: '/client/dashboard/stats',
  TRANSACTIONS_BY_STEP: '/client/dashboard/transactions-by-step',
  AMOUNT_BY_CUSTOMER: '/client/dashboard/amount-by-customer',
  FRAUD_STATS: '/client/dashboard/fraud-stats',
  TRANSACTIONS: '/client/dashboard/transactions',
  CATEGORY_BREAKDOWN: '/client/dashboard/category-breakdown',
};

// Client Dashboard API functions
export const clientAPI = {
  // Get dashboard overview statistics for merchant
  getDashboardStats: async (merchantId) => {
    const params = new URLSearchParams({ merchant_id: merchantId });
    const response = await api.get(`${CLIENT_ENDPOINTS.DASHBOARD_STATS}?${params}`);
    return response.data;
  },

  // Get transactions by step for line chart
  getTransactionsByStep: async (merchantId) => {
    const params = new URLSearchParams({ merchant_id: merchantId });
    const response = await api.get(`${CLIENT_ENDPOINTS.TRANSACTIONS_BY_STEP}?${params}`);
    return response.data;
  },

  // Get amount by customer for bar chart
  getAmountByCustomer: async (merchantId) => {
    const params = new URLSearchParams({ merchant_id: merchantId });
    const response = await api.get(`${CLIENT_ENDPOINTS.AMOUNT_BY_CUSTOMER}?${params}`);
    return response.data;
  },

  // Get fraud statistics for pie chart
  getFraudStats: async (merchantId) => {
    const params = new URLSearchParams({ merchant_id: merchantId });
    const response = await api.get(`${CLIENT_ENDPOINTS.FRAUD_STATS}?${params}`);
    return response.data;
  },

  // Get transactions with pagination and search
  getTransactions: async (page = 1, limit = 50, search = '', merchantId) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
      merchant_id: merchantId
    });
    const response = await api.get(`${CLIENT_ENDPOINTS.TRANSACTIONS}?${params}`);
    return response.data;
  },

  // Get category breakdown
  getCategoryBreakdown: async (merchantId) => {
    const params = new URLSearchParams({ merchant_id: merchantId });
    const response = await api.get(`${CLIENT_ENDPOINTS.CATEGORY_BREAKDOWN}?${params}`);
    return response.data;
  },
};

// User Dashboard API endpoints
export const USER_ENDPOINTS = {
  DASHBOARD_STATS: '/user/dashboard/stats',
  SPENDING_TIMELINE: '/user/dashboard/spending-timeline',
  MERCHANT_PREFERENCES: '/user/dashboard/merchant-preferences',
  FRAUD_ALERTS: '/user/dashboard/fraud-alerts',
  TRANSACTIONS: '/user/dashboard/transactions',
};

// User Dashboard API functions
export const userAPI = {
  // Get dashboard overview statistics for user
  getDashboardStats: async (customerId) => {
    const params = new URLSearchParams({ customer_id: customerId });
    const response = await api.get(`${USER_ENDPOINTS.DASHBOARD_STATS}?${params}`);
    return response.data;
  },

  // Get spending timeline for line chart
  getSpendingTimeline: async (customerId) => {
    const params = new URLSearchParams({ customer_id: customerId });
    const response = await api.get(`${USER_ENDPOINTS.SPENDING_TIMELINE}?${params}`);
    return response.data;
  },

  // Get merchant preferences for bar chart
  getMerchantPreferences: async (customerId) => {
    const params = new URLSearchParams({ customer_id: customerId });
    const response = await api.get(`${USER_ENDPOINTS.MERCHANT_PREFERENCES}?${params}`);
    return response.data;
  },

  // Get fraud alerts
  getFraudAlerts: async (customerId) => {
    const params = new URLSearchParams({ customer_id: customerId });
    const response = await api.get(`${USER_ENDPOINTS.FRAUD_ALERTS}?${params}`);
    return response.data;
  },

  // Get transactions with pagination and search
  getTransactions: async (page = 1, limit = 20, search = '', customerId) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
      customer_id: customerId
    });
    const response = await api.get(`${USER_ENDPOINTS.TRANSACTIONS}?${params}`);
    return response.data;
  },
};

export default api; 