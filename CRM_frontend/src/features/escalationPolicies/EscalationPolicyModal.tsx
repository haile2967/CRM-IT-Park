import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Bell,
  AlertTriangle,
  Check,
  Calendar,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import escalationPolicyService from '../../services/escalationPolicyService';
import {
  ALL_PRIORITIES,
  PRIORITY_CONFIG,
  formatDuration,
} from './escalationUtils';
import type {
  EscalationPolicy,
  TicketPriority,
  TimeBasis,
} from '../../types/escalationPolicy';

interface EscalationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyToEdit?: EscalationPolicy | null;
  configuredPriorities: TicketPriority[];
  initialPriority?: TicketPriority | null;
  onSaved: (policy: EscalationPolicy) => void;
}

export const EscalationPolicyModal: React.FC<EscalationPolicyModalProps> = ({
  isOpen,
  onClose,
  policyToEdit,
  configuredPriorities,
  initialPriority,
  onSaved,
}) => {
  const isEditing = Boolean(policyToEdit);

  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [reminderMinutes, setReminderMinutes] = useState<number>(720);
  const [escalationMinutes, setEscalationMinutes] = useState<number>(1440);
  const [timeBasis, setTimeBasis] = useState<TimeBasis>('business_hours');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (policyToEdit) {
      setPriority(policyToEdit.priority);
      setReminderMinutes(policyToEdit.reminder_threshold_minutes);
      setEscalationMinutes(policyToEdit.escalation_threshold_minutes);
      setTimeBasis(policyToEdit.time_basis || 'business_hours');
      setIsActive(policyToEdit.is_active ?? true);
      setErrorMessage(null);
    } else {
      // Pick first unconfigured priority or initial priority
      const defaultP =
        initialPriority ||
        ALL_PRIORITIES.find((p) => !configuredPriorities.includes(p)) ||
        'Medium';
      const config = PRIORITY_CONFIG[defaultP];

      setPriority(defaultP);
      setReminderMinutes(config.defaultReminder);
      setEscalationMinutes(config.defaultEscalation);
      setTimeBasis('business_hours');
      setIsActive(true);
      setErrorMessage(null);
    }
  }, [policyToEdit, isOpen, configuredPriorities, initialPriority]);

  if (!isOpen) return null;

  // Handle changing priority in create mode - auto load preset
  const handlePriorityChange = (newPriority: TicketPriority) => {
    setPriority(newPriority);
    if (!isEditing) {
      const config = PRIORITY_CONFIG[newPriority];
      setReminderMinutes(config.defaultReminder);
      setEscalationMinutes(config.defaultEscalation);
    }
  };

  const handleApplyPreset = (p: TicketPriority) => {
    const config = PRIORITY_CONFIG[p];
    setReminderMinutes(config.defaultReminder);
    setEscalationMinutes(config.defaultEscalation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reminderMinutes || reminderMinutes < 1) {
      setErrorMessage('The reminder threshold must be at least 1 minute.');
      return;
    }

    if (!escalationMinutes || escalationMinutes < 2) {
      setErrorMessage('The escalation threshold must be at least 2 minutes.');
      return;
    }

    if (reminderMinutes >= escalationMinutes) {
      setErrorMessage(
        `The reminder threshold (${reminderMinutes} mins) must be strictly less than the escalation threshold (${escalationMinutes} mins).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && policyToEdit) {
        const updated = await escalationPolicyService.updatePolicy(policyToEdit.id, {
          priority,
          reminder_threshold_minutes: Number(reminderMinutes),
          escalation_threshold_minutes: Number(escalationMinutes),
          time_basis: timeBasis,
          is_active: isActive,
        });
        onSaved(updated);
        onClose();
      } else {
        const created = await escalationPolicyService.createPolicy({
          priority,
          reminder_threshold_minutes: Number(reminderMinutes),
          escalation_threshold_minutes: Number(escalationMinutes),
          time_basis: timeBasis,
          is_active: isActive,
        });
        onSaved(created);
        onClose();
      }
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const responseData = apiErr.response?.data;
      if (responseData?.errors) {
        const firstKey = Object.keys(responseData.errors)[0];
        setErrorMessage(responseData.errors[firstKey][0]);
      } else {
        setErrorMessage(
          responseData?.message || 'Failed to save escalation policy. Please check input values.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPriorityMeta = PRIORITY_CONFIG[priority];
  const isInvalidThreshold = reminderMinutes >= escalationMinutes;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isEditing ? `Edit Escalation Policy: ${priority}` : 'Configure New Escalation Policy'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update reminder and supervisor escalation thresholds'
                  : 'Define automatic SLA alert milestones for tickets'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Ticket Priority Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Ticket Priority Tier <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              disabled={isEditing}
              onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {ALL_PRIORITIES.map((p) => {
                const isAlreadyConfigured =
                  !isEditing && configuredPriorities.includes(p);
                return (
                  <option
                    key={p}
                    value={p}
                    disabled={isAlreadyConfigured}
                  >
                    {p} Priority {isAlreadyConfigured ? '(Already Configured)' : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-500">
              {currentPriorityMeta.description}
            </p>
          </div>

          {/* Presets Button Bar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Standard Preset:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset(priority)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
            >
              Reset to Recommended ({formatDuration(currentPriorityMeta.defaultReminder)} / {formatDuration(currentPriorityMeta.defaultEscalation)})
            </button>
          </div>

          {/* Threshold Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reminder Threshold */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <label className="text-xs font-medium text-slate-700">
                  Reminder Threshold <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                min={1}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                required
              />
              <span className="text-[11px] font-mono text-amber-700 font-medium block">
                Duration: {formatDuration(reminderMinutes)}
              </span>
            </div>

            {/* Escalation Threshold */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <label className="text-xs font-medium text-slate-700">
                  Escalation Threshold <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                min={2}
                value={escalationMinutes}
                onChange={(e) => setEscalationMinutes(Math.max(2, parseInt(e.target.value) || 2))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                required
              />
              <span className="text-[11px] font-mono text-rose-700 font-medium block">
                Duration: {formatDuration(escalationMinutes)}
              </span>
            </div>
          </div>

          {/* Real-time Validation Error Banner */}
          {isInvalidThreshold && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Reminder threshold (<strong>{formatDuration(reminderMinutes)}</strong>) must be strictly less than escalation threshold (<strong>{formatDuration(escalationMinutes)}</strong>).
              </span>
            </div>
          )}

          {/* Time Basis Radio Selection */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-slate-700">
              Calculation Time Basis
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                  timeBasis === 'business_hours'
                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="time_basis"
                  value="business_hours"
                  checked={timeBasis === 'business_hours'}
                  onChange={() => setTimeBasis('business_hours')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
                    Business Hours
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ethiopian IT Park working hours only (8:30 - 17:30, excluding weekends & public holidays).
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                  timeBasis === 'calendar'
                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="time_basis"
                  value="calendar"
                  checked={timeBasis === 'calendar'}
                  onChange={() => setTimeBasis('calendar')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Calendar Time (24/7)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Continuous absolute clock elapsed 24/7/365. Ideal for Critical / Urgent tenant outages.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Activate policy immediately for all future tickets of this priority
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              disabled={isInvalidThreshold}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isEditing ? 'Save Policy Changes' : 'Create Escalation Policy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscalationPolicyModal;
