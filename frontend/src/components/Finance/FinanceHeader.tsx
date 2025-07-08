import React from 'react';
import { Button } from '../ui/Button';
import { Download, Calendar } from 'lucide-react';

interface FinanceHeaderProps {
  onRefresh: () => void;
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Financial Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your earnings, transactions, and financial analytics
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={onRefresh}>
          <Calendar className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default FinanceHeader;
