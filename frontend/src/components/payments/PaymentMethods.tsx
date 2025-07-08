import React, { useState } from 'react'
import { CreditCard, Plus, Edit, Trash2, Star, StarOff } from 'lucide-react'

interface PaymentMethod {
  id: number
  type: string
  provider: string
  account_id: string
  is_default: boolean
  is_active: boolean
  created_at: string
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  loading?: boolean
  onAdd?: () => void
  onEdit?: (method: PaymentMethod) => void
  onDelete?: (id: number) => void
  onSetDefault?: (id: number) => void
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return '💳'
      case 'paypal':
        return '🔵'
      case 'bank':
        return '🏦'
      default:
        return '💳'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'card':
        return 'Credit Card'
      case 'paypal':
        return 'PayPal'
      case 'bank':
        return 'Bank Transfer'
      default:
        return type
    }
  }

  const maskAccountId = (accountId: string) => {
    if (accountId.length <= 8) return accountId
    return `****${accountId.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Payment Methods</h3>
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Payment Methods</h3>
        <button
          onClick={onAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Method
        </button>
      </div>
      
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No payment methods</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add a payment method to deposit or withdraw funds
          </p>
          <button
            onClick={onAdd}
            className="btn btn-primary"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border transition-colors ${
                method.is_default ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getProviderIcon(method.provider)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {getTypeLabel(method.type)} • {method.provider}
                      </p>
                      {method.is_default && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {maskAccountId(method.account_id)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <button
                      onClick={() => onSetDefault?.(method.id)}
                      className="btn btn-ghost btn-sm"
                      title="Set as default"
                    >
                      <StarOff size={16} />
                    </button>
                  )}
                  {method.is_default && (
                    <div className="text-primary">
                      <Star size={16} />
                    </div>
                  )}
                  <button
                    onClick={() => onEdit?.(method)}
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete?.(method.id)}
                    className="btn btn-ghost btn-sm text-destructive"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
