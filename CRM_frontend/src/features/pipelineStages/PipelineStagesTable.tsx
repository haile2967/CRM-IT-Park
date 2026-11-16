import React from 'react';
import {
  Layers,
  Trophy,
  XCircle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Briefcase,
  CheckCircle2,
  PowerOff,
  Power,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import type { PipelineStage } from '../../types/pipelineStage';

interface PipelineStagesTableProps {
  stages: PipelineStage[];
  isLoading: boolean;
  selectedStageId?: number | null;
  onEdit: (stage: PipelineStage) => void;
  onDelete: (stage: PipelineStage) => void;
  onToggleStatus: (stage: PipelineStage) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isReordering?: boolean;
  canManage?: boolean;
}

export const PipelineStagesTable: React.FC<PipelineStagesTableProps> = ({
  stages,
  isLoading,
  selectedStageId,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveUp,
  onMoveDown,
  isReordering = false,
  canManage = true,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/95 overflow-hidden shadow-2xs">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0f172a]/95">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Pipeline Stages Configured</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          Define pipeline stages to establish your opportunity progression funnel and deal milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <th className="py-3.5 pl-6 pr-3 w-28">Order</th>
              <th className="py-3.5 px-3">Stage Title</th>
              <th className="py-3.5 px-3">Milestone Archetype</th>
              <th className="py-3.5 px-3">Active Deals</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {stages.map((stage, index) => {
              const isSelected = selectedStageId === stage.id;
              const isWon = stage.is_closed_won;
              const isLost = stage.is_closed_lost;
              const dealCount = stage.opportunities_count ?? 0;

              return (
                <tr
                  key={stage.id}
                  className={`
                    group transition-colors
                    ${
                      isSelected
                        ? 'bg-cyan-50/80 dark:bg-cyan-950/30 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  {/* Sequence Order & Reorder Controls */}
                  <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                        {stage.display_order}
                      </span>

                      {canManage && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => onMoveUp(index)}
                            disabled={index === 0 || isReordering}
                            title="Move Up"
                            className="p-1 rounded-sm text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveDown(index)}
                            disabled={index === stages.length - 1 || isReordering}
                            title="Move Down"
                            className="p-1 rounded-sm text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stage Name */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isWon
                            ? 'bg-emerald-500'
                            : isLost
                            ? 'bg-rose-500'
                            : 'bg-cyan-500'
                        }`}
                      />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {stage.stage_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Milestone Archetype */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {isWon ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                        <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Closed Won (Terminal)
                      </span>
                    ) : isLost ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-2xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Closed Lost (Terminal)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        Standard Pipeline Stage
                      </span>
                    )}
                  </td>

                  {/* Active Deals / Opportunities */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-mono">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {dealCount} {dealCount === 1 ? 'deal' : 'deals'}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(stage)}
                      disabled={!canManage}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all
                        ${!canManage ? 'cursor-default' : 'cursor-pointer hover:shadow-2xs'}
                        ${
                          stage.is_active
                            ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }
                      `}
                      title={canManage ? 'Click to toggle active status' : undefined}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          stage.is_active ? 'bg-cyan-500' : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                      <span>{stage.is_active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-6 whitespace-nowrap text-right">
                    {canManage ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(stage)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Stage"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(stage)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">View Only</span>
                    )}
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

export default PipelineStagesTable;
