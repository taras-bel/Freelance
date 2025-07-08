import React from 'react'
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

interface WalletCardProps {
  balance: number
  currency: string
  loading?: boolean
  onDeposit?: () => void
  onWithdraw?: () => void
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  currency,
  loading = false,
  onDeposit,
  onWithdraw
}) => {
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <Wallet size={20} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">Wallet Balance</h3>
            <p className="text-sm text-muted-foreground">Available funds</p>
          </div>
        </div>
        <CreditCard size={20} className="text-muted-foreground" />
      </div>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded flex-1"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-3xl font-bold text-green-600">
              {formatBalance(balance)}
            </p>
            <p className="text-sm text-muted-foreground">
              {currency} • Available for transactions
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onDeposit}
              className="btn btn-primary flex-1 flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              className="btn btn-outline flex-1 flex items-center gap-2"
              disabled={balance <= 0}
            >
              <TrendingDown size={16} />
              Withdraw
            </button>
          </div>
        </>
      )}
    </div>
  )
} 
