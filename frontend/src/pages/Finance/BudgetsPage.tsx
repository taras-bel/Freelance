import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import Budgets from '../../components/Finance/Budgets';
import AddBudgetModal from '../../components/Finance/AddBudgetModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PieChart, Calendar, TrendingDown, DollarSign, Plus, Filter, Download, Eye, AlertTriangle, BarChart3 } from 'lucide-react';

const BudgetsPage: React.FC = () => {
  const {
    budgets,
    analytics,
    budgetTypes,
    defaultCategories,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    addExpense,
    fetchAnalytics,
    getBudgetsByStatus,
    getBudgetsByType
  } = useBudgets();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const handleAddBudget = () => {
    setShowAddModal(true);
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget);
    // You could open an edit modal here
    console.log('Edit budget:', budget);
  };

  const handleDeleteBudget = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        // Success notification could be added here
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };

  const handleViewBudget = (budget: any) => {
    // Navigate to budget detail page or open detail modal
    console.log('View budget:', budget);
  };

  const handleAddExpense = (budget: any) => {
    // Open expense modal
    console.log('Add expense to budget:', budget);
  };

  const handleAddSuccess = async (budgetData: any) => {
    try {
      await createBudget(budgetData);
      await fetchBudgets();
      await fetchAnalytics();
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to add budget:', err);
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesStatus = filterStatus === 'all' || budget.status === filterStatus;
    const matchesType = filterType === 'all' || budget.budget_type === filterType;
    const matchesPeriod = filterPeriod === 'all' || budget.budget_type === filterPeriod;
    return matchesStatus && matchesType && matchesPeriod;
  });

  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return '📅';
      case 'yearly': return '📊';
      case 'custom': return '⚙️';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'completed': return 'text-blue-600 dark:text-blue-400';
      case 'overdue': return 'text-red-600 dark:text-red-400';
      case 'paused': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-red-600 dark:text-red-400';
    if (progress >= 75) return 'text-orange-600 dark:text-orange-400';
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (loading && budgets.length === 0) {
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
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Error Loading Budgets
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={() => fetchBudgets()} variant="outline">
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
            Budgets
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create and manage your spending budgets
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
          <Button onClick={handleAddBudget} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Budgets
              </CardTitle>
              <PieChart className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.total_budgets}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {analytics.active_budgets} active, {analytics.completed_budgets} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Budgeted
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${analytics.total_budgeted_amount.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                ${analytics.total_spent_amount.toLocaleString()} spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Average Spending
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${analytics.average_spending.toFixed(0)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Per month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Budget Efficiency
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.budget_efficiency.toFixed(1)}%
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Under budget
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Types</option>
            {budgetTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Period:</span>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Periods</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterStatus('all');
            setFilterType('all');
            setFilterPeriod('all');
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Budgets
            budgets={filteredBudgets}
            onAddBudget={handleAddBudget}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onViewBudget={handleViewBudget}
            onAddExpense={handleAddExpense}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Budgets
            budgets={filteredBudgets.filter(b => b.status === 'active')}
            onAddBudget={handleAddBudget}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onViewBudget={handleViewBudget}
            onAddExpense={handleAddExpense}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Budgets
            budgets={filteredBudgets.filter(b => b.status === 'completed')}
            onAddBudget={handleAddBudget}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onViewBudget={handleViewBudget}
            onAddExpense={handleAddExpense}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budgets by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span>Budgets by Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.budgets_by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getBudgetTypeIcon(type)}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {type}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spending by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Top Spending Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.top_spending_categories?.slice(0, 5).map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${category.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Spending Trend */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span>Monthly Spending Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-center space-x-2">
                    {analytics.monthly_spending_trend?.map((month: any, index: number) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t"
                          style={{ height: `${(month.amount / Math.max(...analytics.monthly_spending_trend.map((m: any) => m.amount))) * 200}px` }}
                        ></div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {month.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        budgetTypes={budgetTypes}
        defaultCategories={defaultCategories}
      />
    </div>
  );
};

export default BudgetsPage; 
