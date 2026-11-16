import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Layers,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building2,
  ArrowRight,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import type {
  KanbanColumn,
  Opportunity,
  OpportunityMetrics,
  OpportunityType,
  PipelineStage,
} from '../../types/opportunity';
import { opportunityService } from '../../services/opportunityService';
import { OpportunityKanban } from './OpportunityKanban';
import { OpportunitiesTable } from './OpportunitiesTable';
import { OpportunityDrawer } from './OpportunityDrawer';
import { OpportunityModal } from './OpportunityModal';
import { StageTransitionModal } from './StageTransitionModal';
import { DeleteOpportunityModal } from './DeleteOpportunityModal';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/layout/AppShell';

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Data State
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([]);
  const [tableOpportunities, setTableOpportunities] = useState<Opportunity[]>([]);
  const [metrics, setMetrics] = useState<OpportunityMetrics | null>(null);
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | 'all'>('all');
  const [selectedStageId, setSelectedStageId] = useState<number | 'all'>('all');

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawer State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opportunityToEdit, setOpportunityToEdit] = useState<Opportunity | null>(null);
  const [initialStageId, setInitialStageId] = useState<number | null>(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [opportunityToAdvance, setOpportunityToAdvance] = useState<Opportunity | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);

  const canManage = useMemo(() => {
    const roleName = user?.role?.role_name?.toLowerCase() || user?.role?.name?.toLowerCase() || '';
    return roleName.includes('admin') || roleName.includes('manager') || roleName.includes('officer');
  }, [user]);

  // Load Dropdowns (Types & Stages)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [typesRes, stagesRes] = await Promise.all([
          opportunityService.getOpportunityTypes(),
          opportunityService.getPipelineStages(),
        ]);
        setOpportunityTypes(typesRes);
        setStages(stagesRes);
      } catch (err) {
        console.error('Failed to load opportunity metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Data (Metrics, Kanban or Table)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const typeFilter = selectedTypeId !== 'all' ? selectedTypeId : undefined;
      const searchFilter = searchTerm.trim() || undefined;

      const [metricsRes, kanbanRes, tableRes] = await Promise.all([
        opportunityService.getMetrics(),
        opportunityService.getKanban({
          search: searchFilter,
          opportunity_type_id: typeFilter,
        }),
        opportunityService.getOpportunities({
          search: searchFilter,
          opportunity_type_id: typeFilter,
          stage_id: selectedStageId !== 'all' ? selectedStageId : undefined,
          per_page: 50,
        }),
      ]);

      setMetrics(metricsRes);
      setKanbanColumns(kanbanRes);
      setTableOpportunities(tableRes.data);
    } catch (err: any) {
      console.error('Failed to fetch opportunities data:', err);
      setErrorMessage('Failed to load opportunities pipeline.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTypeId, selectedStageId, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Notifications timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const formatCurrency = (val: number = 0) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `ETB ${(val / 1000).toFixed(0)}k`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  // Handlers
  const handleOpenCreate = (stageId?: number) => {
    setOpportunityToEdit(null);
    setInitialStageId(stageId || null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp: Opportunity) => {
    setOpportunityToEdit(opp);
    setIsModalOpen(true);
  };

  const handleOpenAdvance = (opp: Opportunity) => {
    setOpportunityToAdvance(opp);
    setIsAdvanceModalOpen(true);
  };

  const handleOpenDelete = (opp: Opportunity) => {
    setOpportunityToDelete(opp);
    setIsDeleteModalOpen(true);
  };

  const handleSelectOpportunity = async (opp: Opportunity) => {
    try {
      const full = await opportunityService.getOpportunity(opp.id);
      setSelectedOpportunity(full);
      setIsDrawerOpen(true);
    } catch (err) {
      setSelectedOpportunity(opp);
      setIsDrawerOpen(true);
    }
  };

  const handleOpportunitySaved = (saved: Opportunity) => {
    setSuccessMessage(
      `Opportunity for "${saved.account?.organization_name || 'Account'}" successfully saved.`
    );
    fetchData();
    if (selectedOpportunity?.id === saved.id) {
      setSelectedOpportunity(saved);
    }
  };

  const handleStageTransitioned = (updated: Opportunity) => {
    setSuccessMessage(
      `Opportunity moved to "${updated.stage?.stage_name || 'new stage'}".`
    );
    fetchData();
    if (selectedOpportunity?.id === updated.id) {
      setSelectedOpportunity(updated);
    }
  };

  const handleExportPms = async (opp: Opportunity) => {
    try {
      await opportunityService.exportPms(opp.id, 'csv');
      setSuccessMessage(`PMS facility handoff generated for "${opp.account?.organization_name}".`);
    } catch (err: any) {
      console.error('Failed to export PMS:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to generate PMS export.');
    }
  };

  return (
    <AppShell
      title="Commercial Deals & Opportunities"
      subtitle="Ethiopian IT Park — Leases, Incubation Agreements & Revenue Pipeline"
      fullWidth
    >
      <div className="space-y-6">
        {/* Top Header Banner & Action Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Commercial Deals & Opportunities
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Track commercial park leases, startup incubation agreements, and revenue forecasting across pipeline stages.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => fetchData()}
              title="Refresh Pipeline"
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {canManage && (
              <button
                type="button"
                onClick={() => handleOpenCreate()}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>New Opportunity</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
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
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 dark:text-rose-400 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Active Pipeline */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Pipeline</span>
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
              {formatCurrency(metrics?.total_pipeline_value)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">{metrics?.open_deals_count || 0}</span>
              <span>active deals in negotiation</span>
            </div>
          </div>

          {/* Weighted Forecast Value */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Weighted Forecast</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2 font-mono">
              {formatCurrency(metrics?.weighted_forecast_value)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Probability-adjusted revenue</span>
            </div>
          </div>

          {/* Closed Won Revenue */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Closed Won Contracts</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 font-mono">
              {formatCurrency(metrics?.closed_won_value)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {metrics?.win_rate_pct || 0}% Win Rate
              </span>
              <span>({metrics?.closed_won_count || 0} won)</span>
            </div>
          </div>

          {/* Average Deal Size */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Deal Size</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
              {formatCurrency(metrics?.avg_deal_size)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Per open commercial agreement</span>
            </div>
          </div>
        </div>

        {/* Filter Bar & View Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none backdrop-blur-md">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company or deal notes..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              {opportunityTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type_name}
                </option>
              ))}
            </select>

            {/* Stage Filter (for table view) */}
            {viewMode === 'table' && (
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="all">All Stages</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stage_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2-Segment View Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'kanban'
                  ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table'
                  ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Dense Table</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'kanban' ? (
          <OpportunityKanban
            columns={kanbanColumns}
            isLoading={isLoading}
            onSelectOpportunity={handleSelectOpportunity}
            onAdvanceStage={handleOpenAdvance}
            onExportPms={handleExportPms}
            onCreateInStage={(stageId) => handleOpenCreate(stageId)}
          />
        ) : (
          <OpportunitiesTable
            opportunities={tableOpportunities}
            isLoading={isLoading}
            onSelectOpportunity={handleSelectOpportunity}
            onEditOpportunity={handleOpenEdit}
            onDeleteOpportunity={handleOpenDelete}
            onAdvanceStage={handleOpenAdvance}
            onExportPms={handleExportPms}
            canManage={canManage}
          />
        )}

        {/* Opportunity Detail Drawer */}
        <OpportunityDrawer
          opportunity={selectedOpportunity}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onAdvanceStage={(opp) => {
            setIsDrawerOpen(false);
            handleOpenAdvance(opp);
          }}
          onTransferOwnership={(opp) => {
            setIsDrawerOpen(false);
            handleOpenEdit(opp);
          }}
          onExportPms={handleExportPms}
        />

        {/* Create / Edit Modal */}
        <OpportunityModal
          isOpen={isModalOpen}
          opportunityToEdit={opportunityToEdit}
          initialStageId={initialStageId}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleOpportunitySaved}
        />

        {/* Stage Transition Modal */}
        <StageTransitionModal
          isOpen={isAdvanceModalOpen}
          opportunity={opportunityToAdvance}
          stages={stages}
          onClose={() => setIsAdvanceModalOpen(false)}
          onSuccess={handleStageTransitioned}
        />

        {/* Delete Confirmation Modal */}
        <DeleteOpportunityModal
          isOpen={isDeleteModalOpen}
          opportunity={opportunityToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setSuccessMessage('Opportunity deleted successfully.');
            fetchData();
          }}
        />
      </div>
    </AppShell>
  );
};
