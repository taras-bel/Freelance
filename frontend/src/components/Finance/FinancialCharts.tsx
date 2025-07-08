import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface FinancialChartsProps {
  summary: {
    total_earnings: number;
    total_spent: number;
    net_balance: number;
    pending_balance: number;
    escrow_balance: number;
    currency: string;
    period: string;
    start_date: string;
    end_date: string;
    transaction_count: number;
    payment_count: number;
    withdrawal_count: number;
  };
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ summary }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartData, setChartData] = useState<any>(null);

  // Mock chart data - in real app this would come from API
  useEffect(() => {
    const generateMockData = () => {
      const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
      const data = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        data.push({
          date: date.toISOString().split('T')[0],
          earnings: Math.random() * 1000 + 500,
          expenses: Math.random() * 300 + 100,
          balance: Math.random() * 2000 + 1000
        });
      }
      
      return data;
    };

    setChartData(generateMockData());
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency || 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const periods = [
    { id: 'week', label: 'Week', days: 7 },
    { id: 'month', label: 'Month', days: 30 },
    { id: 'year', label: 'Year', days: 365 }
  ];

  const categories = [
    {
      name: 'Task Payments',
      amount: summary.total_earnings * 0.7,
      color: 'bg-blue-500',
      percentage: 70
    },
    {
      name: 'Platform Fees',
      amount: summary.total_earnings * 0.15,
      color: 'bg-red-500',
      percentage: 15
    },
    {
      name: 'Bonuses',
      amount: summary.total_earnings * 0.1,
      color: 'bg-green-500',
      percentage: 10
    },
    {
      name: 'Other',
      amount: summary.total_earnings * 0.05,
      color: 'bg-purple-500',
      percentage: 5
    }
  ];

  const renderSimpleChart = (data: any[], key: string, color: string) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d[key]));
    const minValue = Math.min(...data.map(d => d[key]));

    return (
      <div className="h-32 flex items-end space-x-1">
        {data.slice(-14).map((point, index) => {
          const height = maxValue > 0 ? (point[key] / maxValue) * 100 : 0;
          return (
            <div
              key={index}
              className={`flex-1 ${color} rounded-t transition-all duration-300 hover:opacity-80`}
              style={{ height: `${height}%` }}
              title={`${point.date}: ${formatCurrency(point[key])}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Financial Analytics
        </h3>
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Earnings Trend
              </h4>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.total_earnings)}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          {chartData && renderSimpleChart(chartData, 'earnings', 'bg-green-500')}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Last 14 days</span>
            <span className="text-green-600 dark:text-green-400">+12.5%</span>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Balance Trend
              </h4>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.net_balance)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {chartData && renderSimpleChart(chartData, 'balance', 'bg-blue-500')}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Last 14 days</span>
            <span className="text-blue-600 dark:text-blue-400">+8.2%</span>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Income Breakdown
        </h4>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${category.color}`} />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category.color.replace('bg-', 'bg-')}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[80px] text-right">
                  {formatCurrency(category.amount)}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[40px] text-right">
                  {category.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Transactions</p>
              <p className="text-2xl font-bold">{summary.transaction_count}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Successful Payments</p>
              <p className="text-2xl font-bold">{summary.payment_count}</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Withdrawals</p>
              <p className="text-2xl font-bold">{summary.withdrawal_count}</p>
            </div>
            <TrendingDown className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts; 
