import React from 'react';
import { OpportunityCard } from './OpportunityCard';
import { usePermission } from '../../hooks/usePermission';
import type { KanbanColumn, Opportunity } from '../../types/opportunity';
import { Layers, Plus, CheckCircle2, XCircle } from 'lucide-react';

interface OpportunityKanbanProps {
  columns: KanbanColumn[];
  isLoading: boolean;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onAdvanceStage: (opportunity: Opportunity) => void;
  onExportPms: (opportunity: Opportunity) => void;
  onCreateInStage?: (stageId: number) => void;
}

export const OpportunityKanban: React.FC<OpportunityKanbanProps> = ({
  columns,
  isLoading,
  onSelectOpportunity,
  onAdvanceStage,
  onExportPms,
  onCreateInStage,
}) => {
  const { can } = usePermission();
  const canCreate = can('opportunities.create');
  const canEdit = can('opportunities.edit');
  const formatStageValue = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `ETB ${(val / 1000).toFixed(0)}k`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-80 shrink-0 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 animate-pulse flex flex-col gap-4 shadow-xs"
          >
            <div className="h-6 bg-slate-200 dark:bg-slate-800/70 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-1/3"></div>
            <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
            <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[600px] custom-scrollbar">
      {columns.map((column) => {
        const isWon = column.is_closed_won;
        const isLost = column.is_closed_lost;

        return (
          <div
            key={column.stage_id}
            className={`w-80 shrink-0 rounded-2xl border flex flex-col transition-all backdrop-blur-md shadow-xs ${
              isWon
                ? 'bg-emerald-50/40 dark:bg-slate-900/60 border-emerald-200 dark:border-emerald-500/30'
                : isLost
                ? 'bg-rose-50/40 dark:bg-slate-900/60 border-rose-200 dark:border-rose-500/30'
                : 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWon ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isLost ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
                  )}
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white tracking-wide">
                    {column.stage_name}
                  </h3>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  {column.total_deals}
                </span>
              </div>

              {/* Column Total Value Summary */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                <span>Total Value:</span>
                <span className="font-semibold text-cyan-700 dark:text-cyan-300 font-mono">
                  {formatStageValue(column.total_value)}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 flex flex-col gap-3 min-h-[450px] max-h-[700px] overflow-y-auto custom-scrollbar">
              {column.opportunities.length > 0 ? (
                column.opportunities.map((deal) => (
                  <OpportunityCard
                    key={deal.id}
                    opportunity={deal}
                    onSelect={onSelectOpportunity}
                    onAdvanceStage={!isWon && !isLost && canEdit ? onAdvanceStage : undefined}
                    onExportPms={isWon ? onExportPms : undefined}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-xl my-auto">
                  <Layers className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No deals in this stage</p>
                  {canCreate && onCreateInStage && !isWon && !isLost && (
                    <button
                      type="button"
                      onClick={() => onCreateInStage(column.stage_id)}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Deal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
