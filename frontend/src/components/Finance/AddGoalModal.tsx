import React, { useState } from 'react';
import { X, Target, Calendar, Star, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (goal: any) => void;
  goalTypes: Array<{ id: string; name: string; description: string }>;
  priorities: Array<{ id: string; name: string; color: string }>;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  goalTypes, 
  priorities 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'savings',
    target_amount: '',
    currency: 'USD',
    deadline: '',
    priority: 'medium',
    category: '',
    is_public: false,
    monthly_target: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_amount) {
      setError('Please fill in all required fields');
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    if (targetAmount <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const goalData = {
        ...formData,
        target_amount: targetAmount,
        monthly_target: formData.monthly_target ? parseFloat(formData.monthly_target) : undefined,
        deadline: formData.deadline || undefined
      };

      onSuccess(goalData);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'savings',
      target_amount: '',
      currency: 'USD',
      deadline: '',
      priority: 'medium',
      category: '',
      is_public: false,
      monthly_target: ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'debt_payoff': return '💳';
      case 'income': return '💵';
      case 'emergency_fund': return '🛡️';
      case 'retirement': return '🏖️';
      case 'education': return '📚';
      case 'travel': return '✈️';
      case 'home': return '🏠';
      case 'business': return '💼';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Create Financial Goal
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Save for vacation, Pay off credit card"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Goal Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your goal and why it's important to you..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Goal Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.goal_type === type.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="goalType"
                    value={type.id}
                    checked={formData.goal_type === type.id}
                    onChange={(e) => handleInputChange('goal_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getGoalTypeIcon(type.id)}</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {type.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                $
              </span>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Monthly Target */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Monthly Target (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                $
              </span>
              <input
                type="number"
                value={formData.monthly_target}
                onChange={(e) => handleInputChange('monthly_target', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              How much you plan to save/invest each month
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Deadline (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((priority) => (
                <label
                  key={priority.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priority === priority.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.id}
                    checked={formData.priority === priority.id}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <Star className={`w-4 h-4 ${getPriorityColor(priority.id)}`} />
                    <span className={`font-medium text-sm ${getPriorityColor(priority.id)}`}>
                      {priority.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g., Personal, Business, Family"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Public Goal Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Make this goal public for community inspiration
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Goal Privacy
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your financial goals are private by default. Making them public helps inspire others in the community.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal; 
