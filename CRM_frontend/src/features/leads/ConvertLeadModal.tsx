import React, { useState } from 'react';
import { X, ArrowRight, Building2, User, Briefcase, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import leadService from '../../services/leadService';
import type { Lead, ConvertLeadPayload } from '../../types/lead';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onConverted: (updatedLead: Lead) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onConverted,
}) => {
  const [contactTitle, setContactTitle] = useState('Founder / Managing Director');
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (lead && isOpen) {
      setContactTitle('Managing Director');
      setCreateOpportunity(true);
      setOpportunityTitle(`${lead.organization || lead.name} - IT Park Commercial Lease`);
      setEstimatedValue(
        lead.estimated_space_sqm ? String(Number(lead.estimated_space_sqm) * 350) : '75000'
      );
      setError(null);
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: ConvertLeadPayload = {
      contact_title: contactTitle.trim() || undefined,
      create_opportunity: createOpportunity,
      opportunity_title: opportunityTitle.trim() || undefined,
      estimated_value: estimatedValue ? Number(estimatedValue) : undefined,
    };

    try {
      const res = await leadService.convertLead(lead.id, payload);
      onConverted(res.lead);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to convert lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-cyan-50/70 dark:bg-cyan-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                1-Click Convert to Corporate Tenant
              </h3>
              <p className="text-[11px] text-cyan-800 dark:text-cyan-300">
                Transform qualified lead into Account, Primary Contact & Deal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConvert} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Transformation Visualizer */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Entities to be Generated
            </span>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-sm bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Account: {lead.organization || `${lead.name} Enterprise`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1 rounded-sm bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>
                  Primary Contact: <strong className="text-slate-900 dark:text-white">{lead.name}</strong> ({lead.email || 'No email'})
                </span>
              </div>

              {createOpportunity && (
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-sm bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Pipeline Deal: <strong className="text-slate-900 dark:text-white">{opportunityTitle}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Contact Person Job Title"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
            placeholder="e.g. Managing Director, CEO"
          />

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="create_opp" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                Create Initial Deal / Lease Opportunity
              </label>
              <input
                type="checkbox"
                id="create_opp"
                checked={createOpportunity}
                onChange={(e) => setCreateOpportunity(e.target.checked)}
                className="rounded-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-cyan-500"
              />
            </div>

            {createOpportunity && (
              <div className="space-y-3 pl-2 border-l-2 border-cyan-500">
                <Input
                  label="Deal / Opportunity Title"
                  value={opportunityTitle}
                  onChange={(e) => setOpportunityTitle(e.target.value)}
                  placeholder="e.g. Abyssinia Cloud Lease - 450 sqm"
                />

                <Input
                  type="number"
                  label="Estimated Value (ETB)"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="e.g. 150000"
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConvert}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm & Convert Lead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConvertLeadModal;
