import React, { useState } from 'react';
import { X, Calendar, PieChart, Plus, AlertCircle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (budget: any) => void;
  budgetTypes: Array<{ id: string; name: string; description: string }>;
  defaultCategories: Array<{ name: string; color: string; icon: string }>;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  budgetTypes, 
  defaultCategories 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget_type: 'monthly',
    total_amount: '',
    currency: 'USD',
    start_date: '',
    end_date: '',
    categories: [] as Array<{
      category_name: string;
      planned_amount: number;
      color: string;
      icon: string;
    }>
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category_name: '',
    planned_amount: '',
    color: '#3B82F6',
    icon: '📁'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate end date for monthly budgets
    if (field === 'start_date' && formData.budget_type === 'monthly') {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      
      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleBudgetTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      budget_type: type
    }));

    // Set default dates based on type
    const today = new Date();
    let startDate = today.toISOString().split('T')[0];
    let endDate = '';

    if (type === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (type === 'yearly') {
      startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    }

    setFormData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  };

  const addCategory = () => {
    if (!newCategory.category_name || !newCategory.planned_amount) {
      setError('Please fill in category name and amount');
      return;
    }

    const amount = parseFloat(newCategory.planned_amount);
    if (amount <= 0) {
      setError('Category amount must be greater than 0');
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, {
        category_name: newCategory.category_name,
        planned_amount: amount,
        color: newCategory.color,
        icon: newCategory.icon
      }]
    }));

    setNewCategory({
      category_name: '',
      planned_amount: '',
      color: '#3B82F6',
      icon: '📁'
    });
    setShowCategoryForm(false);
    setError('');
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addDefaultCategory = (category: any) => {
    const amount = formData.total_amount ? parseFloat(formData.total_amount) / defaultCategories.length : 0;
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, {
        category_name: category.name,
        planned_amount: amount,
        color: category.color,
        icon: category.icon
      }]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.total_amount || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    const totalAmount = parseFloat(formData.total_amount);
    if (totalAmount <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }

    if (formData.categories.length === 0) {
      setError('Please add at least one category');
      return;
    }

    // Check if categories total matches budget total
    const categoriesTotal = formData.categories.reduce((sum, cat) => sum + cat.planned_amount, 0);
    if (Math.abs(categoriesTotal - totalAmount) > 0.01) {
      setError('Categories total must equal budget total');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const budgetData = {
        ...formData,
        total_amount: totalAmount
      };

      onSuccess(budgetData);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget_type: 'monthly',
      total_amount: '',
      currency: 'USD',
      start_date: '',
      end_date: '',
      categories: []
    });
    setNewCategory({
      category_name: '',
      planned_amount: '',
      color: '#3B82F6',
      icon: '📁'
    });
    setShowCategoryForm(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return '📅';
      case 'yearly': return '📊';
      case 'custom': return '⚙️';
      default: return '💰';
    }
  };

  const getTotalPlanned = () => {
    return formData.categories.reduce((sum, cat) => sum + cat.planned_amount, 0);
  };

  const getRemaining = () => {
    const total = parseFloat(formData.total_amount) || 0;
    return total - getTotalPlanned();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Create Budget
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Budget Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Monthly Budget, Vacation Budget"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Budget Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your budget and spending goals..."
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Budget Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Budget Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {budgetTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.budget_type === type.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={type.id}
                    checked={formData.budget_type === type.id}
                    onChange={(e) => handleBudgetTypeChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getBudgetTypeIcon(type.id)}</span>
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

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Total Budget Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                $
              </span>
              <input
                type="number"
                value={formData.total_amount}
                onChange={(e) => handleInputChange('total_amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  min={formData.start_date}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Budget Categories *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </div>

            {/* Default Categories */}
            {formData.categories.length === 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Quick start with default categories:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {defaultCategories.slice(0, 6).map((category, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addDefaultCategory(category)}
                      className="flex items-center space-x-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Form */}
            {showCategoryForm && (
              <div className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Add New Category
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategory.category_name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, category_name: e.target.value }))}
                      placeholder="e.g., Food, Transport"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={newCategory.planned_amount}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, planned_amount: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCategory}
                  >
                    Add Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategoryForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Categories List */}
            {formData.categories.length > 0 && (
              <div className="space-y-2">
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {category.category_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${category.planned_amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Category Summary */}
            {formData.categories.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Categories Total:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${getTotalPlanned().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-600 dark:text-slate-400">Remaining:</span>
                  <span className={`font-semibold ${
                    getRemaining() >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${getRemaining().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
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
                Budget Privacy
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your budget information is private and secure. We use bank-level encryption to protect your data.
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
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Budget'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal; 
