import React, { useState, useEffect } from 'react';
import { Share2, Check, X, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import accountService from '../../services/accountService';
import userService from '../../services/userService';
import type { Account } from '../../types/account';
import type { User as CrmUser } from '../../types/user';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onTransferred: (updated: Account) => void;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  account,
  onClose,
  onTransferred,
}) => {
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && account) {
      setSelectedUserId(account.owner_user_id || '');
      setErrorMessage(null);

      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const list = await userService.getUsers();
          setUsers(list.filter((u) => u.status === 'active'));
        } catch (err) {
          console.error('Failed to load users for ownership transfer:', err);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMessage('Please select a new portfolio owner.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await accountService.transferOwnership(account.id, Number(selectedUserId));
      onTransferred(updated);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiErr.response?.data?.message || 'Failed to transfer account ownership.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1120]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Transfer Account Ownership
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reassign portfolio management responsibility (BR-002)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Organization:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block text-sm">
              {account.organization_name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Current Owner: {account.owner ? `${account.owner.first_name} ${account.owner.last_name}` : 'Unassigned'}
            </span>
          </div>

          {/* New Owner Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Select New Portfolio Owner <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              disabled={isLoadingUsers}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              required
            >
              <option value="" disabled>
                {isLoadingUsers ? 'Loading team members...' : 'Select team member'}
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} ({u.role?.name || u.role?.role_name || 'Officer'})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm Transfer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferOwnershipModal;
