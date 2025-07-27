import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import TransactionTable from '@/components/TransactionTable';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Activity
} from 'lucide-react';
import { 
  mockTransactions,
  getTotalStats,
  getTransactionsByStep,
  getAmountByCategory,
  getFraudStats,
  Transaction
} from '@/utils/mockData';

const AdminDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = getTotalStats(transactions);
  const transactionsByStep = getTransactionsByStep(transactions);
  const amountByCategory = getAmountByCategory(transactions);
  const fraudStats = getFraudStats(transactions);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Total Amount"
          value={`$${stats.totalAmount.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Fraud Detected"
          value={stats.fraudCount}
          change={`${stats.fraudPercentage}% fraud rate`}
          changeType="negative"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Active Users"
          value="1,234"
          change="+23% from last month"
          changeType="positive"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChart
            title="Transactions Over Time"
            data={transactionsByStep}
            xKey="step"
            yKey="count"
            label="Transaction Count"
            color="hsl(217, 91%, 60%)"
          />
        </div>
        
        <PieChart
          title="Fraud vs Legitimate"
          data={fraudStats}
          labelKey="label"
          valueKey="value"
          colors={['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']}
        />
        
        <div className="lg:col-span-3">
          <BarChart
            title="Transaction Amount by Category"
            data={amountByCategory}
            xKey="category"
            yKey="amount"
            label="Total Amount ($)"
            color="hsl(142, 76%, 36%)"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        title="All Transactions"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Average Transaction"
          value={`$${Math.round(stats.totalAmount / stats.totalTransactions)}`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Largest Transaction"
          value={`$${Math.max(...transactions.map(t => t.amount))}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Categories"
          value={amountByCategory.length}
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;