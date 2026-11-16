import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import accountService from '../../services/accountService';
import type { Account } from '../../types/account';

interface DeleteAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onDeleted: (accountId: number) => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  account,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await accountService.deleteAccount(account.id);
      onDeleted(account.id);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiErr.response?.data?.message ||
          'Failed to delete corporate account. Active contracts or tickets may be blocking removal.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Delete Corporate Account
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                Permanent record removal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {account.organization_name}
            </strong>
            ?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {account.account_type?.category_name || 'Standard'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Facility Location:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {account.location || 'Ethiopian IT Park'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Associated Contacts:</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                {account.contacts_count || 0}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            ⚠️ <strong>Data Integrity Check:</strong> Accounts with active open commercial deals or unresolved support tickets cannot be deleted until those dependencies are closed or reassigned.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
