import React from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  ShieldAlert,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import type { Ticket } from '../../types/ticket';
import { PriorityBadge, StatusBadge, InactivityBadge } from './TicketStatusBadge';

interface TicketsTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  onSelectTicket: (ticket: Ticket) => void;
  onClaimTicket: (ticket: Ticket) => void;
  onEscalateTicket?: (ticket: Ticket) => void;
  onDeleteTicket?: (ticket: Ticket) => void;
  currentPage: number;
  lastPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  isLoading,
  onSelectTicket,
  onClaimTicket,
  onEscalateTicket,
  currentPage,
  lastPage,
  totalRecords,
  onPageChange,
}) => {
  const { can } = usePermission();
  const canAssign = can('tickets.assign');
  const canEscalate = can('tickets.escalate');
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 p-8 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading support queue records...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No tickets found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No support tickets match the active queue filter or search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Ticket</th>
              <th className="py-3.5 px-4">Organization / Client</th>
              <th className="py-3.5 px-4">Priority & Status</th>
              <th className="py-3.5 px-4">SLA / Inactivity</th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {tickets.map((ticket) => {
              const isUrgentOrEscalated = ticket.priority === 'Urgent' || ticket.escalated;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className={`group cursor-pointer transition-colors ${
                    isUrgentOrEscalated
                      ? 'hover:bg-rose-50/70 dark:hover:bg-rose-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Ticket # and Subject */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 whitespace-nowrap shrink-0">
                          {ticket.ticket_number}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {ticket.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ticket.category?.category_name || 'General Support'}
                      </div>
                    </div>
                  </td>

                  {/* Organization & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{ticket.account?.organization_name || 'Direct Tenant'}</span>
                      </div>
                      {ticket.contact && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {ticket.contact.first_name} {ticket.contact.last_name}
                          {ticket.contact.role_title ? ` · ${ticket.contact.role_title}` : ''}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Priority & Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>
                  </td>

                  {/* SLA / Inactivity */}
                  <td className="py-3.5 px-4">
                    <InactivityBadge
                      state={ticket.inactivity_state}
                      elapsedMinutes={ticket.elapsed_inactivity_minutes}
                      isEscalated={ticket.escalated}
                    />
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] flex items-center justify-center border border-cyan-200 dark:border-cyan-700/50">
                          {ticket.assignee.first_name?.[0] || 'U'}
                          {ticket.assignee.last_name?.[0] || ''}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {ticket.assignee.first_name} {ticket.assignee.last_name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          Unassigned
                        </span>
                        {canAssign && (
                          <button
                            type="button"
                            onClick={() => onClaimTicket(ticket)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-xs"
                            title="Claim this ticket to your queue"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Claim</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectTicket(ticket)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View details & conversation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canEscalate && !ticket.escalated && ticket.status !== 'resolved' && ticket.status !== 'closed' && onEscalateTicket && (
                        <button
                          type="button"
                          onClick={() => onEscalateTicket(ticket)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Escalate ticket"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{tickets.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalRecords}</span> tickets
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-medium">
              Page {currentPage} of {Math.max(1, lastPage)}
            </span>

            <button
              type="button"
              disabled={currentPage >= lastPage}
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
