import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Trophy,
  CheckCircle2,
  Briefcase,
  AlertTriangle,
  ArrowUpDown,
  ShieldAlert,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import PipelineStagesTable from './PipelineStagesTable';
import PipelineStagesVisualizer from './PipelineStagesVisualizer';
import PipelineStageModal from './PipelineStageModal';
import DeleteStageModal from './DeleteStageModal';
import pipelineStageService from '../../services/pipelineStageService';
import { useAuth } from '../../hooks/useAuth';
import type { PipelineStage } from '../../types/pipelineStage';

export const PipelineStagesPage: React.FC = () => {
  const { user } = useAuth();

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedVisualStageId, setSelectedVisualStageId] = useState<number | null>(null);

  // Modals state
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageToEdit, setStageToEdit] = useState<PipelineStage | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<PipelineStage | null>(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const roleName = user?.role?.role_name?.toLowerCase() || '';
    return roleName.includes('admin');
  }, [user]);

  // Fetch stages from backend API
  const fetchStages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await pipelineStageService.getStages();
      // Ensure sorted by display_order
      const sorted = [...data].sort((a, b) => a.display_order - b.display_order);
      setStages(sorted);
    } catch (err: unknown) {
      console.error('Failed to load pipeline stages:', err);
      setErrorMessage('Failed to load pipeline stages. Please check your connection to the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  // Filtered stages
  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        if (!stage.stage_name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filter by type
      if (filterType === 'active') {
        if (!stage.is_active) return false;
      } else if (filterType === 'inactive') {
        if (stage.is_active) return false;
      } else if (filterType === 'terminal') {
        if (!stage.is_closed_won && !stage.is_closed_lost) return false;
      } else if (filterType === 'standard') {
        if (stage.is_closed_won || stage.is_closed_lost) return false;
      }

      return true;
    });
  }, [stages, searchTerm, filterType]);

  // Next available display order for creating a new stage
  const nextDisplayOrder = useMemo(() => {
    if (stages.length === 0) return 1;
    return Math.max(...stages.map((s) => s.display_order)) + 1;
  }, [stages]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = stages.length;
    const active = stages.filter((s) => s.is_active).length;
    const wonCount = stages.filter((s) => s.is_closed_won).length;
    const lostCount = stages.filter((s) => s.is_closed_lost).length;
    const totalOpportunities = stages.reduce(
      (sum, s) => sum + (s.opportunities_count ?? 0),
      0
    );

    return {
      total,
      active,
      wonCount,
      lostCount,
      terminalCount: wonCount + lostCount,
      totalOpportunities,
    };
  }, [stages]);

  // Handle stage create/edit save
  const handleStageSaved = (savedStage: PipelineStage) => {
    setStages((prev) => {
      const exists = prev.some((s) => s.id === savedStage.id);
      let updated: PipelineStage[];
      if (exists) {
        updated = prev.map((s) =>
          s.id === savedStage.id
            ? {
                ...s,
                ...savedStage,
                opportunities_count: savedStage.opportunities_count ?? s.opportunities_count,
              }
            : s
        );
      } else {
        updated = [...prev, savedStage];
      }
      return updated.sort((a, b) => a.display_order - b.display_order);
    });

    setSuccessMessage(
      `Pipeline stage "${savedStage.stage_name}" ${
        stageToEdit ? 'updated' : 'created'
      } successfully.`
    );
  };

  // Handle stage deletion
  const handleStageDeleted = (deletedId: number) => {
    const stage = stages.find((s) => s.id === deletedId);
    setStages((prev) => prev.filter((s) => s.id !== deletedId));
    setSuccessMessage(`Pipeline stage "${stage?.stage_name || ''}" removed successfully.`);
  };

  // Handle active status toggle
  const handleToggleStatus = async (stage: PipelineStage) => {
    if (!isAdmin) return;

    const nextStatus = !stage.is_active;
    const originalStages = [...stages];

    // Optimistic UI update
    setStages((prev) =>
      prev.map((s) => (s.id === stage.id ? { ...s, is_active: nextStatus } : s))
    );

    try {
      const updated = await pipelineStageService.toggleStatus(stage.id, nextStatus);
      setStages((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? {
                ...s,
                ...updated,
                opportunities_count: updated.opportunities_count ?? s.opportunities_count,
              }
            : s
        )
      );
      setSuccessMessage(
        `Stage "${stage.stage_name}" ${nextStatus ? 'activated' : 'deactivated'} successfully.`
      );
    } catch (err: unknown) {
      // Revert optimistic update
      setStages(originalStages);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        apiErr.response?.data?.message || 'Failed to change stage status. Please try again.'
      );
    }
  };

  // Handle Move Up in display sequence
  const handleMoveUp = async (index: number) => {
    if (index <= 0 || !isAdmin || isReordering) return;

    const newStages = [...stages];
    const current = newStages[index];
    const previous = newStages[index - 1];

    // Swap display_orders
    const tempOrder = current.display_order;
    current.display_order = previous.display_order;
    previous.display_order = tempOrder;

    // Sort according to new order
    newStages.sort((a, b) => a.display_order - b.display_order);
    setStages(newStages);

    await persistReorder(newStages);
  };

  // Handle Move Down in display sequence
  const handleMoveDown = async (index: number) => {
    if (index >= stages.length - 1 || !isAdmin || isReordering) return;

    const newStages = [...stages];
    const current = newStages[index];
    const next = newStages[index + 1];

    // Swap display_orders
    const tempOrder = current.display_order;
    current.display_order = next.display_order;
    next.display_order = tempOrder;

    // Sort according to new order
    newStages.sort((a, b) => a.display_order - b.display_order);
    setStages(newStages);

    await persistReorder(newStages);
  };

  // Persist reorder to backend API
  const persistReorder = async (orderedList: PipelineStage[]) => {
    setIsReordering(true);
    try {
      const payload = orderedList.map((s, idx) => ({
        id: s.id,
        display_order: idx + 1,
      }));

      const updated = await pipelineStageService.reorderStages(payload);
      setStages(updated);
      setSuccessMessage('Pipeline stage sequence updated and saved.');
    } catch (err: unknown) {
      console.error('Failed to reorder stages:', err);
      setErrorMessage('Failed to save updated stage order. Reverting changes.');
      fetchStages();
    } finally {
      setIsReordering(false);
    }
  };

  const handleOpenCreateModal = () => {
    setStageToEdit(null);
    setIsStageModalOpen(true);
  };

  const handleOpenEditModal = (stage: PipelineStage) => {
    setStageToEdit(stage);
    setIsStageModalOpen(true);
  };

  const handleOpenDeleteModal = (stage: PipelineStage) => {
    setStageToDelete(stage);
    setIsDeleteModalOpen(true);
  };

  return (
    <AppShell
      title="Pipeline Stages"
      subtitle="Deals & Agreements Workflow, Milestone Sequence & Terminal Win/Loss States"
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
                Opportunity Pipeline Milestones
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
                {metrics.active} of {metrics.total} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Define the progression funnel for deals, corporate partnerships, and facility leases. Reorder stages to reflect the real-world deal flow.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStages}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Pipeline Stage
              </Button>
            )}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Configured Stages */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Stages</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Workflow milestones
            </span>
          </div>

          {/* Active Milestones */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Stages</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
              {metrics.active}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Live in opportunity forms
            </span>
          </div>

          {/* Terminal Stages (Won & Lost) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Terminal Outcomes</span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900 font-mono">
              {metrics.wonCount} Won / {metrics.lostCount} Lost
            </div>
            <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
              Contract completion states
            </span>
          </div>

          {/* Active Deals in Pipeline */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Opportunities</span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-800 font-mono">
              {metrics.totalOpportunities}
            </div>
            <span className="text-[11px] text-sky-600 font-medium mt-0.5 block">
              Across all pipeline stages
            </span>
          </div>
        </div>

        {/* Visual Deal Progression Flow */}
        <PipelineStagesVisualizer
          stages={stages}
          selectedStageId={selectedVisualStageId}
          onSelectStage={(id) => setSelectedVisualStageId(id)}
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
              placeholder="Search stage title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Filter:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            >
              <option value="all">All Stages</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Paused</option>
              <option value="standard">Standard Progression Only</option>
              <option value="terminal">Terminal Stages (Won / Lost)</option>
            </select>

            {(searchTerm || filterType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Stages Table */}
        <PipelineStagesTable
          stages={filteredStages}
          isLoading={isLoading}
          selectedStageId={selectedVisualStageId}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onToggleStatus={handleToggleStatus}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          isReordering={isReordering}
          canManage={isAdmin}
        />

        {/* Non-admin notice */}
        {!isAdmin && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Stage sequence reordering, creation, and deactivation are restricted to users with the{' '}
              <strong className="text-slate-800">System Administrator</strong> role.
            </span>
          </div>
        )}

        {/* Modal: Create or Edit Stage */}
        <PipelineStageModal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          stageToEdit={stageToEdit}
          onSaved={handleStageSaved}
          nextDisplayOrder={nextDisplayOrder}
        />

        {/* Modal: Delete Stage with Integrity Guard */}
        <DeleteStageModal
          isOpen={isDeleteModalOpen}
          stage={stageToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleStageDeleted}
          onDeactivated={(updated) => {
            setStages((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setSuccessMessage(`Pipeline stage "${updated.stage_name}" deactivated successfully.`);
          }}
        />
      </div>
    </AppShell>
  );
};

export default PipelineStagesPage;
