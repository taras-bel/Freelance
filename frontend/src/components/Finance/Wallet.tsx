import React, { useState } from 'react';
import { Wallet as WalletIcon, Plus, Minus, CreditCard, ArrowRight, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface WalletProps {
  balance: number;
  pendingBalance: number;
  escrowBalance: number;
  currency: string;
  onAddFunds: () => void;
  onWithdraw: () => void;
  onViewTransactions: () => void;
}

const FinanceWallet: React.FC<WalletProps> = ({
  balance,
  pendingBalance,
  escrowBalance,
  currency,
  onAddFunds,
  onWithdraw,
  onViewTransactions
}) => {
  const [showBalances, setShowBalances] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getDisplayAmount = (amount: number) => {
    return showBalances ? formatCurrency(amount) : '••••••';
  };

  const quickActions = [
    {
      title: 'Add Funds',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onAddFunds
    },
    {
      title: 'Withdraw',
      icon: Minus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onWithdraw
    },
    {
      title: 'View Transactions',
      icon: ArrowRight,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onViewTransactions
    }
  ];

  const balanceCards = [
    {
      title: 'Available Balance',
      amount: balance,
      icon: WalletIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: '+12.5%',
      trendType: 'positive'
    },
    {
      title: 'Pending Balance',
      amount: pendingBalance,
      icon: TrendingUp,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      trend: '+3.1%',
      trendType: 'neutral'
    },
    {
      title: 'Escrow Balance',
      amount: escrowBalance,
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      trend: '+5.7%',
      trendType: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Wallet
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your funds and transactions
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center space-x-2"
        >
          {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balanceCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    card.trendType === 'positive' ? 'text-green-600 dark:text-green-400' :
                    card.trendType === 'negative' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {card.trend}
                  </span>
                </div>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {getDisplayAmount(card.amount)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} text-white transition-all duration-200 flex items-center justify-center space-x-2 py-4`}
                >
                  <Icon size={20} />
                  <span>{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'payment',
                title: 'Task Payment Received',
                amount: 150.00,
                date: '2 hours ago',
                status: 'completed'
              },
              {
                type: 'withdrawal',
                title: 'Withdrawal to Bank',
                amount: -75.00,
                date: '1 day ago',
                status: 'pending'
              },
              {
                type: 'fee',
                title: 'Platform Fee',
                amount: -5.00,
                date: '2 days ago',
                status: 'completed'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'payment' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.type === 'withdrawal' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {activity.type === 'payment' ? (
                      <Plus className={`w-4 h-4 ${
                        activity.type === 'payment' ? 'text-green-600 dark:text-green-400' :
                        activity.type === 'withdrawal' ? 'text-blue-600 dark:text-blue-400' :
                        'text-red-600 dark:text-red-400'
                      }`} />
                    ) : activity.type === 'withdrawal' ? (
                      <Minus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    activity.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceWallet; 
