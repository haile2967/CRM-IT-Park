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
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Visual Deal Progression Flow
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({sortedStages.filter((s) => s.is_active).length} Active Milestones)
          </span>
        </div>

        {selectedStageId && (
          <button
            type="button"
            onClick={() => onSelectStage && onSelectStage(null)}
            className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium hover:underline cursor-pointer"
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
                        ? 'ring-2 ring-cyan-500 border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-md scale-[1.02]'
                        : isInactive
                        ? 'opacity-60 bg-slate-50 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-800 hover:opacity-100'
                        : isWon
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300/80 dark:border-emerald-800/60 hover:border-emerald-500 shadow-2xs'
                        : isLost
                        ? 'bg-gradient-to-br from-rose-50 to-rose-100/60 dark:from-rose-950/30 dark:to-slate-900 border-rose-300/80 dark:border-rose-800/60 hover:border-rose-500 shadow-2xs'
                        : 'bg-white dark:bg-[#0b1120] border-slate-200 dark:border-slate-800 hover:border-cyan-500/70 hover:shadow-xs'
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
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }
                      `}
                    >
                      {stage.display_order}
                    </span>

                    <div className="flex items-center gap-1">
                      {isWon && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Won
                        </span>
                      )}
                      {isLost && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Lost
                        </span>
                      )}
                      {isStandard && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Step {idx + 1}
                        </span>
                      )}
                      {isInactive && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage Name */}
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {stage.stage_name}
                  </h4>

                  {/* Bottom Stats: Opportunity count */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                      <Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{stage.opportunities_count ?? 0}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {(stage.opportunities_count ?? 0) === 1 ? 'deal' : 'deals'}
                      </span>
                    </span>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stage.is_active ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={stage.is_active ? 'Active Stage' : 'Inactive Stage'}
                    />
                  </div>
                </button>

                {/* Connecting Arrow */}
                {idx < sortedStages.length - 1 && (
                  <div className="flex items-center text-slate-300 dark:text-slate-700 shrink-0 px-0.5">
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
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
