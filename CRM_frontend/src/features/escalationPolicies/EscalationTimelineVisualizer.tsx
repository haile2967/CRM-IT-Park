import React from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Plus,
  Edit3,
  Sliders,
  Calendar,
  Briefcase,
} from 'lucide-react';
import {
  ALL_PRIORITIES,
  PRIORITY_CONFIG,
  formatDuration,
} from './escalationUtils';
import type { EscalationPolicy, TicketPriority } from '../../types/escalationPolicy';

interface EscalationTimelineVisualizerProps {
  policies: EscalationPolicy[];
  selectedPriority?: TicketPriority | null;
  onSelectPriority: (priority: TicketPriority) => void;
  onQuickAdjustReminder: (policy: EscalationPolicy) => void;
  onEditPolicy: (policy: EscalationPolicy) => void;
  onCreatePolicyForPriority: (priority: TicketPriority) => void;
  canManage?: boolean;
}

export const EscalationTimelineVisualizer: React.FC<
  EscalationTimelineVisualizerProps
> = ({
  policies,
  selectedPriority,
  onSelectPriority,
  onQuickAdjustReminder,
  onEditPolicy,
  onCreatePolicyForPriority,
  canManage = true,
}) => {
  const policyByPriority = new Map<TicketPriority, EscalationPolicy>();
  policies.forEach((p) => {
    policyByPriority.set(p.priority, p);
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              SLA Priority Escalation Matrix
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {policies.length} of {ALL_PRIORITIES.length} Configured
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Automated reminder warnings trigger first, followed by formal supervisor escalation if unresolved.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
            <span>Reminder Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
            <span>Escalation Milestone</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Priority SLA Visualizer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_PRIORITIES.map((priority) => {
          const config = PRIORITY_CONFIG[priority];
          const policy = policyByPriority.get(priority);
          const isSelected = selectedPriority === priority;

          if (!policy) {
            // Unconfigured priority state card
            return (
              <div
                key={priority}
                onClick={() => onSelectPriority(priority)}
                className={`p-4 rounded-xl border border-dashed transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${config.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClass}`} />
                      {priority}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Not Configured
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {config.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  {canManage ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreatePolicyForPriority(priority);
                      }}
                      className="w-full py-1.5 px-2.5 text-xs font-medium text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Configure SLA
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic text-center py-1">
                      No policy configured
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Ratio calculation for visual bar
          const reminderMin = policy.reminder_threshold_minutes;
          const escalationMin = policy.escalation_threshold_minutes;
          const reminderPercent = Math.min(
            100,
            Math.max(10, Math.round((reminderMin / escalationMin) * 100))
          );

          return (
            <div
              key={priority}
              onClick={() => onSelectPriority(priority)}
              className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-600/20 shadow-xs'
                  : policy.is_active
                  ? 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  : 'border-slate-200 bg-slate-50/70 opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Priority & Status header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClass}`} />
                    {priority}
                  </span>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      policy.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {policy.is_active ? 'Active SLA' : 'Disabled'}
                  </span>
                </div>

                {/* Milestone Threshold Indicators */}
                <div className="space-y-2 pt-1">
                  {/* Reminder milestone */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      Reminder:
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatDuration(policy.reminder_threshold_minutes)}
                    </span>
                  </div>

                  {/* Escalation milestone */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Escalation:
                    </span>
                    <span className="font-semibold text-rose-700 font-mono">
                      {formatDuration(policy.escalation_threshold_minutes)}
                    </span>
                  </div>

                  {/* Relative progression visual bar */}
                  <div className="pt-1.5">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative border border-slate-200/70">
                      {/* Reminder marker */}
                      <div
                        className="h-full bg-amber-400 absolute left-0 top-0 transition-all duration-300"
                        style={{ width: `${reminderPercent}%` }}
                        title={`Reminder triggers at ${reminderPercent}% of SLA window`}
                      />
                      {/* Escalation marker point */}
                      <div
                        className="w-1.5 h-full bg-rose-600 absolute right-0 top-0"
                        title="Supervisor Escalation Trigger"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>0m</span>
                      <span>Warning @ {reminderPercent}%</span>
                      <span>Max SLA</span>
                    </div>
                  </div>
                </div>

                {/* Time basis badge */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {policy.time_basis === 'business_hours' ? (
                    <>
                      <Briefcase className="w-3 h-3 text-cyan-600" />
                      <span>Business Hours Only (8:30 - 17:30)</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>Calendar 24/7 Clock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdjustReminder(policy);
                    }}
                    title="Quickly adjust reminder threshold"
                    className="py-1 px-2 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    Reminder
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPolicy(policy);
                    }}
                    title="Edit complete policy configuration"
                    className="py-1 px-2 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-slate-500" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscalationTimelineVisualizer;
