import React, { useState, useEffect } from 'react'
import { X, CreditCard, DollarSign, Info } from 'lucide-react'

interface PaymentMethod {
  id: number
  type: string
  provider: string
  account_id: string
  is_default: boolean
}

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: number, paymentMethodId: number) => Promise<boolean>
  paymentMethods: PaymentMethod[]
  loading?: boolean
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  paymentMethods,
  loading = false
}) => {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [commissionInfo, setCommissionInfo] = useState<{
    original_amount: number;
    service_commission: number;
    net_amount: number;
  } | null>(null)

  // Calculate commission when amount changes
  useEffect(() => {
    const calculateCommission = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setCommissionInfo(null)
        return
      }

      try {
        const response = await fetch(`/api/v1/payments/calculate-commission?amount=${amount}`)
        if (response.ok) {
          const data = await response.json()
          setCommissionInfo(data)
        }
      } catch (error) {
        console.error('Failed to calculate commission:', error)
      }
    }

    calculateCommission()
  }, [amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    const success = await onDeposit(parseFloat(amount), selectedMethod)
    if (success) {
      setAmount('')
      setSelectedMethod(null)
      onClose()
    } else {
      setError('Failed to process deposit. Please try again.')
    }
  }

  const handleClose = () => {
    setAmount('')
    setSelectedMethod(null)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <div>
              <h2 className="font-semibold">Deposit Funds</h2>
              <p className="text-sm text-muted-foreground">Add money to your wallet</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
            
            {/* Commission Information */}
            {commissionInfo && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Service Commission (3%)
                    </p>
                    <div className="space-y-1 text-blue-800 dark:text-blue-200">
                      <div className="flex justify-between">
                        <span>Original Amount:</span>
                        <span>${commissionInfo.original_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Commission:</span>
                        <span>-${commissionInfo.service_commission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t border-blue-200 dark:border-blue-700 pt-1">
                        <span>Net Amount:</span>
                        <span>${commissionInfo.net_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-4 border rounded-lg">
                <CreditCard size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No payment methods available</p>
                <p className="text-xs text-muted-foreground">Add a payment method first</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(parseInt(e.target.value))}
                      className="mr-3"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {method.type} • {method.provider}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ****{method.account_id.slice(-4)}
                      </p>
                    </div>
                    {method.is_default && (
                      <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || !amount || !selectedMethod}
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
