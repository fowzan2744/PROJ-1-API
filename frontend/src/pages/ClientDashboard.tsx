import React, { useEffect, useState, useRef } from 'react';
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

        // Use user's username as merchant_id
        const merchantId = user?.username || 'M1823072687'; // Fallback for testing

        // Fetch all client dashboard data in parallel
        const [
          statsData,
          transactionsByStepData,
          amountByCustomerData,
          fraudStatsData,
          categoryBreakdownData,
          transactionsData
        ] = await Promise.all([
          clientAPI.getDashboardStats(merchantId),
          clientAPI.getTransactionsByStep(merchantId),
          clientAPI.getAmountByCustomer(merchantId),
          clientAPI.getFraudStats(merchantId),
          clientAPI.getCategoryBreakdown(merchantId),
          clientAPI.getTransactions(1, 50, '', merchantId)
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
  }, [user?.username]); // Re-fetch when user changes





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
      {/* Welcome Section with Category Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏪 Merchant Dashboard</h2>
            <p className="text-blue-100">Welcome back, {user?.username}! Here's your business performance overview.</p>
          </div>
          
        </div>
        
        <div className="mt-3 text-sm text-blue-200">
          <span className="bg-blue-500 px-2 py-1 rounded-full">
            Merchant Dashboard
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={stats?.totalTransactions?.toLocaleString() || '0'}
          change="+12% from last month"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue Earned"
          value={`$${stats?.totalAmount?.toLocaleString() || '0'}`}
          change="+8% from last month"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Unique Customers"
          value={stats?.uniqueCustomers?.toLocaleString() || '0'}
          change="+15 new customers"
          changeType="positive"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Fraud Alerts"
          value={stats?.fraudCount || 0}
          change={`${stats?.fraudPercentage || 0}% of transactions`}
          changeType="negative"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Daily Sales Performance"
          data={transactionsByStep}
          xKey="step"
          yKey="count"
          label="Sales Count"
          color="hsl(221, 83%, 53%)"
        />
        
        <PieChart
          title="Transaction Security Overview"
          data={fraudStats}
          labelKey="label"
          valueKey="value"
          colors={['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']}
        />
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        title="Recent Customer Transactions"
      />

      {/* Business Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Average Sale Value"
          value={`$${Math.round(stats?.avgAmount || 0)}`}
          change="per transaction"
          changeType="neutral"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Highest Sale"
          value={`$${Math.round(stats?.maxAmount || 0)}`}
          change="single transaction"
          changeType="neutral"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Customer Retention"
          value="94%"
          change="repeat customers"
          changeType="positive"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
      </div>

       
    </div>
  );
};

export default ClientDashboard;