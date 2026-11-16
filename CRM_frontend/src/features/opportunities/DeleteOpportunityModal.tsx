import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Opportunity } from '../../types/opportunity';
import { opportunityService } from '../../services/opportunityService';

interface DeleteOpportunityModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteOpportunityModal: React.FC<DeleteOpportunityModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await opportunityService.deleteOpportunity(opportunity.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete opportunity:', err);
      setError(err.response?.data?.message || 'Failed to delete deal.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Commercial Opportunity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to remove the deal for{' '}
              <strong className="text-slate-900 dark:text-white">
                {opportunity.account?.organization_name || 'this account'}
              </strong>{' '}
              valued at{' '}
              <strong className="text-cyan-700 dark:text-cyan-400 font-mono">
                ETB {opportunity.value.toLocaleString()}
              </strong>
              ?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Deal'}
          </button>
        </div>
      </div>
    </div>
  );
};
