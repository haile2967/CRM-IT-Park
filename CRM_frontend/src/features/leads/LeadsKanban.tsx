import React from 'react';
import {
  Building2,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { LeadPriorityBadge } from './LeadBadges';
import type { Lead, LeadStatus } from '../../types/lead';

interface LeadsKanbanProps {
  columns: Record<LeadStatus, Lead[]>;
  isLoading: boolean;
  onSelectLead: (lead: Lead) => void;
  onAdvanceStatus: (lead: Lead, nextStatus: LeadStatus) => void;
  onConvertLead: (lead: Lead) => void;
}

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({
  columns,
  isLoading,
  onSelectLead,
  onAdvanceStatus,
  onConvertLead,
}) => {
  const columnConfigs: Array<{
    status: LeadStatus;
    title: string;
    nextStatus?: LeadStatus;
    headerBg: string;
    borderColor: string;
  }> = [
    {
      status: 'new',
      title: 'New Inbound',
      nextStatus: 'contacted',
      headerBg: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60',
      borderColor: 'border-blue-400',
    },
    {
      status: 'contacted',
      title: 'Contacted / Discovery',
      nextStatus: 'qualified',
      headerBg: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60',
      borderColor: 'border-purple-400',
    },
    {
      status: 'qualified',
      title: 'Park Qualified',
      nextStatus: 'converted',
      headerBg: 'bg-cyan-50 text-cyan-900 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/60',
      borderColor: 'border-cyan-400',
    },
    {
      status: 'converted',
      title: 'Converted Tenants',
      headerBg: 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60',
      borderColor: 'border-teal-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0f172a]/95 rounded-xl border border-slate-200 dark:border-slate-800/80 p-12 text-center text-xs text-slate-400 dark:text-slate-500 shadow-2xs">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading Kanban Pipeline...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columnConfigs.map((col) => {
        const items = columns[col.status] || [];

        return (
          <div
            key={col.status}
            className="rounded-xl bg-slate-100/70 dark:bg-[#0b1120]/90 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b flex items-center justify-between ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight">{col.title}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 dark:text-slate-200 font-bold border border-slate-200/50 dark:border-slate-700/60">
                  {items.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[300px]">
              {items.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No prospects in this stage
                </div>
              ) : (
                items.map((lead) => {
                  const isSlaBreached =
                    lead.status === 'new' &&
                    new Date().getTime() - new Date(lead.created_at).getTime() > 48 * 3600 * 1000;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2.5 group"
                    >
                      {/* Card Top: Badges */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                            {lead.lead_score}
                          </span>
                          <LeadPriorityBadge priority={lead.priority} size="sm" />
                        </div>

                        {isSlaBreached && (
                          <span
                            title="Uncontacted > 48 hours"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[9.5px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> SLA
                          </span>
                        )}
                      </div>

                      {/* Card Middle: Title & Org */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {lead.name}
                        </h4>
                        {lead.organization && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="truncate">{lead.organization}</span>
                          </div>
                        )}
                      </div>

                      {/* Specifications Preview */}
                      {(lead.estimated_space_sqm || lead.category) && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[120px]">
                            {lead.category?.category_name || 'General Tech'}
                          </span>
                          {lead.estimated_space_sqm && (
                            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                              {lead.estimated_space_sqm} m²
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer: Owner & Advance Trigger */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 min-w-0">
                          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0">
                            <User className="w-2.5 h-2.5" />
                          </div>
                          <span className="truncate text-[10px]">
                            {lead.owner ? lead.owner.first_name : 'Unassigned'}
                          </span>
                        </div>

                        {/* Stage Progression Buttons */}
                        {col.status === 'qualified' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvertLead(lead);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:bg-cyan-500 dark:hover:bg-cyan-400 shadow-2xs transition-colors"
                          >
                            <span>Convert</span>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </button>
                        ) : col.nextStatus ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdvanceStatus(lead, col.nextStatus!);
                            }}
                            title={`Advance to ${col.nextStatus}`}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 px-1.5 py-0.5 rounded-md transition-colors"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadsKanban;
