import React, { useState } from 'react';
import { useFinancials } from '../../hooks/useFinancials';
import Wallet from '../../components/Finance/Wallet';
import AddFundsModal from '../../components/Finance/AddFundsModal';
import WithdrawModal from '../../components/Finance/WithdrawModal';
import TransactionHistory from '../../components/Finance/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Minus, ArrowRight, Download, Filter } from 'lucide-react';

const WalletPage: React.FC = () => {
  const {
    summary,
    transactions,
    loading,
    error,
    fetchTransactions
  } = useFinancials();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleViewTransactions = () => {
    setActiveTab('transactions');
  };

  const handleAddFundsSuccess = (amount: number) => {
    // Refresh data after successful add funds
    fetchTransactions();
    // You could also show a success notification here
  };

  const handleWithdrawSuccess = (amount: number) => {
    // Refresh data after successful withdrawal
    fetchTransactions();
    // You could also show a success notification here
  };

  if (loading && !summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Wallet Data
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Wallet
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your funds, transactions, and payment methods
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summary && (
            <Wallet
              balance={summary.net_balance}
              pendingBalance={summary.pending_balance}
              escrowBalance={summary.escrow_balance}
              currency={summary.currency}
              onAddFunds={handleAddFunds}
              onWithdraw={handleWithdraw}
              onViewTransactions={handleViewTransactions}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Transaction History
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View and manage your financial transactions
              </p>
            </div>
            <Button onClick={() => setActiveTab('overview')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </div>
          <TransactionHistory 
            transactions={transactions} 
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Financial Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Insights into your financial patterns and trends
              </p>
            </div>
            <Button onClick={() => setActiveTab('overview')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </div>
          
          {/* Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Income</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${summary?.total_earnings.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Expenses</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${summary?.total_spent.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Net Profit</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ${summary?.net_balance.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Transactions</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {summary?.transaction_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Successful Payments</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {summary?.payment_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Withdrawals</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {summary?.withdrawal_count || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSuccess={handleAddFundsSuccess}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleWithdrawSuccess}
        availableBalance={summary?.net_balance || 0}
      />
    </div>
  );
};

export default WalletPage; 
