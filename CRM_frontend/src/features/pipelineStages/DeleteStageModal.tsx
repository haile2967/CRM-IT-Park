import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, PowerOff, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import pipelineStageService from '../../services/pipelineStageService';
import type { PipelineStage } from '../../types/pipelineStage';

interface DeleteStageModalProps {
  isOpen: boolean;
  stage: PipelineStage | null;
  onClose: () => void;
  onDeleted: (stageId: number) => void;
  onDeactivated: (updatedStage: PipelineStage) => void;
}

export const DeleteStageModal: React.FC<DeleteStageModalProps> = ({
  isOpen,
  stage,
  onClose,
  onDeleted,
  onDeactivated,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !stage) return null;

  const linkedOpportunities = stage.opportunities_count ?? 0;
  const hasLinkedOpportunities = linkedOpportunities > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await pipelineStageService.deleteStage(stage.id);
      onDeleted(stage.id);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      setErrorMessage(
        apiErr.response?.data?.message ||
          'Failed to delete pipeline stage. Please ensure no opportunities are linked and try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setErrorMessage(null);
    try {
      const updated = await pipelineStageService.toggleStatus(stage.id, false);
      onDeactivated(updated);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      setErrorMessage(
        apiErr.response?.data?.message || 'Failed to deactivate pipeline stage. Please try again.'
      );
    } finally {
      setIsDeactivating(false);
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
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                {hasLinkedOpportunities ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {hasLinkedOpportunities
                    ? 'Deletion Blocked: Active Opportunities'
                    : 'Confirm Stage Deletion'}
                </h3>
                <p className="text-[11px] text-slate-500">Pipeline Stage: {stage.stage_name}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {errorMessage && (
              <Alert variant="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            {hasLinkedOpportunities ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Integrity Protection Active</span>
                  </div>
                  <p>
                    Stage <strong className="font-semibold text-slate-900">"{stage.stage_name}"</strong> currently has{' '}
                    <strong className="text-amber-800 font-bold">{linkedOpportunities} linked {linkedOpportunities === 1 ? 'deal' : 'deals'}</strong>.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    To maintain audit trails and CRM contract reporting, stages with active deals cannot be permanently deleted. Instead, deactivate this stage so it is hidden from future pipeline selections without affecting existing records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Are you sure you want to permanently delete{' '}
                  <strong className="font-semibold text-slate-900">"{stage.stage_name}"</strong>?
                </p>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  <strong>Warning:</strong> This action cannot be undone. Once deleted, this stage and its display order position will be removed permanently.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isDeleting || isDeactivating}>
                Cancel
              </Button>

              {hasLinkedOpportunities ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleDeactivate}
                  isLoading={isDeactivating}
                  leftIcon={<PowerOff className="w-3.5 h-3.5" />}
                >
                  Deactivate Stage
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Permanently Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStageModal;
