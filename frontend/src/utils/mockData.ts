// Mock financial transaction data
export interface Transaction {
  step: number;
  customer: string;
  age: number;
  gender: string;
  zipcodeOri: string;
  merchant: string;
  zipMerchant: string;
  category: string;
  amount: number;
  fraud: number;
}

const categories = ['gas_transport', 'grocery_pos', 'home', 'health_fitness', 'shopping_net', 'misc_net', 'entertainment', 'food_dining', 'personal_care', 'travel'];
const merchants = ['Shell', 'Walmart', 'Amazon', 'Target', 'CVS', 'Home Depot', 'McDonalds', 'Starbucks', 'Netflix', 'Uber'];
const genders = ['M', 'F'];

// Generate mock data
export const generateMockTransactions = (count: number = 100): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const customer = `Customer_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const age = Math.floor(Math.random() * 60) + 18;
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = Math.floor(Math.random() * 500) + 5;
    const fraud = Math.random() < 0.1 ? 1 : 0; // 10% fraud rate
    
    transactions.push({
      step: i + 1,
      customer,
      age,
      gender,
      zipcodeOri: String(Math.floor(Math.random() * 90000) + 10000),
      merchant,
      zipMerchant: String(Math.floor(Math.random() * 90000) + 10000),
      category,
      amount,
      fraud
    });
  }
  
  return transactions;
};

// Pre-generated dataset
export const mockTransactions = generateMockTransactions(200);

// Aggregate data for charts
export const getTransactionsByStep = (transactions: Transaction[]) => {
  const stepData: { [key: number]: number } = {};
  
  transactions.forEach(t => {
    stepData[t.step] = (stepData[t.step] || 0) + 1;
  });
  
  return Object.entries(stepData)
    .map(([step, count]) => ({ step: parseInt(step), count }))
    .sort((a, b) => a.step - b.step)
    .slice(0, 20); // Limit to first 20 steps for readability
};

export const getAmountByCategory = (transactions: Transaction[]) => {
  const categoryData: { [key: string]: number } = {};
  
  transactions.forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
  });
  
  return Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount);
};

export const getFraudStats = (transactions: Transaction[]) => {
  const fraudCount = transactions.filter(t => t.fraud === 1).length;
  const legitimateCount = transactions.length - fraudCount;
  
  return [
    { label: 'Legitimate', value: legitimateCount },
    { label: 'Fraud', value: fraudCount }
  ];
};

export const getTotalStats = (transactions: Transaction[]) => {
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const fraudCount = transactions.filter(t => t.fraud === 1).length;
  const fraudPercentage = ((fraudCount / totalTransactions) * 100).toFixed(1);
  
  return {
    totalTransactions,
    totalAmount: Math.round(totalAmount),
    fraudCount,
    fraudPercentage: parseFloat(fraudPercentage)
  };
};

export const getSpendingTrend = (transactions: Transaction[], customerFilter?: string) => {
  let filteredTransactions = transactions;
  
  if (customerFilter) {
    filteredTransactions = transactions.filter(t => t.customer === customerFilter);
  }
  
  const stepSpending: { [key: number]: number } = {};
  
  filteredTransactions.forEach(t => {
    stepSpending[t.step] = (stepSpending[t.step] || 0) + t.amount;
  });
  
  return Object.entries(stepSpending)
    .map(([step, amount]) => ({ step: parseInt(step), amount: Math.round(amount) }))
    .sort((a, b) => a.step - b.step)
    .slice(0, 20);
};

export const getCategoryBreakdown = (transactions: Transaction[], customerFilter?: string) => {
  let filteredTransactions = transactions;
  
  if (customerFilter) {
    filteredTransactions = transactions.filter(t => t.customer === customerFilter);
  }
  
  return getAmountByCategory(filteredTransactions);
};