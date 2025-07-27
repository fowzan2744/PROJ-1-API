const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // For now, we'll skip admin check since auth is not fully implemented
  // TODO: Implement proper admin role checking
  next();
};

// Get dashboard overview statistics
router.get('/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get total transactions
    const transactionsResult = await client.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN fraud = true THEN 1 END) as fraud_count,
        AVG(amount) as avg_amount,
        MAX(amount) as max_amount
      FROM transactions
    `);

    // Get unique customers count
    const customersResult = await client.query(`
      SELECT COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions
    `);

    // Get unique merchants count
    const merchantsResult = await client.query(`
      SELECT COUNT(DISTINCT merchant_id) as unique_merchants
      FROM transactions
    `);

    client.release();

    const stats = transactionsResult.rows[0];
    const fraudPercentage = stats.total_transactions > 0 
      ? ((stats.fraud_count / stats.total_transactions) * 100).toFixed(1)
      : 0;

    res.json({
      totalTransactions: parseInt(stats.total_transactions),
      totalAmount: parseFloat(stats.total_amount || 0),
      fraudCount: parseInt(stats.fraud_count),
      fraudPercentage: parseFloat(fraudPercentage),
      avgAmount: parseFloat(stats.avg_amount || 0),
      maxAmount: parseFloat(stats.max_amount || 0),
      uniqueCustomers: parseInt(customersResult.rows[0].unique_customers),
      uniqueMerchants: parseInt(merchantsResult.rows[0].unique_merchants)
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get transactions by date (for line chart)
router.get('/dashboard/transactions-by-step', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      GROUP BY DATE(created_at)
      ORDER BY date
      LIMIT 30
    `);

    client.release();

    const data = result.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count),
      amount: parseFloat(row.total_amount || 0)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching transactions by date:', error);
    res.status(500).json({ error: 'Failed to fetch transactions by date' });
  }
});

// Get transaction amounts by date (for line chart)
router.get('/dashboard/amounts-by-date', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM transactions
      GROUP BY DATE(created_at)
      ORDER BY date
      LIMIT 30
    `);

    client.release();

    const data = result.rows.map(row => ({
      date: row.date,
      amount: parseFloat(row.total_amount || 0),
      count: parseInt(row.transaction_count)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching amounts by date:', error);
    res.status(500).json({ error: 'Failed to fetch amounts by date' });
  }
});

// Get amount by category (for bar chart)
router.get('/dashboard/amount-by-category', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        m.category,
        SUM(t.amount) as amount
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY amount DESC
    `);

    client.release();

    const data = result.rows.map(row => ({
      category: row.category,
      amount: parseFloat(row.amount)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching amount by category:', error);
    res.status(500).json({ error: 'Failed to fetch amount by category' });
  }
});

// Get fraud statistics (for pie chart)
router.get('/dashboard/fraud-stats', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        fraud,
        COUNT(*) as count
      FROM transactions
      GROUP BY fraud
    `);

    client.release();

    const data = result.rows.map(row => ({
      label: row.fraud ? 'Fraud' : 'Legitimate',
      value: parseInt(row.count)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching fraud stats:', error);
    res.status(500).json({ error: 'Failed to fetch fraud statistics' });
  }
});

// Get recent transactions (for table)
router.get('/dashboard/transactions', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const client = await pool.connect();
    
    let query = `
      SELECT 
        t.id,
        t.step,
        t.customer_id,
        t.merchant_id,
        t.amount,
        t.fraud,
        t.created_at,
        c.age,
        c.gender,
        c.zipcode as customer_zipcode,
        m.name as merchant_name,
        m.zip_code as merchant_zipcode,
        m.category
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.customer_id
      LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
    `;

    const params = [];
    if (search) {
      query += ` WHERE 
        t.customer_id ILIKE $1 OR 
        t.merchant_id ILIKE $1 OR 
        m.name ILIKE $1 OR 
        m.category ILIKE $1
      `;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await client.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM transactions t LEFT JOIN merchants m ON t.merchant_id = m.merchant_id`;
    if (search) {
      countQuery += ` WHERE 
        t.customer_id ILIKE $1 OR 
        t.merchant_id ILIKE $1 OR 
        m.name ILIKE $1 OR 
        m.category ILIKE $1
      `;
    }
    const countResult = await client.query(countQuery, search ? [`%${search}%`] : []);

    client.release();

    const transactions = result.rows.map(row => ({
      id: row.id,
      step: row.step,
      customer: row.customer_id,
      age: row.age,
      gender: row.gender,
      zipcodeOri: row.customer_zipcode,
      merchant: row.merchant_name || row.merchant_id,
      zipMerchant: row.merchant_zipcode,
      category: row.category,
      amount: parseFloat(row.amount),
      fraud: row.fraud ? 1 : 0,
      createdAt: row.created_at
    }));

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router; 