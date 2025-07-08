import React, { useState } from 'react';
import { PieChart, TrendingUp, Calendar, DollarSign, Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface Budget {
  id: number;
  name: string;
  description?: string;
  budget_type: string;
  total_amount: number;
  spent_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  budget_categories: BudgetCategory[];
}

interface BudgetCategory {
  id: number;
  budget_id: number;
  category_name: string;
  planned_amount: number;
  spent_amount: number;
  percentage: number;
  color?: string;
  icon?: string;
  created_at: string;
}

interface BudgetsProps {
  budgets: Budget[];
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: number) => void;
  onViewBudget: (budget: Budget) => void;
  onAddCategory: (budget: Budget) => void;
  loading?: boolean;
}

const Budgets: React.FC<BudgetsProps> = ({
  budgets,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  onViewBudget,
  onAddCategory,
  loading = false
}) => {
  const [showDetails, setShowDetails] = useState<number[]>([]);

  const toggleDetails = (id: number) => {
    setShowDetails(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly':
        return '📅';
      case 'yearly':
        return '📊';
      case 'custom':
        return '⚙️';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getDaysUntilEnd = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (icon?: string) => {
    // You can implement icon mapping here
    return icon || '📁';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Budgets
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your spending plans and track expenses
          </p>
        </div>
        <Button onClick={onAddBudget} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="text-center py-12">
            <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No budgets yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button onClick={onAddBudget}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <Card key={budget.id} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getBudgetTypeIcon(budget.budget_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {budget.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {budget.budget_type} Budget
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                    {budget.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Spending Progress
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {((budget.spent_amount / budget.total_amount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor((budget.spent_amount / budget.total_amount) * 100)} transition-all duration-300`}
                      style={{ width: `${Math.min((budget.spent_amount / budget.total_amount) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Spent:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(budget.spent_amount, budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Budget:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(budget.total_amount, budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remaining:</span>
                    <span className={`font-semibold ${
                      budget.total_amount - budget.spent_amount >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(budget.total_amount - budget.spent_amount, budget.currency)}
                    </span>
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(budget.start_date)}</span>
                  </div>
                  <span>to</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(budget.end_date)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewBudget(budget)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDetails(budget.id)}
                  >
                    {showDetails.includes(budget.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditBudget(budget)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {budget.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Expanded Details */}
                {showDetails.includes(budget.id) && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    {budget.description && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {budget.description}
                        </p>
                      </div>
                    )}

                    {/* Categories */}
                    {budget.budget_categories.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Categories
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddCategory(budget)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {budget.budget_categories.slice(0, 5).map((category) => (
                            <div key={category.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {category.category_name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {formatCurrency(category.spent_amount, budget.currency)}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  / {formatCurrency(category.planned_amount, budget.currency)}
                                </span>
                                {category.percentage >= 100 && (
                                  <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                )}
                                {category.percentage >= 80 && category.percentage < 100 && (
                                  <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                )}
                                {category.percentage < 80 && (
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                )}
                              </div>
                            </div>
                          ))}
                          {budget.budget_categories.length > 5 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                              +{budget.budget_categories.length - 5} more categories
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Budget Status */}
                    <div>
                      {(() => {
                        const daysLeft = getDaysUntilEnd(budget.end_date);
                        const spendingPercentage = (budget.spent_amount / budget.total_amount) * 100;
                        
                        if (spendingPercentage >= 100) {
                          return (
                            <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <span className="text-sm text-red-800 dark:text-red-200">
                                Budget exceeded by {formatCurrency(budget.spent_amount - budget.total_amount, budget.currency)}
                              </span>
                            </div>
                          );
                        } else if (spendingPercentage >= 90) {
                          return (
                            <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                {spendingPercentage.toFixed(1)}% of budget used
                              </span>
                            </div>
                          );
                        } else if (daysLeft <= 7 && daysLeft > 0) {
                          return (
                            <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm text-blue-800 dark:text-blue-200">
                                {daysLeft} days remaining
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Budgets; 
