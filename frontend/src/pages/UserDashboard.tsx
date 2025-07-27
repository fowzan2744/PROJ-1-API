import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import LineChart from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  mockTransactions,
  getSpendingTrend,
  Transaction
} from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Filter transactions for a specific user (mock behavior)
      const userTransactions = mockTransactions.filter(t => 
        t.customer.includes('001')
      ).slice(0, 20); // Limit to recent transactions
      
      setTransactions(userTransactions);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = 5000 - totalSpend; // Mock balance calculation
  const spendingTrend = getSpendingTrend(transactions);
  const recentTransactions = transactions.slice(0, 5);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-success rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Hello, {user?.username}!</h2>
        <p className="text-success-foreground/80">Manage your personal finances with ease.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Current Balance"
          value={formatAmount(currentBalance)}
          change={currentBalance > 4000 ? "Good standing" : "Consider reviewing expenses"}
          changeType={currentBalance > 4000 ? "positive" : "neutral"}
          icon={<Wallet className="h-4 w-4" />}
          className="bg-gradient-card"
        />
        <StatCard
          title="This Period Spending"
          value={formatAmount(totalSpend)}
          change={`${transactions.length} transactions`}
          changeType="neutral"
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      {/* Spending Chart */}
      <LineChart
        title="Your Spending Pattern"
        data={spendingTrend}
        xKey="step"
        yKey="amount"
        label="Amount Spent ($)"
        color="hsl(142, 76%, 36%)"
      />

      {/* Recent Transactions */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.merchant}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatAmount(transaction.amount)}
                  </p>
                  <Badge 
                    variant={transaction.fraud === 1 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {transaction.fraud === 1 ? "Flagged" : "Verified"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Average Spend"
          value={formatAmount(transactions.length > 0 ? totalSpend / transactions.length : 0)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Largest Purchase"
          value={formatAmount(transactions.length > 0 ? Math.max(...transactions.map(t => t.amount)) : 0)}
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default UserDashboard;