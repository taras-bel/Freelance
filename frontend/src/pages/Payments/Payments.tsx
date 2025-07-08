import React, { useState } from 'react'
import { usePayments } from '../../hooks/usePayments'
import { WalletCard } from '../../components/payments/WalletCard'
import { TransactionHistory } from '../../components/payments/TransactionHistory'
import { PaymentMethods } from '../../components/payments/PaymentMethods'
import { DepositModal } from '../../components/payments/DepositModal'
import { WithdrawModal } from '../../components/payments/WithdrawModal'
import { useNotifications } from '../../hooks/useNotifications'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

export const Payments: React.FC = () => {
  const {
    wallet,
    walletLoading,
    walletError,
    refreshWallet,
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods,
    transactions,
    transactionsLoading,
    transactionsError,
    loadMoreTransactions,
    refreshTransactions,
    deposit,
    withdraw,
    depositLoading,
    withdrawLoading
  } = usePayments()

  const { addNotification } = useNotifications()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const handleDeposit = async (amount: number, paymentMethodId: number) => {
    const success = await deposit({ amount, currency: 'USD', payment_method_id: paymentMethodId })
    if (success) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Deposit Successful',
        message: `Successfully deposited $${amount.toFixed(2)} to your wallet`,
        timestamp: new Date()
      })
    } else {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Deposit Failed',
        message: 'Failed to process deposit. Please try again.',
        timestamp: new Date()
      })
    }
    return success
  }

  const handleWithdraw = async (amount: number, paymentMethodId: number) => {
    const success = await withdraw({ amount, currency: 'USD', payment_method_id: paymentMethodId })
    if (success) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Withdrawal Successful',
        message: `Successfully initiated withdrawal of $${amount.toFixed(2)}`,
        timestamp: new Date()
      })
    } else {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Failed to process withdrawal. Please try again.',
        timestamp: new Date()
      })
    }
    return success
  }

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method modal
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Coming Soon',
      message: 'Payment method management will be available soon',
      timestamp: new Date()
    })
  }

  const handleEditPaymentMethod = (method: any) => {
    // TODO: Implement edit payment method modal
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Coming Soon',
      message: 'Payment method editing will be available soon',
      timestamp: new Date()
    })
  }

  const handleDeletePaymentMethod = async (id: number) => {
    const success = await deletePaymentMethod(id)
    if (success) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Payment Method Deleted',
        message: 'Payment method has been removed successfully',
        timestamp: new Date()
      })
    } else {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete payment method. Please try again.',
        timestamp: new Date()
      })
    }
  }

  const handleSetDefaultPaymentMethod = async (id: number) => {
    const success = await updatePaymentMethod(id, { is_default: true })
    if (success) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Default Updated',
        message: 'Default payment method has been updated',
        timestamp: new Date()
      })
    } else {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update default payment method. Please try again.',
        timestamp: new Date()
      })
    }
  }

  const handleRefresh = async () => {
    await Promise.all([
      refreshWallet(),
      refreshPaymentMethods(),
      refreshTransactions()
    ])
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Refreshed',
      message: 'Payment information has been updated',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage your wallet and payment methods</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={walletLoading || paymentMethodsLoading || transactionsLoading}
          className="btn btn-outline flex items-center gap-2"
        >
          <RefreshCw size={16} className={walletLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {(walletError || paymentMethodsError || transactionsError) && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error Loading Data</p>
              <p className="text-sm text-destructive/80">
                {walletError || paymentMethodsError || transactionsError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Card */}
      <WalletCard
        balance={wallet?.balance || 0}
        currency={wallet?.currency || 'USD'}
        loading={walletLoading}
        onDeposit={() => setShowDepositModal(true)}
        onWithdraw={() => setShowWithdrawModal(true)}
      />

      {/* Payment Methods and Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethods
          paymentMethods={paymentMethods}
          loading={paymentMethodsLoading}
          onAdd={handleAddPaymentMethod}
          onEdit={handleEditPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onSetDefault={handleSetDefaultPaymentMethod}
        />
        
        <TransactionHistory
          transactions={transactions}
          loading={transactionsLoading}
          onLoadMore={loadMoreTransactions}
          hasMore={transactions.length >= 50}
        />
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        paymentMethods={paymentMethods}
        loading={depositLoading}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        paymentMethods={paymentMethods}
        balance={wallet?.balance || 0}
        loading={withdrawLoading}
      />
    </div>
  )
} 
