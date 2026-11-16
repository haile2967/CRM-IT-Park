import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import userService from '../../services/userService';
import type { User } from '../../types/user';

interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentUserId?: number;
  onStatusUpdated: (updatedUser: User) => void;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserId,
  onStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isSelf = currentUserId === user.id;
  const isCurrentlyActive = user.status === 'active';
  const targetStatus = isCurrentlyActive ? 'inactive' : 'active';

  const handleToggle = async () => {
    if (isSelf && isCurrentlyActive) {
      setErrorMessage('You cannot deactivate your own account.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await userService.updateStatus(user.id, targetStatus);
      onStatusUpdated(updated);
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setErrorMessage(response?.data?.message || `Failed to update status to ${targetStatus}.`);
      } else {
        setErrorMessage('A network error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCurrentlyActive
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                  : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50'
              }`}
            >
              {isCurrentlyActive ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {isCurrentlyActive ? 'Deactivate User Account' : 'Reactivate User Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <Alert variant="error" title="Action Prohibited">
              {errorMessage}
            </Alert>
          )}

          {isSelf && isCurrentlyActive ? (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5">Self-Deactivation Blocked</span>
              You are currently logged in as this administrator. Security policies prevent administrators from deactivating their own credentials.
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to{' '}
              <strong className="text-slate-900 dark:text-white">
                {isCurrentlyActive ? 'deactivate' : 'reactivate'}
              </strong>{' '}
              the account for <strong className="text-slate-900 dark:text-white">{user.full_name}</strong> (
              <span className="font-mono text-slate-500 dark:text-slate-400">{user.email}</span>)?
              {isCurrentlyActive && (
                <span className="block mt-2 text-slate-500 dark:text-slate-400">
                  Deactivated users will be immediately logged out and blocked from signing in to the CRM.
                </span>
              )}
            </p>
          )}

          {/* User Preview pill */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{user.full_name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">{user.role?.role_name || 'No Role'}</p>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                user.status === 'active'
                  ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
              }`}
            >
              Current: {user.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={isCurrentlyActive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleToggle}
            isLoading={isSubmitting}
            disabled={isSelf && isCurrentlyActive}
          >
            {isCurrentlyActive ? 'Confirm Deactivation' : 'Reactivate Account'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;
