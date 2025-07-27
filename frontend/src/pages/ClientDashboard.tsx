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
import { clientAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/utils/mockData';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [transactionsByStep, setTransactionsByStep] = useState<any[]>([]);
  const [amountByCustomer, setAmountByCustomer] = useState<any[]>([]);
  const [fraudStats, setFraudStats] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all client dashboard data in parallel
        const [
          statsData,
          transactionsByStepData,
          amountByCustomerData,
          fraudStatsData,
          categoryBreakdownData,
          transactionsData
        ] = await Promise.all([
          clientAPI.getDashboardStats('M001'), // Default merchant for testing
          clientAPI.getTransactionsByStep('M001'),
          clientAPI.getAmountByCustomer('M001'),
          clientAPI.getFraudStats('M001'),
          clientAPI.getCategoryBreakdown('M001'),
          clientAPI.getTransactions(1, 50, '', 'M001')
        ]);

        setStats(statsData);
        setTransactionsByStep(transactionsByStepData);
        setAmountByCustomer(amountByCustomerData);
        setFraudStats(fraudStatsData);
        setCategoryBreakdown(categoryBreakdownData);
        setTransactions(transactionsData.transactions);

      } catch (err: any) {
        console.error('Error fetching client dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load client dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          value={stats?.totalTransactions?.toLocaleString() || '0'}
          change="+5% from last period"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalAmount?.toLocaleString() || '0'}`}
          change="-2% from last period"
          changeType="negative"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Fraud Detected"
          value={stats?.fraudCount || 0}
          change={`${stats?.fraudPercentage || 0}% fraud rate`}
          changeType="negative"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Transactions Over Time"
          data={transactionsByStep}
          xKey="step"
          yKey="count"
          label="Transaction Count"
          color="hsl(142, 76%, 36%)"
        />
        
        <PieChart
          title="Fraud vs Legitimate"
          data={fraudStats}
          labelKey="label"
          valueKey="value"
          colors={['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']}
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
          value={`$${Math.round(stats?.avgAmount || 0)}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Largest Transaction"
          value={`$${Math.round(stats?.maxAmount || 0)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;