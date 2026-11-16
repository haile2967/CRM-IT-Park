import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Opportunity, PipelineStage } from '../../types/opportunity';
import { opportunityService } from '../../services/opportunityService';

interface StageTransitionModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  stages: PipelineStage[];
  onClose: () => void;
  onSuccess: (updatedOpportunity: Opportunity) => void;
}

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  isOpen,
  opportunity,
  stages,
  onClose,
  onSuccess,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (opportunity && stages.length > 0) {
      const currentOrder = opportunity.stage?.display_order ?? 0;
      const nextStage = stages.find((s) => s.display_order === currentOrder + 1);
      setSelectedStageId(nextStage ? nextStage.id : opportunity.stage_id);
      setNotes('');
      setError(null);
    }
  }, [opportunity, stages, isOpen]);

  if (!isOpen || !opportunity) return null;

  const targetStage = stages.find((s) => s.id === Number(selectedStageId));
  const isWonTarget = targetStage?.is_closed_won;
  const isLostTarget = targetStage?.is_closed_lost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStageId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await opportunityService.transitionStage(opportunity.id, {
        stage_id: Number(selectedStageId),
        notes: notes.trim() || undefined,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to transition stage:', err);
      setError(err.response?.data?.message || 'Failed to update deal stage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transition Deal Stage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {opportunity.account?.organization_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Current vs Target Stage Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Current</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{opportunity.stage?.stage_name}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                {targetStage?.stage_name || 'Select below'}
              </span>
            </div>
          </div>

          {/* Target Stage Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Destination Stage *
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.stage_name} {st.is_closed_won ? '(Won)' : st.is_closed_lost ? '(Lost)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Won / Lost alerts */}
          {isWonTarget && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Moving to <strong>Closed Won</strong> automatically sets probability to 100% and unlocks the PMS Facility Handoff.
              </span>
            </div>
          )}

          {isLostTarget && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                Moving to <strong>Closed Lost</strong> sets probability to 0%. Please describe the reason below.
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Stage Transition Notes / Milestone
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Terms agreed, draft lease sent to tenant board..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 custom-scrollbar"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-xs font-semibold text-white dark:text-slate-950 transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Transition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
