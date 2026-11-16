import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Building2, TrendingUp, FileText } from 'lucide-react';
import type { Opportunity, OpportunityType, PipelineStage } from '../../types/opportunity';
import type { Account } from '../../types/account';
import { opportunityService } from '../../services/opportunityService';
import { accountService } from '../../services/accountService';

interface OpportunityModalProps {
  isOpen: boolean;
  opportunityToEdit?: Opportunity | null;
  initialStageId?: number | null;
  onClose: () => void;
  onSaved: (opportunity: Opportunity) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  opportunityToEdit,
  initialStageId,
  onClose,
  onSaved,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [types, setTypes] = useState<OpportunityType[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [accountId, setAccountId] = useState<number | ''>('');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [stageId, setStageId] = useState<number | ''>('');
  const [value, setValue] = useState<number | ''>('');
  const [probability, setProbability] = useState<number>(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const loadDropdowns = async () => {
      try {
        setIsLoadingDropdowns(true);
        const [accountsRes, typesRes, stagesRes] = await Promise.all([
          accountService.getAccounts({ per_page: 100 }),
          opportunityService.getOpportunityTypes(),
          opportunityService.getPipelineStages(),
        ]);

        setAccounts(accountsRes.data);
        setTypes(typesRes);
        setStages(stagesRes);

        // Pre-fill if editing
        if (opportunityToEdit) {
          setAccountId(opportunityToEdit.account_id);
          setTypeId(opportunityToEdit.opportunity_type_id);
          setStageId(opportunityToEdit.stage_id);
          setValue(opportunityToEdit.value || '');
          setProbability(opportunityToEdit.probability || 50);
          setExpectedCloseDate(
            opportunityToEdit.expected_close_date
              ? opportunityToEdit.expected_close_date.split('T')[0]
              : ''
          );
          setNotes(opportunityToEdit.notes || '');
        } else {
          // Defaults for new deal
          if (accountsRes.data.length > 0) setAccountId(accountsRes.data[0].id);
          if (typesRes.length > 0) setTypeId(typesRes[0].id);
          if (initialStageId) {
            setStageId(initialStageId);
          } else if (stagesRes.length > 0) {
            setStageId(stagesRes[0].id);
          }
          setValue(500000);
          setProbability(50);
          setExpectedCloseDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
          setNotes('');
        }
      } catch (err: any) {
        console.error('Failed to load dropdown data:', err);
        setError('Failed to load form dependencies.');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, [isOpen, opportunityToEdit, initialStageId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !typeId || !stageId) {
      setError('Please select an Account, Opportunity Type, and Stage.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        account_id: Number(accountId),
        opportunity_type_id: Number(typeId),
        stage_id: Number(stageId),
        value: Number(value) || 0,
        probability: Number(probability),
        expected_close_date: expectedCloseDate || undefined,
        notes: notes.trim() || undefined,
      };

      let saved: Opportunity;
      if (opportunityToEdit) {
        saved = await opportunityService.updateOpportunity(opportunityToEdit.id, payload);
      } else {
        saved = await opportunityService.createOpportunity(payload);
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('Failed to save opportunity:', err);
      setError(err.response?.data?.message || 'Failed to save commercial deal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {opportunityToEdit ? 'Edit Commercial Opportunity' : 'New Commercial Deal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track deal value, probability, and park lease terms
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
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Account Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Corporate Account *
            </label>
            <select
              value={accountId}
              disabled={isLoadingDropdowns}
              onChange={(e) => setAccountId(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Select Tenant Account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.organization_name} ({acc.industry || 'Tech'})
                </option>
              ))}
            </select>
          </div>

          {/* Type & Stage Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deal Category *
              </label>
              <select
                value={typeId}
                disabled={isLoadingDropdowns}
                onChange={(e) => setTypeId(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select Category...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pipeline Stage *
              </label>
              <select
                value={stageId}
                disabled={isLoadingDropdowns}
                onChange={(e) => setStageId(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select Stage...</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stage_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value (ETB) & Probability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deal Value (ETB) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">ETB</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={value}
                  onChange={(e) => setValue(e.target.value ? Number(e.target.value) : '')}
                  required
                  placeholder="500,000"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-11 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Probability</label>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{probability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expected Close Date
            </label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Scope / Space Requirements Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 500 sqm data center rack space, dual power redundancy..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 custom-scrollbar"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-xs font-semibold text-white dark:text-slate-950 transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : opportunityToEdit ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
