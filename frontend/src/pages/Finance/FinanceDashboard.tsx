import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../../stores/financeStore';
import FinancialOverview from '../../components/Finance/FinancialOverview';
import FinancialCharts from '../../components/Finance/FinancialCharts';
import TransactionHistory from '../../components/Finance/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import FinanceHeader from '../../components/Finance/FinanceHeader';
import QuickStats from '../../components/Finance/QuickStats';
import Invoices from '../../components/Finance/Invoices';

const FinanceDashboard: React.FC = () => {
  const {
    summary,
    transactions,
    invoices,
    loading,
    error,
    fetchFinancialData,
  } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  if (loading && !summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
            Error Loading Financial Data
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={fetchFinancialData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FinanceHeader onRefresh={fetchFinancialData} />
      <QuickStats summary={summary} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summary && <FinancialOverview summary={summary} />}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {summary && <FinancialCharts summary={summary} />}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory transactions={transactions} loading={loading} />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Invoices invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
