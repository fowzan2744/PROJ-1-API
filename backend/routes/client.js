const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware to check if user is client/merchant
const requireClient = (req, res, next) => {
  // For now, we'll skip client check since auth is not fully implemented
  // TODO: Implement proper client role checking
  next();
};

// Get client dashboard overview statistics (for specific merchant)
router.get('/dashboard/stats', requireClient, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get total transactions for this merchant
    const transactionsResult = await client.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN fraud = true THEN 1 END) as fraud_count,
        AVG(amount) as avg_amount,
        MAX(amount) as max_amount
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE m.merchant_id = $1
    `, [req.query.merchant_id || 'M001']); // Default merchant for testing

    // Get unique customers for this merchant
    const customersResult = await client.query(`
      SELECT COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE m.merchant_id = $1
    `, [req.query.merchant_id || 'M001']);

    // Get merchant info
    const merchantResult = await client.query(`
      SELECT name, category, zip_code
      FROM merchants
      WHERE merchant_id = $1
    `, [req.query.merchant_id || 'M001']);

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
      merchantInfo: merchantResult.rows[0] || {}
    });

  } catch (error) {
    console.error('Error fetching client dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch client dashboard statistics' });
  }
});

// Get transactions by step for this merchant (for line chart)
router.get('/dashboard/transactions-by-step', requireClient, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        t.step,
        COUNT(*) as count
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE m.merchant_id = $1
      GROUP BY t.step
      ORDER BY t.step
      LIMIT 20
    `, [req.query.merchant_id || 'M001']);

    client.release();

    const data = result.rows.map(row => ({
      step: parseInt(row.step),
      count: parseInt(row.count)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching client transactions by step:', error);
    res.status(500).json({ error: 'Failed to fetch client transactions by step' });
  }
});

// Get amount by customer for this merchant (for bar chart)
router.get('/dashboard/amount-by-customer', requireClient, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        t.customer_id,
        SUM(t.amount) as amount,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE m.merchant_id = $1
      GROUP BY t.customer_id
      ORDER BY amount DESC
      LIMIT 10
    `, [req.query.merchant_id || 'M001']);

    client.release();

    const data = result.rows.map(row => ({
      customer: row.customer_id,
      amount: parseFloat(row.amount),
      transactionCount: parseInt(row.transaction_count)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching client amount by customer:', error);
    res.status(500).json({ error: 'Failed to fetch client amount by customer' });
  }
});

// Get fraud statistics for this merchant (for pie chart)
router.get('/dashboard/fraud-stats', requireClient, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        t.fraud,
        COUNT(*) as count
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE m.merchant_id = $1
      GROUP BY t.fraud
    `, [req.query.merchant_id || 'M001']);

    client.release();

    const data = result.rows.map(row => ({
      label: row.fraud ? 'Fraud' : 'Legitimate',
      value: parseInt(row.count)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching client fraud stats:', error);
    res.status(500).json({ error: 'Failed to fetch client fraud statistics' });
  }
});

// Get recent transactions for this merchant (for table)
router.get('/dashboard/transactions', requireClient, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', merchant_id = 'M001' } = req.query;
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
      WHERE t.merchant_id = $1
    `;

    const params = [merchant_id];
    if (search) {
      query += ` AND (
        t.customer_id ILIKE $2 OR 
        c.zipcode ILIKE $2 OR 
        m.category ILIKE $2
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await client.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.customer_id
      LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.merchant_id = $1
    `;
    const countParams = [merchant_id];
    
    if (search) {
      countQuery += ` AND (
        t.customer_id ILIKE $2 OR 
        c.zipcode ILIKE $2 OR 
        m.category ILIKE $2
      )`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await client.query(countQuery, countParams);

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
    console.error('Error fetching client transactions:', error);
    res.status(500).json({ error: 'Failed to fetch client transactions' });
  }
});

// Get merchant's transaction categories breakdown
router.get('/dashboard/category-breakdown', requireClient, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        m.category,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.merchant_id = $1
      GROUP BY m.category
      ORDER BY total_amount DESC
    `, [req.query.merchant_id || 'M001']);

    client.release();

    const data = result.rows.map(row => ({
      category: row.category,
      transactionCount: parseInt(row.transaction_count),
      totalAmount: parseFloat(row.total_amount)
    }));

    res.json(data);

  } catch (error) {
    console.error('Error fetching client category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch client category breakdown' });
  }
});

module.exports = router; 