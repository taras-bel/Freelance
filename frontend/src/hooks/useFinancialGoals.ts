import { useState, useEffect } from 'react';
import { api } from '../api';

export interface FinancialGoal {
  id: number;
  user_id: number;
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
  updated_at: string;
  goal_transactions: GoalTransaction[];
  goal_milestones: GoalMilestone[];
}

export interface GoalTransaction {
  id: number;
  goal_id: number;
  user_id: number;
  transaction_id?: number;
  amount: number;
  transaction_type: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface GoalMilestone {
  id: number;
  goal_id: number;
  title: string;
  description?: string;
  target_amount: number;
  achieved_amount: number;
  percentage: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface GoalAnalytics {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  overall_progress: number;
  goals_by_type: Record<string, number>;
  goals_by_priority: Record<string, number>;
  monthly_contributions: Array<{
    month: string;
    amount: number;
  }>;
}

export interface GoalType {
  id: string;
  name: string;
  description: string;
}

export interface GoalPriority {
  id: string;
  name: string;
  color: string;
}

export const useFinancialGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);
  const [priorities, setPriorities] = useState<GoalPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all goals
  const fetchGoals = async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    goal_type?: string;
    priority?: string;
  }) => {
    try {
      setError(null);
      const response = await api.get('/financial-goals/', { params });
      setGoals(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch financial goals');
      console.error('Error fetching financial goals:', err);
      return [];
    }
  };

  // Fetch single goal
  const fetchGoal = async (goalId: number) => {
    try {
      setError(null);
      const response = await api.get(`/financial-goals/${goalId}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch financial goal');
      console.error('Error fetching financial goal:', err);
      return null;
    }
  };

  // Create new goal
  const createGoal = async (goalData: any) => {
    try {
      setError(null);
      const response = await api.post('/financial-goals/', goalData);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to create financial goal');
      console.error('Error creating financial goal:', err);
      throw err;
    }
  };

  // Update goal
  const updateGoal = async (goalId: number, updates: any) => {
    try {
      setError(null);
      const response = await api.put(`/financial-goals/${goalId}`, updates);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to update financial goal');
      console.error('Error updating financial goal:', err);
      throw err;
    }
  };

  // Delete goal
  const deleteGoal = async (goalId: number) => {
    try {
      setError(null);
      await api.delete(`/financial-goals/${goalId}`);
      await fetchGoals(); // Refresh list
    } catch (err) {
      setError('Failed to delete financial goal');
      console.error('Error deleting financial goal:', err);
      throw err;
    }
  };

  // Add transaction to goal
  const addGoalTransaction = async (goalId: number, transactionData: any) => {
    try {
      setError(null);
      const response = await api.post(`/financial-goals/${goalId}/transactions`, transactionData);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to add goal transaction');
      console.error('Error adding goal transaction:', err);
      throw err;
    }
  };

  // Get goal transactions
  const getGoalTransactions = async (goalId: number, params?: {
    skip?: number;
    limit?: number;
  }) => {
    try {
      setError(null);
      const response = await api.get(`/financial-goals/${goalId}/transactions`, { params });
      return response.data;
    } catch (err) {
      setError('Failed to fetch goal transactions');
      console.error('Error fetching goal transactions:', err);
      return [];
    }
  };

  // Create milestone
  const createMilestone = async (goalId: number, milestoneData: any) => {
    try {
      setError(null);
      const response = await api.post(`/financial-goals/${goalId}/milestones`, milestoneData);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to create milestone');
      console.error('Error creating milestone:', err);
      throw err;
    }
  };

  // Update milestone
  const updateMilestone = async (milestoneId: number, achievedAmount: number) => {
    try {
      setError(null);
      const response = await api.put(`/financial-goals/milestones/${milestoneId}`, {
        achieved_amount: achievedAmount
      });
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to update milestone');
      console.error('Error updating milestone:', err);
      throw err;
    }
  };

  // Contribute to goal
  const contributeToGoal = async (goalId: number, amount: number, description?: string) => {
    try {
      setError(null);
      const response = await api.post(`/financial-goals/${goalId}/contribute`, {
        amount,
        description
      });
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to contribute to goal');
      console.error('Error contributing to goal:', err);
      throw err;
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await api.get('/financial-goals/analytics/overview');
      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch goal analytics');
      console.error('Error fetching goal analytics:', err);
      return null;
    }
  };

  // Fetch goal types and priorities
  const fetchGoalTypes = async () => {
    try {
      setError(null);
      const response = await api.get('/financial-goals/types/available');
      setGoalTypes(response.data.goal_types);
      setPriorities(response.data.priorities);
      return response.data;
    } catch (err) {
      setError('Failed to fetch goal types');
      console.error('Error fetching goal types:', err);
      return null;
    }
  };

  // Get public goals for inspiration
  const getPublicGoals = async (params?: {
    skip?: number;
    limit?: number;
  }) => {
    try {
      setError(null);
      const response = await api.get('/financial-goals/public/inspiration', { params });
      return response.data;
    } catch (err) {
      setError('Failed to fetch public goals');
      console.error('Error fetching public goals:', err);
      return [];
    }
  };

  // Get goals due soon
  const getGoalsDueSoon = async (days: number = 30) => {
    try {
      setError(null);
      const response = await api.get(`/financial-goals/due-soon?days=${days}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch goals due soon');
      console.error('Error fetching goals due soon:', err);
      return [];
    }
  };

  // Get goals by progress
  const getGoalsByProgress = async (minProgress: number) => {
    try {
      setError(null);
      const response = await api.get(`/financial-goals/progress/${minProgress}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch goals by progress');
      console.error('Error fetching goals by progress:', err);
      return [];
    }
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchGoals(),
        fetchAnalytics(),
        fetchGoalTypes()
      ]);
      setLoading(false);
    };
    initialize();
  }, []);

  return {
    goals,
    analytics,
    goalTypes,
    priorities,
    loading,
    error,
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    getGoalTransactions,
    createMilestone,
    updateMilestone,
    contributeToGoal,
    fetchAnalytics,
    fetchGoalTypes,
    getPublicGoals,
    getGoalsDueSoon,
    getGoalsByProgress
  };
}; 