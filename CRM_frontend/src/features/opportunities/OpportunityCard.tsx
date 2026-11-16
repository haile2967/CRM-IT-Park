import React from 'react';
import {
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { Opportunity } from '../../types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opportunity: Opportunity) => void;
  onAdvanceStage?: (opportunity: Opportunity) => void;
  onExportPms?: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onAdvanceStage,
  onExportPms,
}) => {
  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `ETB ${(val / 1000).toFixed(0)}k`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'closed_won':
        return 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5 hover:border-emerald-400 dark:hover:border-emerald-500/70';
      case 'closed_lost':
        return 'border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-500/5 hover:border-rose-400 dark:hover:border-rose-500/70';
      default:
        return 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-cyan-400 dark:hover:border-cyan-500/40 shadow-xs dark:shadow-none';
    }
  };

  const getTypeBadge = (typeName?: string) => {
    switch (typeName) {
      case 'Commercial Park Lease':
        return 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30';
      case 'Investment':
        return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      case 'Partnership':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'Program Enrollment':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50';
    }
  };

  const isWon = opportunity.status === 'closed_won';
  const isLost = opportunity.status === 'closed_lost';

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer backdrop-blur-sm ${getStageColor(
        opportunity.status
      )} hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] hover:-translate-y-0.5`}
    >
      {/* Top Row: Type Badge + Probability */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeBadge(
            opportunity.opportunity_type?.type_name
          )}`}
        >
          {opportunity.opportunity_type?.type_name || 'Commercial Deal'}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{opportunity.probability}%</span>
        </div>
      </div>

      {/* Account / Deal Name */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
          {opportunity.account?.organization_name || 'Corporate Account'}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{opportunity.account?.industry || 'Technology'}</span>
        </div>
      </div>

      {/* Deal Value */}
      <div className="mb-3">
        <div className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-mono">
          {formatCurrency(opportunity.value)}
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWon
                ? 'bg-emerald-500'
                : isLost
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.min(opportunity.probability, 100)}%` }}
          />
        </div>
      </div>

      {/* Card Footer: Owner & Expected Close Date */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-[10px] text-cyan-700 dark:text-cyan-300 font-bold">
            {opportunity.owner
              ? `${opportunity.owner.first_name[0]}${opportunity.owner.last_name[0]}`
              : 'IT'}
          </div>
          <span className="truncate max-w-[80px]">
            {opportunity.owner?.first_name || 'Assigned'}
          </span>
        </div>

        {opportunity.expected_close_date && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{new Date(opportunity.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Quick Action Badges */}
      <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50">
        {isWon ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExportPms?.(opportunity);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PMS Facility Handoff</span>
            <Download className="w-3 h-3 ml-auto opacity-70" />
          </button>
        ) : !isLost && onAdvanceStage ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStage(opportunity);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/50 text-xs font-medium transition-colors"
          >
            <span>Advance Stage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto text-cyan-600 dark:text-cyan-400" />
          </button>
        ) : (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Closed Lost</span>
        )}
      </div>
    </div>
  );
};
