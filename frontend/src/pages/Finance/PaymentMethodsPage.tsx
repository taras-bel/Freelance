import React, { useState } from 'react';
import { useFinancials } from '../../hooks/useFinancials';
import PaymentMethods from '../../components/Finance/PaymentMethods';
import AddPaymentMethodModal from '../../components/Finance/AddPaymentMethodModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CreditCard, Building2, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const PaymentMethodsPage: React.FC = () => {
  const {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
  } = useFinancials();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);

  const handleAddMethod = () => {
    setShowAddModal(true);
  };

  const handleEditMethod = (method: any) => {
    setEditingMethod(method);
    // You could open an edit modal here
    console.log('Edit method:', method);
  };

  const handleDeleteMethod = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(id);
        // Success notification could be added here
      } catch (err) {
        console.error('Failed to delete payment method:', err);
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultPaymentMethod(id);
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    }
  };

  const handleAddSuccess = async (method: any) => {
    try {
      await createPaymentMethod(method);
      await fetchPaymentMethods();
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to add payment method:', err);
    }
  };

  const stats = [
    {
      title: 'Total Methods',
      value: paymentMethods.length,
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Methods',
      value: paymentMethods.filter(m => m.is_active).length,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Verified Methods',
      value: paymentMethods.filter(m => m.is_verified).length,
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Error Loading Payment Methods
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={() => fetchPaymentMethods()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payment Methods
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your cards and bank accounts for secure transactions
          </p>
        </div>
        <Button onClick={handleAddMethod} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
          <CreditCard className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      <PaymentMethods
        paymentMethods={paymentMethods}
        onAddMethod={handleAddMethod}
        onEditMethod={handleEditMethod}
        onDeleteMethod={handleDeleteMethod}
        onSetDefault={handleSetDefault}
        loading={loading}
      />

      {/* Security Information */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Security Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Bank-level encryption (256-bit SSL)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  PCI DSS compliant
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  No sensitive data stored on servers
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Two-factor authentication support
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Supported Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Credit Cards</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                  Visa, Mastercard, Amex, Discover
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Debit Cards</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                  All major networks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Bank Accounts</span>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                  ACH transfers
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Digital Wallets</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default PaymentMethodsPage; 
