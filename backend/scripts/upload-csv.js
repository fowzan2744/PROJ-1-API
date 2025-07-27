const fs = require('fs');
const { parse } = require('csv-parse');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Remove extra single quotes and trim spaces
const cleanValue = (val) => {
  if (!val) return null;
  return val.replace(/^'+|'+$/g, '').trim();
};

// Parse and clean row data
const parseRow = (row) => {
  const customer = {
    customer_id: cleanValue(row.customer),
    age: (() => {
      const ageVal = cleanValue(row.age);
      return ageVal && !isNaN(ageVal) ? parseInt(ageVal, 10) : null;
    })(),
    gender: cleanValue(row.gender),
    zipcode: cleanValue(row.zipcodeOri)
  };

  const merchant = {
    merchant_id: cleanValue(row.merchant),
    name: cleanValue(row.merchant),
    zip_code: cleanValue(row.zipMerchant),
    category: cleanValue(row.category)
  };

  const transaction = {
    step: (() => {
      const val = cleanValue(row.step);
      return val && !isNaN(val) ? parseInt(val, 10) : 0;
    })(),
    customer_id: cleanValue(row.customer),
    merchant_id: cleanValue(row.merchant),
    amount: (() => {
      const val = cleanValue(row.amount);
      return val && !isNaN(val) ? parseFloat(val) : 0;
    })(),
    fraud: cleanValue(row.fraud) === '1'
  };

  return { customer, merchant, transaction };
};

// Create tables if they don't exist
const createTables = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id VARCHAR(50) PRIMARY KEY,
      age INTEGER,
      gender VARCHAR(10),
      zipcode VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS merchants (
      merchant_id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255),
      zip_code VARCHAR(20),
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      step INTEGER,
      customer_id VARCHAR(50) REFERENCES customers(customer_id),
      merchant_id VARCHAR(50) REFERENCES merchants(merchant_id),
      amount DECIMAL(10,2),
      fraud BOOLEAN,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// Insert data into DB
const insertData = async (client, customer, merchant, transaction) => {
  await client.query(`
    INSERT INTO customers (customer_id, age, gender, zipcode)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (customer_id) DO NOTHING;
  `, [customer.customer_id, customer.age, customer.gender, customer.zipcode]);

  await client.query(`
    INSERT INTO merchants (merchant_id, name, zip_code, category)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (merchant_id) DO NOTHING;
  `, [merchant.merchant_id, merchant.name, merchant.zip_code, merchant.category]);

  await client.query(`
    INSERT INTO transactions (step, customer_id, merchant_id, amount, fraud)
    VALUES ($1, $2, $3, $4, $5);
  `, [transaction.step, transaction.customer_id, transaction.merchant_id, transaction.amount, transaction.fraud]);
};

// Upload CSV
const uploadCSV = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const client = await pool.connect();
  let processedRows = 0;
  let errorRows = 0;

  try {
    console.log('✅ Creating tables...');
    await createTables(client);

    console.log(`📁 Reading CSV: ${filePath}`);
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

    for await (const row of parser) {
      try {
        const { customer, merchant, transaction } = parseRow(row);
        await insertData(client, customer, merchant, transaction);
        processedRows++;
        if (processedRows % 500 === 0) {
          console.log(`📊 Processed ${processedRows} rows...`);
        }
      } catch (err) {
        errorRows++;
        console.error(`❌ Error on row ${processedRows + errorRows}: ${err.message}`);
      }
    }

    console.log('\n✅ CSV upload completed!');
    console.log(`📈 Processed: ${processedRows}, Errors: ${errorRows}`);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run
const main = async () => {
  try {
    console.log('🚀 Starting CSV upload process...');
    
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');

    // Upload CSV
    const filePath = './Dataset.csv';
    await uploadCSV(filePath);

    console.log('🎉 Upload process completed successfully!');
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
    process.exit(1);
  }
};

main();
