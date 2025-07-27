const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkTableStructure() {
  try {
    console.log('🔍 Checking transactions table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Transactions table columns:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type})`);
    });
    
    // Also check a sample row
    console.log('\n📄 Sample transaction row:');
    const sampleResult = await pool.query('SELECT * FROM transactions LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log(sampleResult.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure(); 