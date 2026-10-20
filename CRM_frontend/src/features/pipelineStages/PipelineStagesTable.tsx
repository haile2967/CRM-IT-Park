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
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-slate-100 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No Pipeline Stages Configured</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Define pipeline stages to establish your opportunity progression funnel and deal milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              <th className="py-3.5 pl-6 pr-3 w-28">Order</th>
              <th className="py-3.5 px-3">Stage Title</th>
              <th className="py-3.5 px-3">Milestone Archetype</th>
              <th className="py-3.5 px-3">Active Deals</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
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
                        ? 'bg-emerald-50/80 hover:bg-emerald-50'
                        : 'hover:bg-slate-50/70'
                    }
                  `}
                >
                  {/* Sequence Order & Reorder Controls */}
                  <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                        {stage.display_order}
                      </span>

                      {canManage && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => onMoveUp(index)}
                            disabled={index === 0 || isReordering}
                            title="Move Up"
                            className="p-1 rounded-sm text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveDown(index)}
                            disabled={index === stages.length - 1 || isReordering}
                            title="Move Down"
                            className="p-1 rounded-sm text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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
                            : 'bg-sky-500'
                        }`}
                      />
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {stage.stage_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Milestone Archetype */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {isWon ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                        <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                        Closed Won (Terminal)
                      </span>
                    ) : isLost ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Closed Lost (Terminal)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-sky-600" />
                        Standard Pipeline Stage
                      </span>
                    )}
                  </td>

                  {/* Active Deals / Opportunities */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                      <Briefcase className="w-3 h-3 text-slate-500" />
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
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }
                      `}
                      title={canManage ? 'Click to toggle active status' : undefined}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          stage.is_active ? 'bg-emerald-500' : 'bg-slate-400'
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Stage"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(stage)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">View Only</span>
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
