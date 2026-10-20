import React from 'react';
import { ArrowRight, Trophy, XCircle, CheckCircle2, Briefcase, Sparkles } from 'lucide-react';
import type { PipelineStage } from '../../types/pipelineStage';

interface PipelineStagesVisualizerProps {
  stages: PipelineStage[];
  selectedStageId?: number | null;
  onSelectStage?: (stageId: number | null) => void;
}

export const PipelineStagesVisualizer: React.FC<PipelineStagesVisualizerProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
}) => {
  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);

  if (sortedStages.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Visual Deal Progression Flow
          </h2>
          <span className="text-[11px] text-slate-400">
            ({sortedStages.filter((s) => s.is_active).length} Active Milestones)
          </span>
        </div>

        {selectedStageId && (
          <button
            type="button"
            onClick={() => onSelectStage && onSelectStage(null)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Horizontal Flow Container */}
      <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {sortedStages.map((stage, idx) => {
            const isSelected = selectedStageId === stage.id;
            const isWon = stage.is_closed_won;
            const isLost = stage.is_closed_lost;
            const isStandard = !isWon && !isLost;
            const isInactive = !stage.is_active;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Node */}
                <button
                  type="button"
                  onClick={() => onSelectStage && onSelectStage(isSelected ? null : stage.id)}
                  className={`
                    relative group flex flex-col p-3 rounded-xl border transition-all text-left min-w-[170px] max-w-[210px] cursor-pointer
                    ${
                      isSelected
                        ? 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50/70 shadow-md scale-[1.02]'
                        : isInactive
                        ? 'opacity-60 bg-slate-50 border-dashed border-slate-300 hover:opacity-100'
                        : isWon
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-300/80 hover:border-emerald-500 shadow-2xs'
                        : isLost
                        ? 'bg-gradient-to-br from-rose-50 to-rose-100/60 border-rose-300/80 hover:border-rose-500 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-emerald-500/70 hover:shadow-xs'
                    }
                  `}
                >
                  {/* Top indicator: sequence & archetype icon */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`
                        w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono
                        ${
                          isWon
                            ? 'bg-emerald-600 text-white'
                            : isLost
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }
                      `}
                    >
                      {stage.display_order}
                    </span>

                    <div className="flex items-center gap-1">
                      {isWon && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Trophy className="w-3 h-3 text-emerald-600" />
                          Won
                        </span>
                      )}
                      {isLost && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Lost
                        </span>
                      )}
                      {isStandard && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Step {idx + 1}
                        </span>
                      )}
                      {isInactive && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage Name */}
                  <h4 className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
                    {stage.stage_name}
                  </h4>

                  {/* Bottom Stats: Opportunity count */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{stage.opportunities_count ?? 0}</span>
                      <span className="text-[10px] text-slate-400">
                        {(stage.opportunities_count ?? 0) === 1 ? 'deal' : 'deals'}
                      </span>
                    </span>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stage.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={stage.is_active ? 'Active Stage' : 'Inactive Stage'}
                    />
                  </div>
                </button>

                {/* Connecting Arrow */}
                {idx < sortedStages.length - 1 && (
                  <div className="flex items-center text-slate-300 shrink-0 px-0.5">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineStagesVisualizer;
