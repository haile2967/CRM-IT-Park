import React from 'react';
import { AlertTriangle, ExternalLink, User } from 'lucide-react';
import type { DuplicateMatch } from '../../types/lead';

interface DuplicateWarningAlertProps {
  duplicates: DuplicateMatch[];
  onSelectDuplicate?: (leadId: number) => void;
}

export const DuplicateWarningAlert: React.FC<DuplicateWarningAlertProps> = ({
  duplicates,
  onSelectDuplicate,
}) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2.5 animate-fadeIn">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold tracking-tight text-amber-950 dark:text-amber-300">
            Duplicate Warning: {duplicates.length} Potential Match{duplicates.length > 1 ? 'es' : ''} Found
          </h4>
          <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed mt-0.5">
            An existing lead matches the email, phone number, or company name you entered.
          </p>
        </div>
      </div>

      <div className="space-y-1.5 pl-6">
        {duplicates.map((dup) => (
          <div
            key={dup.id}
            className="p-2 rounded-md bg-white/90 dark:bg-[#0b1120] border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs shadow-2xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{dup.name}</span>
                {dup.organization && (
                  <span className="text-slate-500 dark:text-slate-400 font-medium truncate">({dup.organization})</span>
                )}
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono">
                  Matched: {dup.matched_fields.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  Owner: {dup.owner_name}
                </span>
                <span>·</span>
                <span className="capitalize">Status: {dup.status}</span>
              </div>
            </div>

            {onSelectDuplicate && (
              <button
                type="button"
                onClick={() => onSelectDuplicate(dup.id)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 hover:underline shrink-0 px-2 py-1 rounded-sm hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10.5px] text-amber-700 dark:text-amber-400 pl-6 italic">
        Tip: To avoid duplicate records, you can inspect the existing lead or proceed to force creation if this represents a distinct division or inquiry.
      </p>
    </div>
  );
};

export default DuplicateWarningAlert;
