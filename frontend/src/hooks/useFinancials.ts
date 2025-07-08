import { useState, useEffect } from 'react';
import { api } from '../api';

export interface FinancialSummary {
  total_earnings: number;
  total_spent: number;
  net_balance: number;
  pending_balance: number;
  escrow_balance: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string;
  transaction_count: number;
  payment_count: number;
  withdrawal_count: number;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  payment_id?: number;
  invoice_id?: number;
  amount: number;
  currency: string;
  exchange_rate: number;
  transaction_type: string;
  category: string;
  status: string;
  provider_transaction_id?: string;
  platform_fee: number;
  processing_fee: number;
  tax_amount: number;
  description?: string;
  metadata_json?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  user_id: number;
  task_id?: number;
  application_id?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  exchange_rate: number;
  status: string;
  due_date?: string;
  paid_date?: string;
  billing_address?: string;
  billing_email?: string;
  billing_phone?: string;
  notes?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  user_id: number;
  method_type: string;
  provider: string;
  is_default: boolean;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  bank_name?: string;
  bank_last4?: string;
  bank_routing?: string;
  provider_payment_method_id?: string;
  provider_customer_id?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionSummary {
  total_amount: number;
  transaction_count: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
}

export interface PaymentAnalytics {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  average_payment_amount: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string;
}

export const useFinancials = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch financial summary
  const fetchSummary = async (period: string = 'month') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/transactions/summary/${period}`);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to fetch financial summary');
      console.error('Error fetching financial summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (params?: {
    skip?: number;
    limit?: number;
    transaction_type?: string;
    category?: string;
    status?: string;
  }) => {
    try {
      setError(null);
      const response = await api.get('/transactions/', { params });
      setTransactions(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      return [];
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async (limit: number = 10) => {
    try {
      const response = await api.get('/transactions/recent/list', {
        params: { limit }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      return [];
    }
  };

  // Fetch invoices
  const fetchInvoices = async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }) => {
    try {
      setError(null);
      const response = await api.get('/invoices/', { params });
      setInvoices(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
      return [];
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setError(null);
      const response = await api.get('/payment-methods/');
      setPaymentMethods(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch payment methods');
      console.error('Error fetching payment methods:', err);
      return [];
    }
  };

  // Get default payment method
  const getDefaultPaymentMethod = async () => {
    try {
      const response = await api.get('/payment-methods/default');
      return response.data;
    } catch (err) {
      console.error('Error fetching default payment method:', err);
      return null;
    }
  };

  // Create payment method
  const createPaymentMethod = async (paymentMethod: any) => {
    try {
      setError(null);
      const response = await api.post('/payment-methods/', paymentMethod);
      await fetchPaymentMethods(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to create payment method');
      console.error('Error creating payment method:', err);
      throw err;
    }
  };

  // Update payment method
  const updatePaymentMethod = async (id: number, updates: any) => {
    try {
      setError(null);
      const response = await api.put(`/payment-methods/${id}`, updates);
      await fetchPaymentMethods(); // Refresh list
      return response.data;
    } catch (err) {
      setError('Failed to update payment method');
      console.error('Error updating payment method:', err);
      throw err;
    }
  };

  // Delete payment method
  const deletePaymentMethod = async (id: number) => {
    try {
      setError(null);
      await api.delete(`/payment-methods/${id}`);
      await fetchPaymentMethods(); // Refresh list
    } catch (err) {
      setError('Failed to delete payment method');
      console.error('Error deleting payment method:', err);
      throw err;
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (id: number) => {
    try {
      setError(null);
      await api.post(`/payment-methods/${id}/set-default`);
      await fetchPaymentMethods(); // Refresh list
    } catch (err) {
      setError('Failed to set default payment method');
      console.error('Error setting default payment method:', err);
      throw err;
    }
  };

  // Get transactions by date range
  const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
    try {
      const response = await api.get('/transactions/by-date-range', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching transactions by date range:', err);
      return [];
    }
  };

  // Get available payment methods
  const getAvailablePaymentMethods = async () => {
    try {
      const response = await api.get('/payment-methods/available-methods');
      return response.data;
    } catch (err) {
      console.error('Error fetching available payment methods:', err);
      return { methods: [], currencies: [] };
    }
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchSummary(),
        fetchTransactions({ limit: 50 }),
        fetchInvoices({ limit: 20 }),
        fetchPaymentMethods()
      ]);
    };
    initialize();
  }, []);

  return {
    summary,
    transactions,
    invoices,
    paymentMethods,
    loading,
    error,
    fetchSummary,
    fetchTransactions,
    fetchRecentTransactions,
    fetchInvoices,
    fetchPaymentMethods,
    getDefaultPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getTransactionsByDateRange,
    getAvailablePaymentMethods
  };
}; 