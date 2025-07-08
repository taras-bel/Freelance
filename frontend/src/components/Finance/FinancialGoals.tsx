import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Star, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface FinancialGoal {
  id: number;
  title: string;
  description?: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline?: string;
  priority: string;
  status: string;
  progress_percentage: number;
  category?: string;
  is_public: boolean;
  monthly_target?: number;
  created_at: string;
  goal_transactions: any[];
  goal_milestones: any[];
}

interface FinancialGoalsProps {
  goals: FinancialGoal[];
  onAddGoal: () => void;
  onEditGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: number) => void;
  onViewGoal: (goal: FinancialGoal) => void;
  onContribute: (goal: FinancialGoal) => void;
  loading?: boolean;
}

const FinancialGoals: React.FC<FinancialGoalsProps> = ({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onViewGoal,
  onContribute,
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

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return '💰';
      case 'investment':
        return '📈';
      case 'debt_payoff':
        return '💳';
      case 'income':
        return '💵';
      case 'emergency_fund':
        return '🛡️';
      case 'retirement':
        return '🏖️';
      case 'education':
        return '📚';
      case 'travel':
        return '✈️';
      case 'home':
        return '🏠';
      case 'business':
        return '💼';
      default:
        return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            Financial Goals
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track your financial objectives and progress
          </p>
        </div>
        <Button onClick={onAddGoal} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No financial goals yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first financial goal to start tracking your progress
            </p>
            <Button onClick={onAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getGoalTypeIcon(goal.goal_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {goal.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {goal.goal_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {goal.is_public && (
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Progress
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {goal.progress_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(goal.progress_percentage)} transition-all duration-300`}
                      style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Current:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(goal.current_amount, goal.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Target:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(goal.target_amount, goal.currency)}
                    </span>
                  </div>
                  {goal.monthly_target && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Monthly:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(goal.monthly_target, goal.currency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority and Deadline */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className={`w-4 h-4 ${getPriorityColor(goal.priority)}`} />
                    <span className={`font-medium capitalize ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  {goal.deadline && (
                    <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(goal.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onContribute(goal)}
                    className="flex-1"
                    disabled={goal.status === 'completed'}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Contribute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDetails(goal.id)}
                  >
                    {showDetails.includes(goal.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditGoal(goal)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {goal.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Expanded Details */}
                {showDetails.includes(goal.id) && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    {goal.description && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {goal.description}
                        </p>
                      </div>
                    )}

                    {/* Milestones */}
                    {goal.goal_milestones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {goal.goal_milestones.slice(0, 3).map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">
                                {milestone.title}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {formatCurrency(milestone.achieved_amount, goal.currency)}
                                </span>
                                {milestone.is_completed && (
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Transactions */}
                    {goal.goal_transactions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Recent Activity
                        </h4>
                        <div className="space-y-1">
                          {goal.goal_transactions.slice(0, 2).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">
                                {transaction.description || transaction.transaction_type}
                              </span>
                              <span className={`font-medium ${
                                transaction.transaction_type === 'contribution' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {transaction.transaction_type === 'contribution' ? '+' : '-'}
                                {formatCurrency(transaction.amount, goal.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline Warning */}
                    {goal.deadline && goal.status === 'active' && (
                      <div>
                        {(() => {
                          const daysLeft = getDaysUntilDeadline(goal.deadline);
                          if (daysLeft <= 30 && daysLeft > 0) {
                            return (
                              <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                  {daysLeft} days until deadline
                                </span>
                              </div>
                            );
                          } else if (daysLeft < 0) {
                            return (
                              <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm text-red-800 dark:text-red-200">
                                  Deadline passed
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
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

export default FinancialGoals; 
