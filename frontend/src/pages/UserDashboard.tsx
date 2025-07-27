import React, { useEffect, useState, useRef } from 'react';
import StatCard from '@/components/StatCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import TransactionTable from '@/components/TransactionTable';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  ShoppingBag,
  AlertTriangle,
  Calendar,
  MapPin
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/utils/mockData';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [spendingTimeline, setSpendingTimeline] = useState<any[]>([]);
  const [merchantPreferences, setMerchantPreferences] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use user's username as customer_id
        const customerId = user?.username || 'C99729647'; // Fallback for testing
        
        // Fetch all user dashboard data in parallel
        const [statsData, timelineData, preferencesData, alertsData, transactionsData] = await Promise.all([
          userAPI.getDashboardStats(customerId),
          userAPI.getSpendingTimeline(customerId),
          userAPI.getMerchantPreferences(customerId),
          userAPI.getFraudAlerts(customerId),
          userAPI.getTransactions(1, 20, '', customerId)
        ]);

        setStats(statsData);
        setSpendingTimeline(timelineData);
        setMerchantPreferences(preferencesData);
        setFraudAlerts(alertsData);
        
        // Transform transactions to match TransactionTable expected format
        const transformedTransactions = transactionsData.transactions.map((t: any) => ({
          step: t.step,
          customer: user?.username || 'You', // Use actual username from auth context
          age: 0, // Not available in user data
          gender: 'N/A', // Not available in user data
          zipcodeOri: 'N/A', // Not available in user data
          merchant: t.merchant_name,
          zipMerchant: 'N/A', // Not available in user data
          category: t.merchant_category,
          amount: parseFloat(t.amount),
          fraud: t.is_fraud ? 1 : 0
        }));
        setTransactions(transformedTransactions);

      } catch (err: any) {
        console.error('Error fetching user dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load user dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  // Prepare data for charts
  const spendingTimelineData = spendingTimeline.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    spent: parseFloat(item.dailyspent) || 0,
    transactions: parseInt(item.transactioncount) || 0
  }));

  const merchantPreferencesData = merchantPreferences.map(item => ({
    merchant: item.merchant_name,
    visits: parseInt(item.visitcount) || 0,
    spent: parseFloat(item.totalspent) || 0
  }));

  const fraudStatsData = [
    { label: 'Legitimate', value: stats?.totalTransactions - stats?.fraudCount || 0 },
    { label: 'Fraudulent', value: stats?.fraudCount || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">👤 Personal Finance Dashboard</h2>
            <p className="text-green-100">Welcome back, {user?.username}! Here's your spending overview and financial insights.</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-green-200">Account Status</div>
            <div className="text-lg font-semibold">Active</div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-green-200">
          <span className="bg-green-500 px-2 py-1 rounded-full">Premium Member</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Spent"
          value={`$${stats?.totalSpent?.toLocaleString() || '0'}`}
          change="+8% from last month"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Transactions"
          value={stats?.totalTransactions?.toLocaleString() || '0'}
          change="+12 transactions"
          changeType="positive"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Merchants Visited"
          value={stats?.uniqueMerchants?.toLocaleString() || '0'}
          change="+3 new places"
          changeType="positive"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Fraud Alerts"
          value={stats?.fraudCount || 0}
          change={`${stats?.fraudPercentage || 0}% of transactions`}
          changeType="negative"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Daily Spending Pattern"
          data={spendingTimelineData}
          xKey="date"
          yKey="spent"
          label="Amount Spent ($)"
          color="hsl(142, 76%, 36%)"
        />
        
        <PieChart
          title="Transaction Security"
          data={fraudStatsData}
          labelKey="label"
          valueKey="value"
          colors={['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']}
        />
      </div>

      {/* Merchant Preferences */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Favorite Merchants
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {merchantPreferences.slice(0, 6).map((merchant, index) => (
            <div key={merchant.merchant_id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">{merchant.merchant_name}</div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">{merchant.category}</div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">{merchant.visitCount} visits</span>
                <span className="text-green-600">${merchant.totalSpent?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {stats?.recentActivity?.slice(0, 5).map((activity: any) => (
            <div key={activity.transaction_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${activity.is_fraud ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <div>
                  <div className="font-medium">{activity.merchant_name}</div>
                  <div className="text-sm text-gray-500">{activity.merchant_category}</div>
                </div>
              </div>
              <div className="text-right">
                                       <div className="font-medium">${parseFloat(activity.amount || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        title="Your Transaction History"
      />

      {/* Financial Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Average Transaction"
          value={`$${Math.round(stats?.avgTransaction || 0)}`}
          change="per purchase"
          changeType="neutral"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Highest Purchase"
          value={`$${Math.round(stats?.highestTransaction || 0)}`}
          change="single transaction"
          changeType="neutral"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Security Score"
          value="95%"
          change="excellent"
          changeType="positive"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

     
    </div>
  );
};

export default UserDashboard;