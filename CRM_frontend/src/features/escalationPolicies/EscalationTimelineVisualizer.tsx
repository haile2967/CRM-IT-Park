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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              SLA Priority Escalation Matrix
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {policies.length} of {ALL_PRIORITIES.length} Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated reminder warnings trigger first, followed by formal supervisor escalation if unresolved.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/50" />
            <span>Reminder Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/50" />
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
                    ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/20 shadow-xs'
                    : 'border-slate-200/90 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b1120]/50 hover:bg-slate-50 dark:hover:bg-[#0b1120] hover:border-slate-300 dark:hover:border-slate-700'
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
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Not Configured
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">
                    {config.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  {canManage ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreatePolicyForPriority(priority);
                      }}
                      className="w-full py-1.5 px-2.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50/70 dark:bg-cyan-950/40 hover:bg-cyan-100/70 dark:hover:bg-cyan-900/60 border border-cyan-200/80 dark:border-cyan-800/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Configure SLA
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center py-1">
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
                  ? 'border-cyan-600 bg-cyan-50/20 dark:bg-cyan-950/20 ring-2 ring-cyan-600/20 shadow-xs'
                  : policy.is_active
                  ? 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b1120] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b1120]/40 opacity-80'
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
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {policy.is_active ? 'Active SLA' : 'Disabled'}
                  </span>
                </div>

                {/* Milestone Threshold Indicators */}
                <div className="space-y-2 pt-1">
                  {/* Reminder milestone */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      Reminder:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {formatDuration(policy.reminder_threshold_minutes)}
                    </span>
                  </div>

                  {/* Escalation milestone */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Escalation:
                    </span>
                    <span className="font-semibold text-rose-700 dark:text-rose-400 font-mono">
                      {formatDuration(policy.escalation_threshold_minutes)}
                    </span>
                  </div>

                  {/* Relative progression visual bar */}
                  <div className="pt-1.5">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200/70 dark:border-slate-700/80">
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
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      <span>0m</span>
                      <span>Warning @ {reminderPercent}%</span>
                      <span>Max SLA</span>
                    </div>
                  </div>
                </div>

                {/* Time basis badge */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                  {policy.time_basis === 'business_hours' ? (
                    <>
                      <Briefcase className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      <span>Business Hours Only (8:30 - 17:30)</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Calendar 24/7 Clock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdjustReminder(policy);
                    }}
                    title="Quickly adjust reminder threshold"
                    className="py-1 px-2 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
                    className="py-1 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
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
