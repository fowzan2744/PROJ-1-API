const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
    const client = await pool.connect();
    
    // Test connection
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Available tables:', tables.rows.map(r => r.table_name));
    
    // Check data counts
    if (tables.rows.some(r => r.table_name === 'customers')) {
      const customerCount = await client.query('SELECT COUNT(*) FROM customers');
      console.log('👥 Customers:', customerCount.rows[0].count);
    }
    
    if (tables.rows.some(r => r.table_name === 'merchants')) {
      const merchantCount = await client.query('SELECT COUNT(*) FROM merchants');
      console.log('🏪 Merchants:', merchantCount.rows[0].count);
    }
    
    if (tables.rows.some(r => r.table_name === 'transactions')) {
      const transactionCount = await client.query('SELECT COUNT(*) FROM transactions');
      console.log('💳 Transactions:', transactionCount.rows[0].count);
      
      // Show sample transactions
      const sampleTransactions = await client.query('SELECT * FROM transactions LIMIT 3');
      console.log('📊 Sample transactions:', sampleTransactions.rows);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
};

testDatabase(); 