import React, { useState, useEffect } from 'react';
import { X, Layers, Trophy, XCircle, ArrowRightCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import pipelineStageService from '../../services/pipelineStageService';
import type { PipelineStage } from '../../types/pipelineStage';

interface PipelineStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageToEdit?: PipelineStage | null;
  onSaved: (stage: PipelineStage) => void;
  nextDisplayOrder: number;
}

export const PipelineStageModal: React.FC<PipelineStageModalProps> = ({
  isOpen,
  onClose,
  stageToEdit,
  onSaved,
  nextDisplayOrder,
}) => {
  const isEditing = Boolean(stageToEdit);

  const [stageName, setStageName] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [stageType, setStageType] = useState<'standard' | 'won' | 'lost'>('standard');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (stageToEdit) {
      setStageName(stageToEdit.stage_name || '');
      setDisplayOrder(stageToEdit.display_order || 1);
      setIsActive(stageToEdit.is_active ?? true);
      if (stageToEdit.is_closed_won) {
        setStageType('won');
      } else if (stageToEdit.is_closed_lost) {
        setStageType('lost');
      } else {
        setStageType('standard');
      }
      setErrorMessage(null);
    } else {
      setStageName('');
      setDisplayOrder(nextDisplayOrder || 1);
      setStageType('standard');
      setIsActive(true);
      setErrorMessage(null);
    }
  }, [stageToEdit, isOpen, nextDisplayOrder]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = stageName.trim();
    if (!trimmedName) {
      setErrorMessage('Please provide a descriptive name for this pipeline stage.');
      return;
    }

    if (!displayOrder || displayOrder < 1) {
      setErrorMessage('Display order must be an integer of 1 or greater.');
      return;
    }

    const isClosedWon = stageType === 'won';
    const isClosedLost = stageType === 'lost';

    setIsSubmitting(true);
    try {
      if (isEditing && stageToEdit) {
        // 1. Update mutable stage properties (name, display_order, terminal flags)
        let updated = await pipelineStageService.updateStage(stageToEdit.id, {
          stage_name: trimmedName,
          display_order: displayOrder,
          is_closed_won: isClosedWon,
          is_closed_lost: isClosedLost,
        });

        // 2. If active status was modified during edit, invoke the toggle status endpoint
        if (stageToEdit.is_active !== isActive) {
          updated = await pipelineStageService.toggleStatus(stageToEdit.id, isActive);
        }

        onSaved(updated);
      } else {
        const created = await pipelineStageService.createStage({
          stage_name: trimmedName,
          display_order: displayOrder,
          is_closed_won: isClosedWon,
          is_closed_lost: isClosedLost,
        });
        onSaved(created);
      }
      onClose();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };

      const backendMsg =
        apiErr.response?.data?.message ||
        (apiErr.response?.data?.errors
          ? Object.values(apiErr.response.data.errors).flat().join(' ')
          : null);

      setErrorMessage(backendMsg || 'Failed to save pipeline stage. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base tracking-tight text-white">
                  {isEditing ? 'Configure Pipeline Stage' : 'New Pipeline Stage'}
                </h3>
                <p className="text-xs text-slate-300">
                  {isEditing
                    ? `Editing attributes for "${stageToEdit?.stage_name}"`
                    : 'Add a new workflow milestone to the deal pipeline'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <Alert variant="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <div className="space-y-4">
              {/* Stage Name */}
              <div>
                <Input
                  label="Stage Name"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. Technical Feasibility & Due Diligence"
                  helperText="Clear title of the milestone displayed across deal cards and pipeline views."
                />
              </div>

              {/* Display Order */}
              <div>
                <Input
                  label="Display Sequence Order"
                  type="number"
                  min="1"
                  required
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                  helperText="Numerical sequence position (1 is the initial stage, higher numbers follow sequentially)."
                />
              </div>

              {/* Operational Status (Active vs Deactivated) */}
              {isEditing && (
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Pipeline Stage Status
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {isActive
                          ? 'Stage is active and visible in deal workflows.'
                          : 'Stage is deactivated and hidden from opportunity forms.'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsActive(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsActive(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          !isActive
                            ? 'bg-slate-700 text-white border-slate-800 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${!isActive ? 'bg-white' : 'bg-slate-400'}`} />
                        Deactivated
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Type & Terminal Flags */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 tracking-tight">
                  Milestone Behavior & Terminal State
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Standard Option */}
                  <label
                    className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      stageType === 'standard'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stageType"
                      value="standard"
                      checked={stageType === 'standard'}
                      onChange={() => setStageType('standard')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <ArrowRightCircle
                        className={`w-4 h-4 ${
                          stageType === 'standard' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-semibold text-xs text-slate-900">Standard</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Active progression stage in the sales workflow.
                    </span>
                  </label>

                  {/* Closed Won Option */}
                  <label
                    className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      stageType === 'won'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stageType"
                      value="won"
                      checked={stageType === 'won'}
                      onChange={() => setStageType('won')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <Trophy
                        className={`w-4 h-4 ${
                          stageType === 'won' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-semibold text-xs text-slate-900">Closed Won</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Deal successfully closed and contract awarded.
                    </span>
                  </label>

                  {/* Closed Lost Option */}
                  <label
                    className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      stageType === 'lost'
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs ring-1 ring-rose-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stageType"
                      value="lost"
                      checked={stageType === 'lost'}
                      onChange={() => setStageType('lost')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <XCircle
                        className={`w-4 h-4 ${
                          stageType === 'lost' ? 'text-rose-700' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-semibold text-xs text-slate-900">Closed Lost</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Opportunity terminated or lost to competitors.
                    </span>
                  </label>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-700">💡 Pipeline Configuration Rule:</p>
                <p className="text-[11px] text-slate-500">
                  New stages are created as active by default. Inactive stages are hidden from deal creation dropdowns but preserve all historical opportunity logs.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create Stage'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PipelineStageModal;
