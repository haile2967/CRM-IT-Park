import React, { useState, useEffect } from 'react';
import { X, Check, Sliders } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import escalationPolicyService from '../../services/escalationPolicyService';
import { PRIORITY_CONFIG, formatDuration } from './escalationUtils';
import type { EscalationPolicy } from '../../types/escalationPolicy';

interface QuickReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: EscalationPolicy | null;
  onUpdated: (updated: EscalationPolicy) => void;
}

export const QuickReminderModal: React.FC<QuickReminderModalProps> = ({
  isOpen,
  onClose,
  policy,
  onUpdated,
}) => {
  const [minutes, setMinutes] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (policy) {
      setMinutes(policy.reminder_threshold_minutes);
      setErrorMessage(null);
    }
  }, [policy, isOpen]);

  if (!isOpen || !policy) return null;

  const priorityMeta = PRIORITY_CONFIG[policy.priority];
  const maxEscalationMin = policy.escalation_threshold_minutes;

  // Preset buttons relevant to threshold
  const presets = [15, 30, 45, 60, 120, 240, 360, 720, 1440].filter(
    (val) => val < maxEscalationMin
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!minutes || minutes < 1) {
      setErrorMessage('The reminder threshold must be at least 1 minute.');
      return;
    }

    if (minutes >= maxEscalationMin) {
      setErrorMessage(
        `The reminder threshold (${minutes} mins) must be strictly less than the escalation threshold (${maxEscalationMin} mins / ${formatDuration(
          maxEscalationMin
        )}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await escalationPolicyService.updateReminderThreshold(
        policy.id,
        Number(minutes)
      );
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const responseData = apiErr.response?.data;
      if (responseData?.errors?.reminder_threshold_minutes) {
        setErrorMessage(responseData.errors.reminder_threshold_minutes[0]);
      } else {
        setErrorMessage(
          responseData?.message || 'Failed to update reminder threshold. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Adjust Reminder Threshold
              </h3>
              <p className="text-xs text-slate-500">
                Quick SLA update for <strong className="text-slate-800">{policy.priority}</strong> priority
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Current SLA Context Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Ticket Priority:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${priorityMeta.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priorityMeta.dotClass}`} />
                {policy.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Fixed Escalation SLA:</span>
              <span className="font-mono font-bold text-rose-700">
                {policy.escalation_threshold_minutes} mins ({formatDuration(maxEscalationMin)})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
              The reminder must fire <strong>before</strong> the {formatDuration(maxEscalationMin)}{' '}
              escalation mark so the assigned officer can respond in time.
            </p>
          </div>

          {/* Reminder Threshold Input */}
          <div className="space-y-1.5">
            <Input
              label="Reminder Threshold (in minutes)"
              type="number"
              min={1}
              max={maxEscalationMin - 1}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              helperText={`Human readable: ${formatDuration(minutes)}`}
              required
            />
          </div>

          {/* Quick Preset Buttons */}
          {presets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-700">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMinutes(val)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                      minutes === val
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {formatDuration(val)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
              Save Reminder Threshold
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickReminderModal;
