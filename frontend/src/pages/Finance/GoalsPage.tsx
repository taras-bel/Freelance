import React, { useState } from 'react';
import { useFinancialGoals } from '../../hooks/useFinancialGoals';
import FinancialGoals from '../../components/Finance/FinancialGoals';
import AddGoalModal from '../../components/Finance/AddGoalModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Target, TrendingUp, Calendar, Star, Plus, Filter, Download, Eye, Trophy, AlertTriangle } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const {
    goals,
    analytics,
    goalTypes,
    priorities,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    fetchAnalytics,
    getGoalsDueSoon,
    getGoalsByProgress
  } = useFinancialGoals();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const handleAddGoal = () => {
    setShowAddModal(true);
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    // You could open an edit modal here
    console.log('Edit goal:', goal);
  };

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
        // Success notification could be added here
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  const handleViewGoal = (goal: any) => {
    // Navigate to goal detail page or open detail modal
    console.log('View goal:', goal);
  };

  const handleContribute = (goal: any) => {
    // Open contribution modal
    console.log('Contribute to goal:', goal);
  };

  const handleAddSuccess = async (goalData: any) => {
    try {
      await createGoal(goalData);
      await fetchGoals();
      await fetchAnalytics();
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesType = filterType === 'all' || goal.goal_type === filterType;
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    return matchesStatus && matchesType && matchesPriority;
  });

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'debt_payoff': return '💳';
      case 'income': return '💵';
      case 'emergency_fund': return '🛡️';
      case 'retirement': return '🏖️';
      case 'education': return '📚';
      case 'travel': return '✈️';
      case 'home': return '🏠';
      case 'business': return '💼';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading && goals.length === 0) {
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
              Error Loading Goals
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={() => fetchGoals()} variant="outline">
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
            Financial Goals
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Set, track, and achieve your financial objectives
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
          <Button onClick={handleAddGoal} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Goals
              </CardTitle>
              <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.total_goals}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {analytics.active_goals} active, {analytics.completed_goals} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.overall_progress.toFixed(1)}%
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Target
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${analytics.total_target_amount.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                ${analytics.total_current_amount.toLocaleString()} achieved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Due Soon
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {goals.filter(g => g.deadline && new Date(g.deadline) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Next 30 days
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
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
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
            {goalTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterStatus('all');
            setFilterType('all');
            setFilterPriority('all');
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
          <FinancialGoals
            goals={filteredGoals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onViewGoal={handleViewGoal}
            onContribute={handleContribute}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <FinancialGoals
            goals={filteredGoals.filter(g => g.status === 'active')}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onViewGoal={handleViewGoal}
            onContribute={handleContribute}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <FinancialGoals
            goals={filteredGoals.filter(g => g.status === 'completed')}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onViewGoal={handleViewGoal}
            onContribute={handleContribute}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goals by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>Goals by Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.goals_by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getGoalTypeIcon(type)}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {type.replace('_', ' ')}
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

              {/* Goals by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span>Goals by Priority</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.goals_by_priority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className={`w-4 h-4 ${getPriorityColor(priority)}`} />
                          <span className={`text-sm font-medium capitalize ${getPriorityColor(priority)}`}>
                            {priority}
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
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        goalTypes={goalTypes}
        priorities={priorities}
      />
    </div>
  );
};

export default GoalsPage; 
