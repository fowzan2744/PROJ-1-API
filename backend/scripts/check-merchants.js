const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkMerchants() {
  try {
    console.log('🔍 Checking available merchants in database...\n');
    
    const result = await pool.query('SELECT merchant_id, name, category FROM merchants LIMIT 10');
    
    console.log('📊 Available merchants:');
    result.rows.forEach((merchant, index) => {
      console.log(`${index + 1}. ${merchant.merchant_id} - ${merchant.name || 'No name'} (${merchant.category || 'No category'})`);
    });
    
    if (result.rows.length === 0) {
      console.log('❌ No merchants found in database!');
      console.log('💡 You may need to run the CSV upload script first:');
      console.log('   node scripts/upload-csv.js');
    } else {
      console.log(`\n✅ Found ${result.rows.length} merchants`);
      console.log('\n💡 Use one of these merchant_ids in your client dashboard:');
      result.rows.slice(0, 3).forEach(merchant => {
        console.log(`   - ${merchant.merchant_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMerchants(); 