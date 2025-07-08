import React, { useState } from 'react';
import { X, Building2, CreditCard, Wallet, Check, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  availableBalance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  availableBalance 
}) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const withdrawalMethods = [
    {
      id: 'bank',
      name: 'Bank Account',
      icon: Building2,
      description: 'Direct bank transfer',
      processingTime: '1-3 business days',
      fee: 0,
      minAmount: 10
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Transfer to your card',
      processingTime: '2-5 business days',
      fee: 2.50,
      minAmount: 25
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'PayPal, Apple Pay, Google Pay',
      processingTime: 'Instant',
      fee: 1.00,
      minAmount: 5
    }
  ];

  const selectedMethodData = withdrawalMethods.find(m => m.id === selectedMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (!amount || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    if (selectedMethodData && withdrawAmount < selectedMethodData.minAmount) {
      setError(`Minimum withdrawal amount is $${selectedMethodData.minAmount}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess(withdrawAmount);
      onClose();
      setAmount('');
    } catch (err) {
      setError('Failed to process withdrawal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setAmount(value);
      setError('');
    }
  };

  const getTotalFee = () => {
    return selectedMethodData ? selectedMethodData.fee : 0;
  };

  const getNetAmount = () => {
    const withdrawAmount = parseFloat(amount || '0');
    return Math.max(0, withdrawAmount - getTotalFee());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Withdraw Funds
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Available Balance
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                $
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            {error && (
              <div className="flex items-center space-x-2 mt-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Quick Amounts
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[25, 50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className={`py-2 px-3 rounded-lg border transition-colors ${
                    amount === preset.toString()
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : preset > availableBalance
                      ? 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Withdrawal Method Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Withdrawal Method
            </label>
            <div className="space-y-2">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedMethod === method.id
                        ? 'border-cyan-500 bg-cyan-500'
                        : 'border-slate-400 dark:border-slate-500'
                    }`}>
                      {selectedMethod === method.id && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {method.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {method.processingTime}
                      </p>
                      {method.fee > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Fee: ${method.fee}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Withdrawal Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                Withdrawal Summary
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Withdrawal Amount:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                {getTotalFee() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Processing Fee:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -${getTotalFee().toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-600 pt-1 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">You'll Receive:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${getNetAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
                {selectedMethodData && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Processing time: {selectedMethodData.processingTime}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Withdraw $${parseFloat(amount || '0').toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal; 
