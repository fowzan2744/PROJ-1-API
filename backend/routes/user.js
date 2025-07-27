const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Middleware to require user authentication
const requireUser = (req, res, next) => {
  // Get customer_id from query params, authenticated user's username, or use a default
  // In a real implementation, the username would be the customer_id
  const customer_id = req.query.customer_id || req.user?.username || 'C99729647';
  req.customer_id = customer_id;
  next();
};

// Get user dashboard stats
router.get('/dashboard/stats', requireUser, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    // Get user's transaction statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as totalTransactions,
        SUM(amount) as totalSpent,
        AVG(amount) as avgTransaction,
        MAX(amount) as highestTransaction,
        COUNT(DISTINCT merchant_id) as uniqueMerchants,
        COUNT(CASE WHEN fraud = true THEN 1 END) as fraudCount
      FROM transactions 
      WHERE customer_id = $1
    `;

    // Get user's spending by category
    const categoryQuery = `
      SELECT 
        m.category,
        COUNT(*) as transactionCount,
        SUM(t.amount) as totalSpent
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.customer_id = $1
      GROUP BY m.category
      ORDER BY totalSpent DESC
      LIMIT 5
    `;

    // Get user's recent activity
    const recentActivityQuery = `
      SELECT 
        t.id as transaction_id,
        t.amount,
        t.step,
        t.fraud as is_fraud,
        t.created_at as timestamp,
        m.name as merchant_name,
        m.category as merchant_category
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.customer_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    const [statsResult, categoryResult, activityResult] = await Promise.all([
      pool.query(statsQuery, [customer_id]),
      pool.query(categoryQuery, [customer_id]),
      pool.query(recentActivityQuery, [customer_id])
    ]);

    const stats = statsResult.rows[0];
    const fraudPercentage = stats.totalTransactions > 0 ? 
      ((stats.fraudCount / stats.totalTransactions) * 100).toFixed(1) : 0;

    res.json({
      totalTransactions: parseInt(stats.totaltransactions) || 0,
      totalSpent: parseFloat(stats.totalspent) || 0,
      avgTransaction: parseFloat(stats.avgtransaction) || 0,
      highestTransaction: parseFloat(stats.highesttransaction) || 0,
      uniqueMerchants: parseInt(stats.uniquemerchants) || 0,
      fraudCount: parseInt(stats.fraudcount) || 0,
      fraudPercentage: parseFloat(fraudPercentage),
      spendingByCategory: categoryResult.rows,
      recentActivity: activityResult.rows
    });

  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch user dashboard stats' });
  }
});

// Get user's spending over time
router.get('/dashboard/spending-timeline', requireUser, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    const query = `
      SELECT 
        DATE(t.created_at) as date,
        COUNT(*) as transactionCount,
        SUM(t.amount) as dailySpent
      FROM transactions t
      WHERE t.customer_id = $1
      GROUP BY DATE(t.created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const result = await pool.query(query, [customer_id]);
    
    res.json(result.rows.reverse()); // Reverse to show oldest first

  } catch (error) {
    console.error('Error fetching user spending timeline:', error);
    res.status(500).json({ error: 'Failed to fetch spending timeline' });
  }
});

// Get user's merchant preferences
router.get('/dashboard/merchant-preferences', requireUser, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    const query = `
      SELECT 
        m.merchant_id,
        m.name as merchant_name,
        m.category,
        COUNT(*) as visitCount,
        SUM(t.amount) as totalSpent,
        AVG(t.amount) as avgSpent
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.customer_id = $1
      GROUP BY m.merchant_id, m.name, m.category
      ORDER BY visitCount DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [customer_id]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching user merchant preferences:', error);
    res.status(500).json({ error: 'Failed to fetch merchant preferences' });
  }
});

// Get user's fraud alerts
router.get('/dashboard/fraud-alerts', requireUser, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    const query = `
      SELECT 
        t.id as transaction_id,
        t.amount,
        t.step,
        t.created_at as timestamp,
        m.name as merchant_name,
        m.category as merchant_category
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.customer_id = $1 AND t.fraud = true
      ORDER BY t.created_at DESC
      LIMIT 20
    `;

    const result = await pool.query(query, [customer_id]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching user fraud alerts:', error);
    res.status(500).json({ error: 'Failed to fetch fraud alerts' });
  }
});

// Get user's transaction history with pagination
router.get('/dashboard/transactions', requireUser, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      search = ''
    } = req.query;
    const customer_id = req.customer_id;

    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE t.customer_id = $1';
    let params = [customer_id];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (m.name ILIKE $${paramIndex} OR m.category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      ${whereClause}
    `;

    const transactionsQuery = `
      SELECT 
        t.id as transaction_id,
        t.amount,
        t.step,
        t.fraud as is_fraud,
        t.created_at as timestamp,
        m.name as merchant_name,
        m.category as merchant_category
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const [countResult, transactionsResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(transactionsQuery, [...params, limit, offset])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions: transactionsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router; 