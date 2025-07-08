import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getTransactions, getPaymentMethods } from '../api/payments';

interface FinancialState {
  summary: any;
  transactions: any[];
  invoices: any[];
  paymentMethods: any[];
  loading: boolean;
  error: string | null;
  fetchFinancialData: () => Promise<void>;
}

// Реализация getInvoices
const getInvoices = async (params = { limit: 20 }) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`http://localhost:8000/api/v1/invoices/?limit=${params.limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  const data = await res.json();
  return { data };
};

// Реализация getFinancialSummary
const getFinancialSummary = async () => {
  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/api/v1/transactions/summary/month', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch financial summary');
  const data = await res.json();
  return { data };
};

export const useFinanceStore = create<FinancialState>()(
  devtools(
    (set) => ({
      summary: null,
      transactions: [],
      invoices: [],
      paymentMethods: [],
      loading: false,
      error: null,
      fetchFinancialData: async () => {
        set({ loading: true, error: null });
        try {
          const [summary, transactions, invoices, paymentMethods] =
            await Promise.all([
              getFinancialSummary(),
              getTransactions({ limit: 50 }),
              getInvoices({ limit: 20 }),
              getPaymentMethods(),
            ]);
          set({
            summary: summary.data,
            transactions: transactions.data,
            invoices: invoices.data,
            paymentMethods: paymentMethods.data,
            loading: false,
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
    }),
    { name: 'FinanceStore' }
  )
);