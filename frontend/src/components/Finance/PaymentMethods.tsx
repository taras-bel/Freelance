import React, { useState } from 'react';
import { CreditCard, Building2, Plus, Edit, Trash2, Star, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface PaymentMethod {
  id: number;
  method_type: string;
  provider: string;
  is_default: boolean;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  bank_name?: string;
  bank_last4?: string;
  bank_routing?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddMethod: () => void;
  onEditMethod: (method: PaymentMethod) => void;
  onDeleteMethod: (id: number) => void;
  onSetDefault: (id: number) => void;
  loading?: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  onAddMethod,
  onEditMethod,
  onDeleteMethod,
  onSetDefault,
  loading = false
}) => {
  const [showDetails, setShowDetails] = useState<number[]>([]);

  const toggleDetails = (id: number) => {
    setShowDetails(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'bank':
        return Building2;
      default:
        return CreditCard;
    }
  };

  const getMethodDisplayName = (method: PaymentMethod) => {
    if (method.method_type === 'card') {
      return `${method.card_brand} •••• ${method.card_last4}`;
    } else if (method.method_type === 'bank') {
      return `${method.bank_name} •••• ${method.bank_last4}`;
    }
    return method.provider;
  };

  const getMethodSubtitle = (method: PaymentMethod) => {
    if (method.method_type === 'card') {
      return `Expires ${method.card_exp_month}/${method.card_exp_year}`;
    } else if (method.method_type === 'bank') {
      return `Routing: ${method.bank_routing}`;
    }
    return method.provider;
  };

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'text-red-600 dark:text-red-400';
    if (!isVerified) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isVerified) return 'Pending Verification';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Payment Methods
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your cards and bank accounts
          </p>
        </div>
        <Button onClick={onAddMethod} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Method
        </Button>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="text-center py-12">
            <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No payment methods yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Add a payment method to start making transactions
            </p>
            <Button onClick={onAddMethod}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = getMethodIcon(method.method_type);
            return (
              <Card key={method.id} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        method.method_type === 'card' 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'bg-green-50 dark:bg-green-900/20'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          method.method_type === 'card' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {getMethodDisplayName(method)}
                          </h4>
                          {method.is_default && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/20 rounded-full">
                              <Star className="w-3 h-3 text-cyan-600 dark:text-cyan-400 fill-current" />
                              <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                                Default
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getMethodSubtitle(method)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-medium ${getStatusColor(method.is_active, method.is_verified)}`}>
                            {getStatusText(method.is_active, method.is_verified)}
                          </span>
                          {method.is_verified && (
                            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDetails(method.id)}
                      >
                        {showDetails.includes(method.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditMethod(method)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteMethod(method.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {showDetails.includes(method.id) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Method Details
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Type:</span>
                              <span className="font-medium text-slate-900 dark:text-white capitalize">
                                {method.method_type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Provider:</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {method.provider}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Added:</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {new Date(method.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Actions
                          </h5>
                          <div className="space-y-2">
                            {!method.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSetDefault(method.id)}
                                className="w-full justify-start"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Set as Default
                              </Button>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                              <Shield className="w-4 h-4" />
                              <span>Secured with bank-level encryption</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Security & Privacy
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your payment information is encrypted and stored securely. We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethods; 
