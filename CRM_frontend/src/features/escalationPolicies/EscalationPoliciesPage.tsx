import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Bell,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EscalationTimelineVisualizer from './EscalationTimelineVisualizer';
import EscalationPoliciesTable from './EscalationPoliciesTable';
import EscalationPolicyModal from './EscalationPolicyModal';
import QuickReminderModal from './QuickReminderModal';
import DeleteEscalationPolicyModal from './DeleteEscalationPolicyModal';
import escalationPolicyService from '../../services/escalationPolicyService';
import { useAuth } from '../../hooks/useAuth';
import {
  ALL_PRIORITIES,
  formatDuration,
} from './escalationUtils';
import type {
  EscalationPolicy,
  TicketPriority,
} from '../../types/escalationPolicy';

export const EscalationPoliciesPage: React.FC = () => {
  const { user } = useAuth();

  const [policies, setPolicies] = useState<EscalationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeBasisFilter, setTimeBasisFilter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | null>(null);

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<EscalationPolicy | null>(null);
  const [initialPriorityForCreate, setInitialPriorityForCreate] = useState<TicketPriority | null>(null);

  const [isQuickReminderOpen, setIsQuickReminderOpen] = useState(false);
  const [policyForQuickReminder, setPolicyForQuickReminder] = useState<EscalationPolicy | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<EscalationPolicy | null>(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const roleName = user?.role?.role_name?.toLowerCase() || '';
    return roleName.includes('admin');
  }, [user]);

  // Fetch policies from backend API
  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await escalationPolicyService.getPolicies();
      // Ensure ordered by priority priority order or id
      setPolicies(data);
    } catch (err: unknown) {
      console.error('Failed to load escalation policies:', err);
      setErrorMessage(
        'Failed to load escalation policies. Please check your connection to the server or authentication privileges.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Configured priorities list
  const configuredPriorities = useMemo(() => {
    return policies.map((p) => p.priority);
  }, [policies]);

  const canCreateMore = configuredPriorities.length < ALL_PRIORITIES.length;

  // Filtered policies list
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesPriority = policy.priority.toLowerCase().includes(query);
        const matchesUser = policy.created_by?.name?.toLowerCase().includes(query);
        if (!matchesPriority && !matchesUser) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && policy.priority !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && !policy.is_active) {
        return false;
      }
      if (statusFilter === 'inactive' && policy.is_active) {
        return false;
      }

      // Time basis filter
      if (timeBasisFilter !== 'all' && policy.time_basis !== timeBasisFilter) {
        return false;
      }

      return true;
    });
  }, [policies, searchTerm, priorityFilter, statusFilter, timeBasisFilter]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const total = policies.length;
    const active = policies.filter((p) => p.is_active).length;
    const calendarCount = policies.filter((p) => p.time_basis === 'calendar').length;
    const businessHoursCount = policies.filter((p) => p.time_basis === 'business_hours').length;

    // Urgent policy or shortest reminder
    const urgentPolicy = policies.find((p) => p.priority === 'Urgent');
    const fastestReminder = urgentPolicy
      ? formatDuration(urgentPolicy.reminder_threshold_minutes)
      : policies.length > 0
      ? formatDuration(Math.min(...policies.map((p) => p.reminder_threshold_minutes)))
      : 'N/A';

    return {
      total,
      active,
      calendarCount,
      businessHoursCount,
      fastestReminder,
    };
  }, [policies]);

  // Handle policy saved
  const handlePolicySaved = (savedPolicy: EscalationPolicy) => {
    setPolicies((prev) => {
      const exists = prev.some((p) => p.id === savedPolicy.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPolicy.id ? savedPolicy : p));
      }
      return [...prev, savedPolicy];
    });

    setSuccessMessage(
      `Escalation policy for priority "${savedPolicy.priority}" ${
        policyToEdit ? 'updated' : 'configured'
      } successfully.`
    );
  };

  // Handle policy deleted
  const handlePolicyDeleted = (deletedId: number) => {
    const policy = policies.find((p) => p.id === deletedId);
    setPolicies((prev) => prev.filter((p) => p.id !== deletedId));
    setSuccessMessage(
      `Escalation policy for priority "${policy?.priority || ''}" deleted successfully.`
    );
  };

  // Handle quick reminder updated
  const handleReminderUpdated = (updatedPolicy: EscalationPolicy) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
    );
    setSuccessMessage(
      `Reminder threshold for priority "${updatedPolicy.priority}" updated to ${formatDuration(
        updatedPolicy.reminder_threshold_minutes
      )} (${updatedPolicy.reminder_threshold_minutes} mins).`
    );
  };

  // Handle active status toggle
  const handleToggleStatus = async (policy: EscalationPolicy) => {
    if (!isAdmin) return;

    const nextStatus = !policy.is_active;
    const originalPolicies = [...policies];

    // Optimistic UI update
    setPolicies((prev) =>
      prev.map((p) => (p.id === policy.id ? { ...p, is_active: nextStatus } : p))
    );

    try {
      const updated = await escalationPolicyService.toggleStatus(policy.id, nextStatus);
      setPolicies((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setSuccessMessage(
        `Escalation policy for priority "${policy.priority}" ${
          nextStatus ? 'activated' : 'deactivated'
        } successfully.`
      );
    } catch (err: unknown) {
      // Revert optimistic update
      setPolicies(originalPolicies);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiErr.response?.data?.message || 'Failed to toggle policy status. Please try again.'
      );
    }
  };

  // Modals triggers
  const handleOpenCreateModal = (specificPriority?: TicketPriority) => {
    setPolicyToEdit(null);
    setInitialPriorityForCreate(specificPriority || null);
    setIsPolicyModalOpen(true);
  };

  const handleOpenEditModal = (policy: EscalationPolicy) => {
    setPolicyToEdit(policy);
    setInitialPriorityForCreate(null);
    setIsPolicyModalOpen(true);
  };

  const handleOpenQuickReminderModal = (policy: EscalationPolicy) => {
    setPolicyForQuickReminder(policy);
    setIsQuickReminderOpen(true);
  };

  const handleOpenDeleteModal = (policy: EscalationPolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  return (
    <AppShell
      title="Escalation Policies"
      subtitle="Support & Operations — SLA Milestones, Reminder Thresholds & Automated Escalation Rules"
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Top Header Banner & Action Bar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Ticket Priority SLA & Escalation Governance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
                {metrics.active} of {metrics.total} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Define response SLA boundaries and automated reminder thresholds per ticket severity tier. Reminders alert assigned officers before mandatory escalation to department supervisors.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPolicies}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenCreateModal()}
                disabled={!canCreateMore}
                title={
                  !canCreateMore
                    ? 'All 4 ticket priority tiers are already configured'
                    : 'Configure SLA for an unassigned priority tier'
                }
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Configure Escalation Policy
              </Button>
            )}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Configured Priority Tiers */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Configured Tiers</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {metrics.total} / {ALL_PRIORITIES.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Urgent, High, Med, Low
            </span>
          </div>

          {/* Active SLA Policies */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Enforcement</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
              {metrics.active} Active
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Live automated alerts
            </span>
          </div>

          {/* Fastest Warning Threshold */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Fastest Warning</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900 font-mono">
              {metrics.fastestReminder}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Critical ticket SLA trigger
            </span>
          </div>

          {/* Time Basis Distribution */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Clock Model</span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-900 font-mono">
              {metrics.businessHoursCount} Biz / {metrics.calendarCount} 24/7
            </div>
            <span className="text-[11px] text-sky-700 font-medium mt-0.5 block">
              Operating hours calculation
            </span>
          </div>
        </div>

        {/* SLA Priority Escalation Matrix / Visualizer */}
        <EscalationTimelineVisualizer
          policies={policies}
          selectedPriority={selectedPriority}
          onSelectPriority={(p) => setSelectedPriority((prev) => (prev === p ? null : p))}
          onQuickAdjustReminder={handleOpenQuickReminderModal}
          onEditPolicy={handleOpenEditModal}
          onCreatePolicyForPriority={(p) => handleOpenCreateModal(p)}
          canManage={isAdmin}
        />

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search priority or author..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Filters:</span>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            >
              <option value="all">All Priorities</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>

            {/* Time Basis Filter */}
            <select
              value={timeBasisFilter}
              onChange={(e) => setTimeBasisFilter(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            >
              <option value="all">All Clock Models</option>
              <option value="business_hours">Business Hours (8:30-17:30)</option>
              <option value="calendar">Calendar 24/7</option>
            </select>

            {(searchTerm ||
              priorityFilter !== 'all' ||
              statusFilter !== 'all' ||
              timeBasisFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setTimeBasisFilter('all');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Policies Table */}
        <EscalationPoliciesTable
          policies={filteredPolicies}
          isLoading={isLoading}
          selectedPriority={selectedPriority}
          onEdit={handleOpenEditModal}
          onQuickAdjustReminder={handleOpenQuickReminderModal}
          onDelete={handleOpenDeleteModal}
          onToggleStatus={handleToggleStatus}
          canManage={isAdmin}
        />

        {/* Non-admin notice */}
        {!isAdmin && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Configuring escalation policies, updating reminder thresholds, and toggling active SLA enforcement are restricted to users with the{' '}
              <strong className="text-slate-800">System Administrator</strong> role.
            </span>
          </div>
        )}

        {/* Modal: Create or Edit Policy */}
        <EscalationPolicyModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          policyToEdit={policyToEdit}
          configuredPriorities={configuredPriorities}
          initialPriority={initialPriorityForCreate}
          onSaved={handlePolicySaved}
        />

        {/* Modal: Quick Adjust Reminder Threshold */}
        <QuickReminderModal
          isOpen={isQuickReminderOpen}
          onClose={() => setIsQuickReminderOpen(false)}
          policy={policyForQuickReminder}
          onUpdated={handleReminderUpdated}
        />

        {/* Modal: Delete Policy with Data Integrity Safeguards */}
        <DeleteEscalationPolicyModal
          isOpen={isDeleteModalOpen}
          policy={policyToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handlePolicyDeleted}
          onDeactivated={(updated) => {
            setPolicies((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSuccessMessage(
              `Escalation policy for priority "${updated.priority}" deactivated successfully.`
            );
          }}
        />
      </div>
    </AppShell>
  );
};

export default EscalationPoliciesPage;
