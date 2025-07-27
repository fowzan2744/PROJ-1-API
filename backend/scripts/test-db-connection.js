const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('🕐 Server time:', result.rows[0].now);
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'merchants', 'transactions')
    `);
    
    console.log('📊 Existing tables:', tablesResult.rows.map(r => r.table_name));
    
    // Check if data exists
    if (tablesResult.rows.length > 0) {
      const countResult = await client.query('SELECT COUNT(*) as count FROM transactions');
      console.log('📈 Transaction count:', countResult.rows[0].count);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await pool.end();
  }
}

testConnection(); 