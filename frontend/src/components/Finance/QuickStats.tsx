import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, Wallet, CreditCard, Calendar } from 'lucide-react';

interface QuickStatsProps {
  summary: any;
}

const QuickStats: React.FC<QuickStatsProps> = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Earnings
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${summary.total_earnings.toLocaleString()}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            +12.5% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Net Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${summary.net_balance.toLocaleString()}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            +8.2% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Pending Balance
          </CardTitle>
          <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${summary.pending_balance.toLocaleString()}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            +3.1% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Escrow Balance
          </CardTitle>
          <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${summary.escrow_balance.toLocaleString()}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            +5.7% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
