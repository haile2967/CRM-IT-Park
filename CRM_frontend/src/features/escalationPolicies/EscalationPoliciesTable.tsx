import React from 'react';
import {
  Clock,
  Bell,
  AlertTriangle,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Sliders,
  Calendar,
  Briefcase,
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  TIME_BASIS_CONFIG,
  formatDuration,
} from './escalationUtils';
import type { EscalationPolicy, TicketPriority } from '../../types/escalationPolicy';

interface EscalationPoliciesTableProps {
  policies: EscalationPolicy[];
  isLoading: boolean;
  selectedPriority?: TicketPriority | null;
  onEdit: (policy: EscalationPolicy) => void;
  onQuickAdjustReminder: (policy: EscalationPolicy) => void;
  onDelete: (policy: EscalationPolicy) => void;
  onToggleStatus: (policy: EscalationPolicy) => void;
  canManage?: boolean;
}

export const EscalationPoliciesTable: React.FC<EscalationPoliciesTableProps> = ({
  policies,
  isLoading,
  selectedPriority,
  onEdit,
  onQuickAdjustReminder,
  onDelete,
  onToggleStatus,
  canManage = true,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-100 rounded-md" />
                  <div className="h-3 w-48 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-28 bg-slate-100 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white shadow-2xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          No Escalation Policies Configured
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Configure SLA thresholds and automated ticket reminder rules for Urgent, High, Medium, and Low priorities.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              <th className="py-3.5 pl-6 pr-3">Ticket Priority</th>
              <th className="py-3.5 px-3">Reminder Threshold</th>
              <th className="py-3.5 px-3">Escalation SLA</th>
              <th className="py-3.5 px-3">Time Basis</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Configured By</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {policies.map((policy) => {
              const config = PRIORITY_CONFIG[policy.priority];
              const isSelected = selectedPriority === policy.priority;
              const timeBasisConfig = TIME_BASIS_CONFIG[policy.time_basis || 'calendar'];

              return (
                <tr
                  key={policy.id}
                  className={`transition-colors duration-100 ${
                    isSelected
                      ? 'bg-emerald-50/40'
                      : policy.is_active
                      ? 'hover:bg-slate-50/80'
                      : 'bg-slate-50/40 hover:bg-slate-50 text-slate-400'
                  }`}
                >
                  {/* Priority Tier */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClass}`} />
                        {policy.priority}
                      </span>
                      <p className="text-[11px] text-slate-500 max-w-xs truncate">
                        {config.description}
                      </p>
                    </div>
                  </td>

                  {/* Reminder Threshold with Quick Edit shortcut */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 font-mono">
                          {formatDuration(policy.reminder_threshold_minutes)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {policy.reminder_threshold_minutes} mins
                        </span>
                      </div>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onQuickAdjustReminder(policy)}
                          title="Quickly adjust reminder threshold"
                          className="ml-1 p-1 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Escalation SLA */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-rose-700 font-mono">
                          {formatDuration(policy.escalation_threshold_minutes)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {policy.escalation_threshold_minutes} mins
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Time Basis */}
                  <td className="py-4 px-3">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${timeBasisConfig.badge}`}
                      >
                        {policy.time_basis === 'business_hours' ? (
                          <Briefcase className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        {policy.time_basis === 'business_hours'
                          ? 'Business Hours'
                          : 'Calendar 24/7'}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {policy.time_basis === 'business_hours'
                          ? '8:30 - 17:30 ET'
                          : 'Continuous SLA'}
                      </p>
                    </div>
                  </td>

                  {/* Active / Paused Status Toggle */}
                  <td className="py-4 px-3">
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(policy)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          policy.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                        }`}
                        title={
                          policy.is_active
                            ? 'Click to pause this escalation policy'
                            : 'Click to activate this escalation policy'
                        }
                      >
                        {policy.is_active ? (
                          <>
                            <Power className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-3 h-3 text-slate-400" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          policy.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {policy.is_active ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </td>

                  {/* Configured By */}
                  <td className="py-4 px-3">
                    {policy.created_by ? (
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block truncate max-w-[130px]">
                          {policy.created_by.name || 'System Admin'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                          {policy.created_by.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">System Default</span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickAdjustReminder(policy)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Adjust reminder threshold"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEdit(policy)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit escalation policy"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(policy)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete escalation policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscalationPoliciesTable;
