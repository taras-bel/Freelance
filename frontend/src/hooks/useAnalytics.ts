import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsSummary {
  total_income: number;
  total_expenses: number;
  net_income: number;
  savings_rate: number;
  budget_efficiency: number;
  goals_progress: number;
  investment_returns: number;
  risk_score: number;
  cash_flow_trend: string;
  top_spending_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  income_sources: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  recent_insights: Array<{
    id: number;
    title: string;
    description: string;
    impact_score: number;
    priority: string;
  }>;
  upcoming_deadlines: Array<{
    type: string;
    title: string;
    deadline: string;
    progress: number;
  }>;
  financial_health_score: number;
}

interface SpendingTrend {
  period: string;
  amount: number;
  change_percentage: number;
  trend_direction: string;
}

interface IncomeTrend {
  period: string;
  amount: number;
  change_percentage: number;
  growth_rate: number;
  stability_score: number;
}

interface PortfolioPerformance {
  total_value: number;
  total_return: number;
  annualized_return: number;
  risk_score: number;
  diversification_score: number;
  asset_allocation: Record<string, number>;
  top_performers: Array<{
    name: string;
    return: number;
    allocation: number;
  }>;
  underperformers: Array<{
    name: string;
    return: number;
    allocation: number;
  }>;
}

interface FinancialHealthScore {
  overall_score: number;
  income_score: number;
  spending_score: number;
  savings_score: number;
  investment_score: number;
  debt_score: number;
  risk_score: number;
  recommendations: string[];
}

interface FinancialReport {
  id: number;
  title: string;
  description: string;
  report_type: string;
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  net_income: number;
  savings_rate: number;
  budget_efficiency: number;
  goals_completed: number;
  goals_total: number;
  created_at: string;
}

interface FinancialInsight {
  id: number;
  insight_type: string;
  title: string;
  description: string;
  impact_score: number;
  impact_type: string;
  potential_savings: number;
  potential_gains: number;
  priority: string;
  difficulty: string;
  is_read: boolean;
  is_actioned: boolean;
  created_at: string;
}

export const useAnalytics = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [incomeTrends, setIncomeTrends] = useState<IncomeTrend[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<PortfolioPerformance | null>(null);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore | null>(null);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsSummary = async (period: string = 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/analytics/summary?period=${period}`);
      setSummary(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpendingTrends = async (months: number = 6) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/analytics/spending-trends?months=${months}`);
      setSpendingTrends(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch spending trends');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeTrends = async (months: number = 6) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/analytics/income-trends?months=${months}`);
      setIncomeTrends(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch income trends');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/portfolio-performance');
      setPortfolioPerformance(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch portfolio performance');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/financial-health');
      setFinancialHealth(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch financial health');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/reports');
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/reports', reportData);
      await fetchReports(); // Refresh reports list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId: number, updateData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/reports/${reportId}`, updateData);
      await fetchReports(); // Refresh reports list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: number) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/reports/${reportId}`);
      await fetchReports(); // Refresh reports list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (insightType?: string, isRead?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (insightType) params.append('insight_type', insightType);
      if (isRead !== undefined) params.append('is_read', isRead.toString());
      
      const response = await axios.get(`/api/insights?${params.toString()}`);
      setInsights(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const markInsightAsRead = async (insightId: number) => {
    try {
      setError(null);
      await axios.post(`/api/insights/${insightId}/read`);
      await fetchInsights(); // Refresh insights list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark insight as read');
      throw err;
    }
  };

  const markInsightAsActioned = async (insightId: number) => {
    try {
      setError(null);
      await axios.post(`/api/insights/${insightId}/action`);
      await fetchInsights(); // Refresh insights list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark insight as actioned');
      throw err;
    }
  };

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/insights/generate');
      await fetchInsights(); // Refresh insights list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate insights');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInsight = async (insightId: number) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/insights/${insightId}`);
      await fetchInsights(); // Refresh insights list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete insight');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUnreadInsightsCount = async () => {
    try {
      const response = await axios.get('/api/insights/unread-count');
      return response.data.unread_count;
    } catch (err: any) {
      console.error('Failed to get unread insights count:', err);
      return 0;
    }
  };

  const fetchAllAnalytics = async () => {
    await Promise.all([
      fetchAnalyticsSummary(),
      fetchSpendingTrends(),
      fetchIncomeTrends(),
      fetchPortfolioPerformance(),
      fetchFinancialHealth(),
      fetchReports(),
      fetchInsights()
    ]);
  };

  return {
    // State
    summary,
    spendingTrends,
    incomeTrends,
    portfolioPerformance,
    financialHealth,
    reports,
    insights,
    loading,
    error,

    // Analytics functions
    fetchAnalyticsSummary,
    fetchSpendingTrends,
    fetchIncomeTrends,
    fetchPortfolioPerformance,
    fetchFinancialHealth,
    fetchAllAnalytics,

    // Reports functions
    fetchReports,
    createReport,
    updateReport,
    deleteReport,

    // Insights functions
    fetchInsights,
    markInsightAsRead,
    markInsightAsActioned,
    generateInsights,
    deleteInsight,
    getUnreadInsightsCount
  };
}; 