import React from 'react'
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Transaction {
  id: number
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission' | 'fee'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  fee_amount: number
  created_at: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
  onLoadMore,
  hasMore = false
}) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={16} className="text-green-500" />
      case 'withdrawal':
        return <ArrowUpRight size={16} className="text-red-500" />
      case 'payment':
        return <ArrowRight size={16} className="text-blue-500" />
      case 'refund':
        return <ArrowUpRight size={16} className="text-orange-500" />
      case 'commission':
        return <ArrowDownLeft size={16} className="text-purple-500" />
      case 'fee':
        return <ArrowDownLeft size={16} className="text-purple-500" />
      default:
        return <ArrowRight size={16} className="text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
      case 'failed':
        return <XCircle size={16} className="text-red-500" />
      case 'cancelled':
        return <AlertCircle size={16} className="text-gray-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
        return 'text-red-600'
      case 'payment':
        return 'text-blue-600'
      case 'refund':
        return 'text-orange-600'
      case 'commission':
        return 'text-purple-600'
      case 'fee':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      case 'payment':
        return 'Payment'
      case 'refund':
        return 'Refund'
      case 'commission':
        return 'Service Commission (3%)'
      case 'fee':
        return 'Service Commission (3%)'
      default:
        return type
    }
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Transaction History</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.type)}
                  {getStatusIcon(transaction.status)}
                </div>
                <div>
                  <p className="font-medium">{getTypeLabel(transaction.type)}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.description || 'Transaction'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}
                  {formatAmount(transaction.amount, transaction.currency)}
                </p>
                {transaction.fee_amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Fee: {formatAmount(transaction.fee_amount, transaction.currency)}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="btn btn-outline w-full"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </div>
  )
} 
