import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  User,
  ShieldCheck,
  History,
  FileText,
  Download,
  Share2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { Opportunity } from '../../types/opportunity';
import { opportunityService } from '../../services/opportunityService';

interface OpportunityDrawerProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStage: (opportunity: Opportunity) => void;
  onTransferOwnership: (opportunity: Opportunity) => void;
  onExportPms: (opportunity: Opportunity) => void;
}

export const OpportunityDrawer: React.FC<OpportunityDrawerProps> = ({
  opportunity,
  isOpen,
  onClose,
  onAdvanceStage,
  onTransferOwnership,
  onExportPms,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pms'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !opportunity) return null;

  const isWon = opportunity.status === 'closed_won';
  const isLost = opportunity.status === 'closed_lost';

  const formatCurrency = (val: number) => {
    return `ETB ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadPms = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      await opportunityService.exportPms(opportunity.id, format);
    } catch (err) {
      console.error('Failed to export PMS data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 shadow-2xl flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
                    {opportunity.opportunity_type?.type_name || 'Commercial Deal'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isWon
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                        : isLost
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
                    }`}
                  >
                    {isWon ? 'Closed Won' : isLost ? 'Closed Lost' : 'In Progress'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {opportunity.account?.organization_name || 'Corporate Opportunity'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{opportunity.account?.industry || 'Technology'}</span>
                  <span>•</span>
                  <span>{opportunity.account?.location || 'Ethiopian IT Park'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Advance Bar */}
            {!isWon && !isLost && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Stage: <span className="font-semibold text-cyan-700 dark:text-cyan-300">{opportunity.stage?.stage_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onAdvanceStage(opportunity)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-2 mt-5 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Overview & Terms
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 px-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Stage Timeline ({opportunity.stage_histories?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pms')}
                className={`pb-2.5 px-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'pms'
                    ? 'border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                PMS Facility Handoff
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Financial KPI Banner */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Agreed Contract Value</span>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
                      {formatCurrency(opportunity.value)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weighted Forecast</span>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1 font-mono">
                      {formatCurrency((opportunity.value * (opportunity.probability / 100)))}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Based on {opportunity.probability}% probability
                    </span>
                  </div>
                </div>

                {/* Deal Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Commercial Terms
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Expected Close Date</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {opportunity.expected_close_date
                          ? new Date(opportunity.expected_close_date).toLocaleDateString()
                          : 'Not scheduled'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Assigned Deal Officer</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center justify-between">
                        <span>
                          {opportunity.owner
                            ? `${opportunity.owner.first_name} ${opportunity.owner.last_name}`
                            : 'Unassigned'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onTransferOwnership(opportunity)}
                          className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Share2 className="w-3 h-3" />
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>

                  {opportunity.notes && (
                    <div className="pt-2">
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Deal Notes & Space Requirements</span>
                      <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {opportunity.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Associated Account Stakeholder */}
                {opportunity.account?.primary_contact && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Primary Contact Stakeholder
                    </h3>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {opportunity.account.primary_contact.first_name}{' '}
                          {opportunity.account.primary_contact.last_name}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {opportunity.account.primary_contact.role_title || 'Key Stakeholder'}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                        <div>{opportunity.account.primary_contact.email}</div>
                        <div>{opportunity.account.primary_contact.phone}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Stage Audit Timeline
                </h3>

                {opportunity.stage_histories && opportunity.stage_histories.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {opportunity.stage_histories.map((hist, idx) => (
                      <div key={hist.id || idx} className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-500 dark:bg-cyan-400 border-2 border-white dark:border-slate-900" />
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                            <span>
                              {hist.from_stage ? `${hist.from_stage.stage_name} → ` : 'Started at '}
                              <span className="text-cyan-700 dark:text-cyan-300">{hist.to_stage?.stage_name}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {new Date(hist.changed_at).toLocaleString()}
                            </span>
                          </div>

                          {hist.notes && (
                            <p className="mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                              {hist.notes}
                            </p>
                          )}

                          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                            Changed by:{' '}
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                              {hist.changed_by
                                ? `${hist.changed_by.first_name} ${hist.changed_by.last_name}`
                                : 'System'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No stage transition history recorded yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pms' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-cyan-800 dark:text-cyan-300 mb-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Property Management System (PMS) Handoff Contract (SRS §10.1)
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    When an opportunity reaches <strong>Closed Won</strong>, all commercial agreements,
                    space dimensions, and corporate contacts are packaged for the Park Facility & Space
                    Allocation team.
                  </p>
                </div>

                {isWon ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                        <span className="text-slate-500">PMS Contract Reference</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ITP-PMS-{String(opportunity.id).padStart(5, '0')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                        <span className="text-slate-500">Corporate Tenant</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {opportunity.account?.organization_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                        <span className="text-slate-500">Contract Total</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(opportunity.value)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Execution Status</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready for Facility Onboarding
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => handleDownloadPms('csv')}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Download CSV (Excel)
                      </button>

                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => handleDownloadPms('json')}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        Export JSON Payload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Opportunity Not Yet Closed Won</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                      PMS handoff is unlocked once the commercial agreement reaches the{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Closed Won</span> stage.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
