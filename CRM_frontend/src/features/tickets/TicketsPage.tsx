import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Headphones,
  LifeBuoy,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
} from 'lucide-react';
import type {
  Ticket,
  TicketCategory,
  TicketCounts,
  TicketMetrics,
  TicketPriority,
  TicketQueue,
  TicketStatus,
} from '../../types/ticket';
import { ticketService } from '../../services/ticketService';
import { TicketsTable } from './TicketsTable';
import { TicketDrawer } from './TicketDrawer';
import { TicketModal } from './TicketModal';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import AppShell from '../../components/layout/AppShell';

export const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermission();
  const canCreateTicket = can('tickets.create');

  // Data State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null);
  const [counts, setCounts] = useState<TicketCounts>({ all: 0, my_assigned: 0, unassigned: 0, escalated: 0 });
  const [categories, setCategories] = useState<TicketCategory[]>([]);

  // Queue Tab & Filters
  const [activeQueue, setActiveQueue] = useState<TicketQueue>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'all'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drawer & Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);

  // Load Categories Dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catRes = await ticketService.getCategories();
        setCategories(catRes);
      } catch (err) {
        console.error('Failed to load ticket categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Tickets & Operational Metrics
  const fetchData = useCallback(
    async (showRefreshSpinner = false) => {
      if (showRefreshSpinner) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      try {
        const [ticketsRes, metricsRes] = await Promise.all([
          ticketService.getTickets({
            queue: activeQueue,
            category_id: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            search: searchTerm.trim() || undefined,
            page: currentPage,
            per_page: 15,
          }),
          ticketService.getMetrics(),
        ]);

        setTickets(ticketsRes.data);
        setCounts(ticketsRes.counts);
        setCurrentPage(ticketsRes.meta.current_page);
        setLastPage(ticketsRes.meta.last_page);
        setTotalRecords(ticketsRes.meta.total);
        setMetrics(metricsRes);
      } catch (err: any) {
        console.error('Failed to fetch tickets:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeQueue, selectedCategoryId, selectedPriority, selectedStatus, searchTerm, currentPage]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page to 1 when filters change
  const handleQueueChange = (queue: TicketQueue) => {
    setActiveQueue(queue);
    setCurrentPage(1);
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    try {
      const full = await ticketService.getTicket(ticket.id);
      setSelectedTicket(full);
    } catch {
      setSelectedTicket(ticket);
    }
    setIsDrawerOpen(true);
  };

  const handleClaimTicket = async (ticket: Ticket) => {
    try {
      const updated = await ticketService.claimTicket(ticket.id);
      setSuccessMessage(`Ticket "${updated.ticket_number}" assigned to your personal queue.`);
      fetchData();
      if (selectedTicket?.id === updated.id) {
        setSelectedTicket(updated);
      }
    } catch (err: any) {
      console.error('Failed to claim ticket:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to claim ticket.');
    }
  };

  const handleTicketUpdated = (updated: Ticket) => {
    setSuccessMessage(`Ticket "${updated.ticket_number}" updated successfully.`);
    fetchData();
    setSelectedTicket(updated);
  };

  const handleTicketSaved = (saved: Ticket) => {
    setSuccessMessage(`Ticket "${saved.ticket_number}" saved successfully.`);
    fetchData();
    setIsModalOpen(false);
  };

  return (
    <AppShell
      title="Support & Customer Service Tickets"
      subtitle="Ethiopian IT Park — Inactivity SLAs, Inquiries & Incident Escalations"
      fullWidth
    >
      <div className="space-y-6">
        {/* Top Header Banner & Action Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Support & Customer Service Tickets
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                የድጋፍ ጥያቄዎች
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Track tenant service inquiries, data center colocation issues, SLA inactivity thresholds, and managerial escalations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
            </button>

            {canCreateTicket && (
              <button
                type="button"
                onClick={() => {
                  setTicketToEdit(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>New Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 dark:text-rose-400 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {/* 4 Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Active Tickets */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Tickets</span>
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                <Headphones className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
              {metrics?.total_active ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                {metrics?.urgent_high_count ?? 0}
              </span>
              <span>urgent / high priority</span>
            </div>
          </div>

          {/* Unassigned Shared Queue */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Unassigned Queue</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
              {metrics?.unassigned_count ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Awaiting agent claim</span>
            </div>
          </div>

          {/* SLA Escalations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Escalated Tickets</span>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono flex items-center gap-2">
              <span>{metrics?.escalated_count ?? 0}</span>
              {(metrics?.escalated_count ?? 0) > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Managerial threshold breached</span>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Resolution Time</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
              {metrics?.avg_resolution_hours ? `${metrics.avg_resolution_hours} hrs` : 'N/A'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>From ticket creation to resolution</span>
            </div>
          </div>
        </div>

        {/* 4 Queue Tabs & Multi-attribute Filters Bar */}
        <div className="space-y-4">
          {/* Queue Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleQueueChange('all')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeQueue === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>All Tickets</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeQueue === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQueueChange('my_assigned')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeQueue === 'my_assigned'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Assigned</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeQueue === 'my_assigned'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {counts.my_assigned}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQueueChange('unassigned')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeQueue === 'unassigned'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Unassigned Shared Queue</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeQueue === 'unassigned'
                    ? 'bg-white/25 text-white'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {counts.unassigned}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQueueChange('escalated')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeQueue === 'escalated'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalated SLA</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeQueue === 'escalated'
                    ? 'bg-white/25 text-white'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                }`}
              >
                {counts.escalated}
              </span>
            </button>
          </div>

          {/* Search & Dropdown Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ticket # (TICK-00001), subject, client company, contact..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value as TicketPriority | 'all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as TicketStatus | 'all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <TicketsTable
          tickets={tickets}
          isLoading={isLoading}
          onSelectTicket={handleSelectTicket}
          onClaimTicket={handleClaimTicket}
          onEscalateTicket={(t) => {
            setSelectedTicket(t);
            setIsDrawerOpen(true);
          }}
          currentPage={currentPage}
          lastPage={lastPage}
          totalRecords={totalRecords}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {/* Slide-over Ticket Drawer */}
        <TicketDrawer
          ticket={selectedTicket}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onTicketUpdated={handleTicketUpdated}
          currentUserId={user?.id}
        />

        {/* Ticket Create / Edit Modal */}
        <TicketModal
          isOpen={isModalOpen}
          ticketToEdit={ticketToEdit}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleTicketSaved}
        />
      </div>
    </AppShell>
  );
};

export default TicketsPage;
