import { useState, useEffect } from 'react';
import { api } from '../api';

export interface Budget {
  id: number;
  user_id: number;
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
  updated_at: string;
  budget_categories: BudgetCategory[];
}

export interface BudgetCategory {
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

export interface BudgetAnalytics {
  total_budgets: number;
  active_budgets: number;
  total_planned_amount: number;
  total_spent_amount: number;
  overall_progress: number;
  budgets_by_type: Record<string, number>;
  category_spending: Array<{
    category: string;
    planned: number;
    spent: number;
    percentage: number;
  }>;
  monthly_spending: Array<{
    month: string;
    amount: number;
  }>;
}

export interface BudgetType {
  id: string;
  name: string;
  description: string;
}

export interface DefaultCategory {
  name: string;
  color: string;
  icon: string;
}

export interface BudgetRecommendation {
  categories: Array<{
    category: string;
    total_spent: number;
    percentage: number;
    transaction_count: number;
  }>;
  suggested_budget: {
    needs: number;
    wants: number;
    savings: number;
  };
  tips: string[];
}

export interface BudgetAlert {
  type: string;
  category?: string;
  budget_name?: string;
  percentage?: number;
  days_left?: number;
  message: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[]>([]);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all budgets
  const fetchBudgets = async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    budget_type?: string;
  }) => {
    try {
      setError(null);
      const response = await api.get('/budgets/', { params });
      setBudgets(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
      return [];
    }
  };

  // Fetch single budget
  const fetchBudget = async (budgetId: number) => {
    try {
      setError(null);
      const response = await api.get(`/budgets/${budgetId}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget');
      console.error('Error fetching budget:', err);
      return null;
    }
  };

  // Create new budget
  const createBudget = async (budgetData: any) => {
    try {
      setError(null);
      const response = await api.post('/budgets/', budgetData);
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to create budget');
      console.error('Error creating budget:', err);
      throw err;
    }
  };

  // Update budget
  const updateBudget = async (budgetId: number, updates: any) => {
    try {
      setError(null);
      const response = await api.put(`/budgets/${budgetId}`, updates);
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to update budget');
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  // Delete budget
  const deleteBudget = async (budgetId: number) => {
    try {
      setError(null);
      await api.delete(`/budgets/${budgetId}`);
      await fetchBudgets(); // Refresh list
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  // Create budget category
  const createBudgetCategory = async (budgetId: number, categoryData: any) => {
    try {
      setError(null);
      const response = await api.post(`/budgets/${budgetId}/categories`, categoryData);
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to create budget category');
      console.error('Error creating budget category:', err);
      throw err;
    }
  };

  // Get budget categories
  const getBudgetCategories = async (budgetId: number) => {
    try {
      setError(null);
      const response = await api.get(`/budgets/${budgetId}/categories`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget categories');
      console.error('Error fetching budget categories:', err);
      return [];
    }
  };

  // Update budget category
  const updateBudgetCategory = async (categoryId: number, updates: any) => {
    try {
      setError(null);
      const response = await api.put(`/budgets/categories/${categoryId}`, updates);
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to update budget category');
      console.error('Error updating budget category:', err);
      throw err;
    }
  };

  // Delete budget category
  const deleteBudgetCategory = async (categoryId: number) => {
    try {
      setError(null);
      await api.delete(`/budgets/categories/${categoryId}`);
      await fetchBudgets(); // Refresh list
    } catch (err) {
      setError('Failed to delete budget category');
      console.error('Error deleting budget category:', err);
      throw err;
    }
  };

  // Record budget spending
  const recordBudgetSpending = async (budgetId: number, categoryName: string, amount: number) => {
    try {
      setError(null);
      const response = await api.post(`/budgets/${budgetId}/spend`, {
        category_name: categoryName,
        amount
      });
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to record budget spending');
      console.error('Error recording budget spending:', err);
      throw err;
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await api.get('/budgets/analytics/overview');
      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget analytics');
      console.error('Error fetching budget analytics:', err);
      return null;
    }
  };

  // Get current month budget
  const getCurrentMonthBudget = async () => {
    try {
      setError(null);
      const response = await api.get('/budgets/current/month');
      return response.data;
    } catch (err) {
      setError('Failed to fetch current month budget');
      console.error('Error fetching current month budget:', err);
      return null;
    }
  };

  // Fetch budget types and default categories
  const fetchBudgetTypes = async () => {
    try {
      setError(null);
      const response = await api.get('/budgets/types/available');
      setBudgetTypes(response.data.budget_types);
      setDefaultCategories(response.data.default_categories);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget types');
      console.error('Error fetching budget types:', err);
      return null;
    }
  };

  // Get budget recommendations
  const fetchRecommendations = async () => {
    try {
      setError(null);
      const response = await api.get('/budgets/recommendations');
      setRecommendations(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget recommendations');
      console.error('Error fetching budget recommendations:', err);
      return null;
    }
  };

  // Get budget alerts
  const fetchAlerts = async () => {
    try {
      setError(null);
      const response = await api.get('/budgets/alerts');
      setAlerts(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch budget alerts');
      console.error('Error fetching budget alerts:', err);
      return [];
    }
  };

  // Duplicate budget
  const duplicateBudget = async (budgetId: number, newName: string) => {
    try {
      setError(null);
      const response = await api.post(`/budgets/${budgetId}/duplicate`, {
        new_name: newName
      });
      await fetchBudgets(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to duplicate budget');
      console.error('Error duplicating budget:', err);
      throw err;
    }
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchBudgets(),
        fetchAnalytics(),
        fetchBudgetTypes(),
        fetchRecommendations(),
        fetchAlerts()
      ]);
      setLoading(false);
    };
    initialize();
  }, []);

  return {
    budgets,
    analytics,
    budgetTypes,
    defaultCategories,
    recommendations,
    alerts,
    loading,
    error,
    fetchBudgets,
    fetchBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetCategory,
    getBudgetCategories,
    updateBudgetCategory,
    deleteBudgetCategory,
    recordBudgetSpending,
    fetchAnalytics,
    getCurrentMonthBudget,
    fetchBudgetTypes,
    fetchRecommendations,
    fetchAlerts,
    duplicateBudget
  };
}; 