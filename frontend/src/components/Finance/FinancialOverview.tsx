import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Clock } from 'lucide-react';

interface FinancialOverviewProps {
  summary: {
    total_earnings: number;
    total_spent: number;
    net_balance: number;
    pending_balance: number;
    escrow_balance: number;
    currency: string;
    transaction_count: number;
    payment_count: number;
    withdrawal_count: number;
  };
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(summary.total_earnings),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Net Balance',
      value: formatCurrency(summary.net_balance),
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Pending Balance',
      value: formatCurrency(summary.pending_balance),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      change: '+3.1%',
      changeType: 'neutral'
    },
    {
      title: 'Escrow Balance',
      value: formatCurrency(summary.escrow_balance),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      change: '+5.7%',
      changeType: 'positive'
    }
  ];

  const stats = [
    {
      label: 'Total Transactions',
      value: summary.transaction_count,
      icon: TrendingUp,
      color: 'text-slate-600 dark:text-slate-400'
    },
    {
      label: 'Successful Payments',
      value: summary.payment_count,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Withdrawals',
      value: summary.withdrawal_count,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border ${card.borderColor} ${card.bgColor} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                  card.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <DollarSign size={20} />
            <span>Add Funds</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <TrendingDown size={20} />
            <span>Withdraw</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
            <CreditCard size={20} />
            <span>Payment Methods</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview; 
