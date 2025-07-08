import { useState, useEffect } from 'react'
import * as paymentsApi from '../api/payments'

export interface UsePaymentsReturn {
  // Wallet
  wallet: paymentsApi.Wallet | null
  walletLoading: boolean
  walletError: string | null
  refreshWallet: () => Promise<void>
  
  // Payment Methods
  paymentMethods: paymentsApi.PaymentMethod[]
  paymentMethodsLoading: boolean
  paymentMethodsError: string | null
  addPaymentMethod: (data: paymentsApi.PaymentMethodCreate) => Promise<boolean>
  updatePaymentMethod: (id: number, data: paymentsApi.PaymentMethodUpdate) => Promise<boolean>
  deletePaymentMethod: (id: number) => Promise<boolean>
  refreshPaymentMethods: () => Promise<void>
  
  // Transactions
  transactions: paymentsApi.Transaction[]
  transactionsLoading: boolean
  transactionsError: string | null
  loadMoreTransactions: () => Promise<void>
  refreshTransactions: () => Promise<void>
  
  // Payment Operations
  deposit: (data: paymentsApi.DepositRequest) => Promise<boolean>
  withdraw: (data: paymentsApi.WithdrawalRequest) => Promise<boolean>
  payForTask: (data: paymentsApi.PaymentRequest) => Promise<boolean>
  
  // Loading states
  depositLoading: boolean
  withdrawLoading: boolean
  payLoading: boolean
}

export const usePayments = (): UsePaymentsReturn => {
  // Wallet state
  const [wallet, setWallet] = useState<paymentsApi.Wallet | null>(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<paymentsApi.PaymentMethod[]>([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true)
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null)
  
  // Transactions state
  const [transactions, setTransactions] = useState<paymentsApi.Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [transactionsSkip, setTransactionsSkip] = useState(0)
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true)
  
  // Operation loading states
  const [depositLoading, setDepositLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  
  // Load wallet
  const loadWallet = async () => {
    try {
      setWalletLoading(true)
      setWalletError(null)
      const data = await paymentsApi.getWallet()
      setWallet(data)
    } catch (error: any) {
      setWalletError(error?.response?.data?.detail || error?.message || 'Failed to load wallet')
    } finally {
      setWalletLoading(false)
    }
  }
  
  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setPaymentMethodsLoading(true)
      setPaymentMethodsError(null)
      const data = await paymentsApi.getPaymentMethods()
      setPaymentMethods(data)
    } catch (error: any) {
      setPaymentMethodsError(error?.response?.data?.detail || error?.message || 'Failed to load payment methods')
    } finally {
      setPaymentMethodsLoading(false)
    }
  }
  
  // Load transactions
  const loadTransactions = async (skip: number = 0, append: boolean = false) => {
    try {
      setTransactionsLoading(true)
      setTransactionsError(null)
      const data = await paymentsApi.getTransactions(skip, 50)
      
      if (append) {
        setTransactions(prev => [...prev, ...data])
      } else {
        setTransactions(data)
      }
      
      setHasMoreTransactions(data.length === 50)
      setTransactionsSkip(skip + data.length)
    } catch (error: any) {
      setTransactionsError(error?.response?.data?.detail || error?.message || 'Failed to load transactions')
    } finally {
      setTransactionsLoading(false)
    }
  }
  
  // Refresh functions
  const refreshWallet = async () => {
    await loadWallet()
  }
  
  const refreshPaymentMethods = async () => {
    await loadPaymentMethods()
  }
  
  const refreshTransactions = async () => {
    setTransactionsSkip(0)
    await loadTransactions(0, false)
  }
  
  // Load more transactions
  const loadMoreTransactions = async () => {
    if (hasMoreTransactions && !transactionsLoading) {
      await loadTransactions(transactionsSkip, true)
    }
  }
  
  // Add payment method
  const addPaymentMethod = async (data: paymentsApi.PaymentMethodCreate): Promise<boolean> => {
    try {
      await paymentsApi.createPaymentMethod(data)
      await loadPaymentMethods()
      return true
    } catch (error: any) {
      console.error('Failed to add payment method:', error)
      return false
    }
  }
  
  // Update payment method
  const updatePaymentMethod = async (id: number, data: paymentsApi.PaymentMethodUpdate): Promise<boolean> => {
    try {
      await paymentsApi.updatePaymentMethod(id, data)
      await loadPaymentMethods()
      return true
    } catch (error: any) {
      console.error('Failed to update payment method:', error)
      return false
    }
  }
  
  // Delete payment method
  const deletePaymentMethod = async (id: number): Promise<boolean> => {
    try {
      await paymentsApi.deletePaymentMethod(id)
      await loadPaymentMethods()
      return true
    } catch (error: any) {
      console.error('Failed to delete payment method:', error)
      return false
    }
  }
  
  // Deposit funds
  const deposit = async (data: paymentsApi.DepositRequest): Promise<boolean> => {
    try {
      setDepositLoading(true)
      await paymentsApi.depositFunds(data)
      await loadWallet()
      await refreshTransactions()
      return true
    } catch (error: any) {
      console.error('Failed to deposit funds:', error)
      return false
    } finally {
      setDepositLoading(false)
    }
  }
  
  // Withdraw funds
  const withdraw = async (data: paymentsApi.WithdrawalRequest): Promise<boolean> => {
    try {
      setWithdrawLoading(true)
      await paymentsApi.withdrawFunds(data)
      await loadWallet()
      await refreshTransactions()
      return true
    } catch (error: any) {
      console.error('Failed to withdraw funds:', error)
      return false
    } finally {
      setWithdrawLoading(false)
    }
  }
  
  // Pay for task
  const payForTask = async (data: paymentsApi.PaymentRequest): Promise<boolean> => {
    try {
      setPayLoading(true)
      await paymentsApi.payForTask(data)
      await loadWallet()
      await refreshTransactions()
      return true
    } catch (error: any) {
      console.error('Failed to pay for task:', error)
      return false
    } finally {
      setPayLoading(false)
    }
  }
  
  // Load initial data
  useEffect(() => {
    loadWallet()
    loadPaymentMethods()
    loadTransactions()
  }, [])
  
  return {
    // Wallet
    wallet,
    walletLoading,
    walletError,
    refreshWallet,
    
    // Payment Methods
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods,
    
    // Transactions
    transactions,
    transactionsLoading,
    transactionsError,
    loadMoreTransactions,
    refreshTransactions,
    
    // Payment Operations
    deposit,
    withdraw,
    payForTask,
    
    // Loading states
    depositLoading,
    withdrawLoading,
    payLoading
  }
} 