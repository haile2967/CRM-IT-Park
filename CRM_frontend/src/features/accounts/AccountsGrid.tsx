import React from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  Edit2,
  Trash2,
  Share2,
  ExternalLink,
  Users,
  ChevronRight,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import type { Account } from '../../types/account';

interface AccountsGridProps {
  accounts: Account[];
  isLoading: boolean;
  onSelectAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  onTransferOwnership: (account: Account) => void;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({
  accounts,
  isLoading,
  onSelectAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const { can } = usePermission();
  const canEdit = can('accounts.edit');
  const canDelete = can('accounts.delete');
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 space-y-4 animate-pulse shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-md" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-28 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a]/95 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No Corporate Accounts Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          No accounts matched your search criteria. Try resetting your active filters or create a new account.
        </p>
      </div>
    );
  }

  const getTypeBadgeClass = (typeName?: string) => {
    switch (typeName) {
      case 'Startup Incubatee':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
      case 'Commercial Park Tenant':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60';
      case 'Strategic Partner / Investor':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => {
        const primary = account.primary_contact;
        const typeName = account.account_type?.category_name || 'Corporate Account';

        return (
          <div
            key={account.id}
            onClick={() => onSelectAccount(account)}
            className="group p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:shadow-md transition-all duration-150 flex flex-col justify-between cursor-pointer space-y-4"
          >
            {/* Top Bar: Organization Header & Actions */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/20 dark:from-cyan-500/20 dark:to-blue-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50 flex items-center justify-center font-bold text-sm shrink-0">
                    {account.organization_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {account.organization_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[170px]">{account.industry || 'Technology'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                {(canEdit || canDelete) && (
                  <div
                    className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEditAccount(account)}
                        title="Edit Account"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteAccount(account)}
                        title="Delete Account"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Badges & Meta chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getTypeBadgeClass(
                    account.account_type?.category_name
                  )}`}
                >
                  {typeName}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[150px]">{account.location || 'Ethiopian IT Park'}</span>
                </div>
              </div>
            </div>

            {/* Primary Stakeholder Banner */}
            {primary ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {primary.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                    Primary
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="truncate">{primary.role_title || 'Liaison'}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {primary.email && (
                      <a
                        href={`mailto:${primary.email}`}
                        onClick={(e) => e.stopPropagation()}
                        title={primary.email}
                        className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {primary.phone && (
                      <a
                        href={`tel:${primary.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        title={primary.phone}
                        className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-[#0b1120]/60 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
                No primary contact registered
              </div>
            )}

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {account.contacts_count || 0}
                </span>
                <span className="text-[11px]">Contacts</span>
              </div>

              <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountsGrid;
