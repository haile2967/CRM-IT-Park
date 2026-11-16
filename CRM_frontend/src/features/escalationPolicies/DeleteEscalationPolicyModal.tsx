import React, { useState } from 'react';
import { AlertTriangle, Trash2, PowerOff, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import escalationPolicyService from '../../services/escalationPolicyService';
import { PRIORITY_CONFIG, formatDuration } from './escalationUtils';
import type { EscalationPolicy } from '../../types/escalationPolicy';

interface DeleteEscalationPolicyModalProps {
  isOpen: boolean;
  policy: EscalationPolicy | null;
  onClose: () => void;
  onDeleted: (policyId: number) => void;
  onDeactivated: (updatedPolicy: EscalationPolicy) => void;
}

export const DeleteEscalationPolicyModal: React.FC<
  DeleteEscalationPolicyModalProps
> = ({ isOpen, policy, onClose, onDeleted, onDeactivated }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canDeactivateInstead, setCanDeactivateInstead] = useState(false);

  if (!isOpen || !policy) return null;

  const priorityMeta = PRIORITY_CONFIG[policy.priority];

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    setCanDeactivateInstead(false);

    try {
      await escalationPolicyService.deletePolicy(policy.id);
      onDeleted(policy.id);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Failed to delete escalation policy. Please check system integrity rules.';
      setErrorMessage(msg);

      if (msg.toLowerCase().includes('deactivate')) {
        setCanDeactivateInstead(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateInstead = async () => {
    setIsDeactivating(true);
    setErrorMessage(null);
    try {
      const updated = await escalationPolicyService.toggleStatus(policy.id, false);
      onDeactivated(updated);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiErr.response?.data?.message || 'Failed to deactivate escalation policy.'
      );
    } finally {
      setIsDeactivating(false);
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
                Delete Escalation Policy
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                SLA configuration for {policy.priority} Priority
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
            Are you sure you want to permanently delete the escalation policy for{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">{policy.priority} Priority</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Priority Tier:</span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] ${priorityMeta.badgeClass}`}>
                {policy.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Reminder Threshold:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {policy.reminder_threshold_minutes} min ({formatDuration(policy.reminder_threshold_minutes)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Escalation Threshold:</span>
              <span className="text-rose-700 dark:text-rose-400 font-semibold">
                {policy.escalation_threshold_minutes} min ({formatDuration(policy.escalation_threshold_minutes)})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <span className="font-semibold block">⚠️ Data Integrity Rule:</span>
            <span>
              If tickets have already logged escalation history under this policy, deletion will be blocked by the server. In that case, deactivating the policy preserves audit compliance.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isDeleting || isDeactivating}
            >
              Cancel
            </Button>

            {canDeactivateInstead ? (
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={handleDeactivateInstead}
                isLoading={isDeactivating}
                leftIcon={<PowerOff className="w-3.5 h-3.5" />}
              >
                Deactivate Policy Instead
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={handleDelete}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Permanently Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEscalationPolicyModal;
