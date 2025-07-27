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
import { adminAPI } from '@/services/api';
import { Transaction } from '@/utils/mockData';

const AdminDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [transactionsByStep, setTransactionsByStep] = useState<any[]>([]);
  const [amountsByDate, setAmountsByDate] = useState<any[]>([]);
  const [amountByCategory, setAmountByCategory] = useState<any[]>([]);
  const [fraudStats, setFraudStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [
          statsData,
          transactionsByStepData,
          amountsByDateData,
          amountByCategoryData,
          fraudStatsData,
          transactionsData
        ] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getTransactionsByStep(),
          adminAPI.getAmountsByDate(),
          adminAPI.getAmountByCategory(),
          adminAPI.getFraudStats(),
          adminAPI.getTransactions(1, 50)
        ]);

        setStats(statsData);
        setTransactionsByStep(transactionsByStepData);
        setAmountsByDate(amountsByDateData);
        setAmountByCategory(amountByCategoryData);
        setFraudStats(fraudStatsData);
        setTransactions(transactionsData.transactions);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions?.toLocaleString() || '0'}
          change="+12% from last month"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Total Amount"
          value={`$${stats?.totalAmount?.toLocaleString() || '0'}`}
          change="+8% from last month"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Fraud Detected"
          value={stats?.fraudCount || 0}
          change={`${stats?.fraudPercentage || 0}% fraud rate`}
          changeType="negative"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Active Users"
          value={stats?.uniqueCustomers?.toLocaleString() || '0'}
          change="+23% from last month"
          changeType="positive"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChart
            title="Transaction Count Over Time"
            data={transactionsByStep}
            xKey="date"
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
        
        <div className="lg:col-span-2">
          <LineChart
            title="Transaction Amount Over Time"
            data={amountsByDate}
            xKey="date"
            yKey="amount"
            label="Total Amount ($)"
            color="hsl(142, 76%, 36%)"
          />
        </div>
        
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
          value={`$${Math.round(stats?.avgAmount || 0)}`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Largest Transaction"
          value={`$${Math.round(stats?.maxAmount || 0)}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Categories"
          value={amountByCategory?.length || 0}
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;