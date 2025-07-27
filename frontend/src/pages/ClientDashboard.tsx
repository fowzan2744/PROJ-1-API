import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import TransactionTable from '@/components/TransactionTable';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  ShoppingBag
} from 'lucide-react';
import { 
  mockTransactions,
  getSpendingTrend,
  getCategoryBreakdown,
  Transaction
} from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter transactions for a specific client (mock behavior)
      const clientTransactions = mockTransactions.filter(t => 
        t.customer.includes('001') || t.customer.includes('002') || t.customer.includes('003')
      );
      
      setTransactions(clientTransactions);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const spendingTrend = getSpendingTrend(transactions);
  const categoryBreakdown = getCategoryBreakdown(transactions);
  
  // Get top category
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}!</h2>
        <p className="text-primary-foreground/80">Here's your financial overview for this period.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          change="+5% from last period"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Total Spend"
          value={`$${totalSpend.toLocaleString()}`}
          change="-2% from last period"
          changeType="negative"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Top Category"
          value={topCategory?.category.replace('_', ' ') || 'N/A'}
          change={topCategory ? `$${topCategory.amount.toLocaleString()}` : ''}
          changeType="neutral"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Spending Trend"
          data={spendingTrend}
          xKey="step"
          yKey="amount"
          label="Amount Spent ($)"
          color="hsl(142, 76%, 36%)"
        />
        
        <PieChart
          title="Category Breakdown"
          data={categoryBreakdown.slice(0, 6)} // Top 6 categories
          labelKey="category"
          valueKey="amount"
        />
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        title="Your Recent Transactions"
      />

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Average Transaction"
          value={`$${totalTransactions > 0 ? Math.round(totalSpend / totalTransactions) : 0}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Largest Purchase"
          value={`$${transactions.length > 0 ? Math.max(...transactions.map(t => t.amount)) : 0}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;