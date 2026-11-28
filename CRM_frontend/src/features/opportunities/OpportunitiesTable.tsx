import React from 'react';
import {
  Building2,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Trash2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import type { Opportunity } from '../../types/opportunity';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunity: Opportunity) => void;
  onAdvanceStage: (opportunity: Opportunity) => void;
  onExportPms: (opportunity: Opportunity) => void;
}

export const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
  isLoading,
  onSelectOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onAdvanceStage,
  onExportPms,
}) => {
  const { can } = usePermission();
  const canEdit = can('opportunities.edit');
  const canDelete = can('opportunities.delete');
  const formatCurrency = (val: number) => {
    return `ETB ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStageBadge = (stage?: { stage_name: string; is_closed_won?: boolean; is_closed_lost?: boolean }) => {
    if (!stage) return null;
    if (stage.is_closed_won) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
          {stage.stage_name}
        </span>
      );
    }
    if (stage.is_closed_lost) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400"></span>
          {stage.stage_name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
        {stage.stage_name}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden p-8 animate-pulse flex flex-col gap-4 shadow-xs">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <DollarSign className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Opportunities Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          No commercial deals match the current filter criteria or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Deal / Account</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Pipeline Stage</th>
              <th className="py-3.5 px-4 text-right">Value (ETB)</th>
              <th className="py-3.5 px-4 text-center">Probability</th>
              <th className="py-3.5 px-4">Closing Date</th>
              <th className="py-3.5 px-4">Owner</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {opportunities.map((opp) => {
              const isWon = opp.status === 'closed_won';
              const isLost = opp.status === 'closed_lost';

              return (
                <tr
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Account Name & Deal Title */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {opp.account?.organization_name || 'Corporate Account'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {opp.notes || opp.deal_name}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                      {opp.opportunity_type?.type_name || 'Commercial Deal'}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStageBadge(opp.stage)}
                  </td>

                  {/* Value */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900 dark:text-cyan-300">
                    {formatCurrency(opp.value)}
                  </td>

                  {/* Probability */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{opp.probability}%</span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isWon ? 'bg-emerald-500' : isLost ? 'bg-rose-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(opp.probability, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Close Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {opp.expected_close_date ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{new Date(opp.expected_close_date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Owner */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-[10px] text-cyan-700 dark:text-cyan-300 font-bold">
                        {opp.owner ? `${opp.owner.first_name[0]}${opp.owner.last_name[0]}` : 'IT'}
                      </div>
                      <span>{opp.owner?.first_name || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {isWon && (
                        <button
                          type="button"
                          onClick={() => onExportPms(opp)}
                          title="Export PMS Facility Handoff"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      {!isWon && !isLost && canEdit && (
                        <button
                          type="button"
                          onClick={() => onAdvanceStage(opp)}
                          title="Advance Stage"
                          className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEditOpportunity(opp)}
                          title="Edit Deal"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteOpportunity(opp)}
                          title="Delete Deal"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
