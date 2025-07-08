import api from './axios'

export interface Wallet {
  id: number
  user_id: number
  balance: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface PaymentMethod {
  id: number
  user_id: number
  type: string
  provider: string
  account_id: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Transaction {
  id: number
  wallet_id: number
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  external_id?: string
  payment_method_id?: number
  task_id?: number
  fee_amount: number
  fee_percentage: number
  created_at: string
  updated_at?: string
}

export interface DepositRequest {
  amount: number
  currency: string
  payment_method_id: number
}

export interface WithdrawalRequest {
  amount: number
  currency: string
  payment_method_id: number
}

export interface PaymentRequest {
  amount: number
  task_id: number
  description?: string
}

export interface PaymentMethodCreate {
  type: string
  provider: string
  account_id: string
  is_default: boolean
}

export interface PaymentMethodUpdate {
  is_default?: boolean
  is_active?: boolean
}

// Wallet API
export const getWallet = async (): Promise<Wallet> => {
  const response = await api.get('/wallet')
  return response.data
}

// Payment Methods API
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/payment-methods')
  return response.data
}

export const createPaymentMethod = async (data: PaymentMethodCreate): Promise<PaymentMethod> => {
  const response = await api.post('/payment-methods', data)
  return response.data
}

export const updatePaymentMethod = async (id: number, data: PaymentMethodUpdate): Promise<PaymentMethod> => {
  const response = await api.put(`/payment-methods/${id}`, data)
  return response.data
}

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await api.delete(`/payment-methods/${id}`)
}

// Transactions API
export const getTransactions = async (skip: number = 0, limit: number = 50): Promise<Transaction[]> => {
  const response = await api.get(`/transactions?skip=${skip}&limit=${limit}`)
  return response.data
}

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`)
  return response.data
}

// Payment Operations API
export const depositFunds = async (data: DepositRequest): Promise<Transaction> => {
  const response = await api.post('/deposit', data)
  return response.data
}

export const withdrawFunds = async (data: WithdrawalRequest): Promise<Transaction> => {
  const response = await api.post('/withdraw', data)
  return response.data
}

export const payForTask = async (data: PaymentRequest): Promise<Transaction> => {
  const response = await api.post('/pay', data)
  return response.data
} 