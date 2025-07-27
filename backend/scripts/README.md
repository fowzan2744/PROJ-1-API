# CSV Upload Script

This script uploads financial transaction data from a CSV file to the PostgreSQL database.

## 📋 Prerequisites

1. **CSV File**: Place your `transactions.csv` file in the backend root directory
2. **Database**: Ensure your Neon database is running and accessible
3. **Environment**: Make sure `.env` file has the correct `DATABASE_URL`

## 📁 CSV File Structure

Your CSV file should have the following columns:

```csv
step,customer,age,gender,zipcodeOri,merchant,zipMerchant,category,amount,fraud
1,C123456,25,M,12345,M001,54321,electronics,150.50,0
2,C123457,30,F,12346,M002,54322,clothing,75.25,0
```

### Column Descriptions:

- **step**: Transaction step number (integer)
- **customer**: Customer ID (string)
- **age**: Customer age (integer)
- **gender**: Customer gender (M/F)
- **zipcodeOri**: Customer zipcode (string)
- **merchant**: Merchant ID (string)
- **zipMerchant**: Merchant zipcode (string)
- **category**: Transaction category (string)
- **amount**: Transaction amount (decimal)
- **fraud**: Fraud flag (0 or 1)

## 🚀 Usage

### 1. Prepare your CSV file
Place your `transactions.csv` file in the backend root directory.

### 2. Run the scripts

**Upload CSV data:**
```bash
npm run upload-csv
```

**Test database connection:**
```bash
npm run test-db
```

### 3. Monitor the output
The script will show:
- Database connection status
- Table creation progress
- Row processing progress (every 100 rows)
- Final statistics

## 📊 Database Tables Created

The script automatically creates these tables:

### Customers Table
```sql
CREATE TABLE customers (
  customer_id VARCHAR(50) PRIMARY KEY,
  age INTEGER,
  gender VARCHAR(10),
  zipcode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Merchants Table
```sql
CREATE TABLE merchants (
  merchant_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  zip_code VARCHAR(20),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  step INTEGER,
  customer_id VARCHAR(50) REFERENCES customers(customer_id),
  merchant_id VARCHAR(50) REFERENCES merchants(merchant_id),
  amount DECIMAL(10,2),
  fraud BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ⚠️ Important Notes

1. **Large Files**: For large CSV files, the script processes rows in batches
2. **Error Handling**: Failed rows are logged but don't stop the process
3. **Duplicates**: Customer and merchant duplicates are handled with `ON CONFLICT DO NOTHING`
4. **Transactions**: All transactions are inserted (no duplicate checking)

## 🔧 Troubleshooting

### Common Issues:

1. **File not found**: Ensure `transactions.csv` is in the backend root directory
2. **Database connection**: Check your `DATABASE_URL` in `.env`
3. **Permission errors**: Ensure the script has read access to the CSV file

### Error Messages:

- `❌ File not found`: CSV file is missing or in wrong location
- `❌ Database connection failed`: Check your database credentials
- `❌ Error processing row`: Individual row errors (logged but process continues)

## 📈 Performance Tips

- For large files (>10,000 rows), consider splitting into smaller files
- Monitor database performance during upload
- Ensure adequate database connection pool size 