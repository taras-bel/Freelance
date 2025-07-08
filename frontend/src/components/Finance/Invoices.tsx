import React from 'react';
import { Button } from '../ui/Button';
import { Plus, CreditCard } from 'lucide-react';

interface InvoicesProps {
  invoices: any[];
}

const Invoices: React.FC<InvoicesProps> = ({ invoices }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Invoices
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your invoices and billing
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No invoices yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Invoices will appear here when you create them
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Invoice
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {invoice.invoice_number}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Due: {new Date(invoice.due_date || '').toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  ${invoice.total_amount.toLocaleString()}
                </p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
