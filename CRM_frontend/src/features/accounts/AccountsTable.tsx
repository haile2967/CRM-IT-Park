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
} from 'lucide-react';
import type { Account } from '../../types/account';

interface AccountsTableProps {
  accounts: Account[];
  isLoading: boolean;
  onSelectAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  onTransferOwnership: (account: Account) => void;
  canManage?: boolean;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  isLoading,
  onSelectAccount,
  onEditAccount,
  onDeleteAccount,
  onTransferOwnership,
  canManage = true,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 overflow-hidden shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-md" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
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
          No accounts matched your search criteria or filter options. Convert a qualified lead or create a new corporate account.
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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-[#0b1120]/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <th className="py-3.5 pl-6 pr-3">Organization</th>
              <th className="py-3.5 px-3">Account Type</th>
              <th className="py-3.5 px-3">Industry / Sector</th>
              <th className="py-3.5 px-3">Primary Contact</th>
              <th className="py-3.5 px-3">Location / Facility</th>
              <th className="py-3.5 px-3">Owner</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {accounts.map((account) => {
              const primary = account.primary_contact;
              const typeName = account.account_type?.category_name || 'Corporate Account';

              return (
                <tr
                  key={account.id}
                  onClick={() => onSelectAccount(account)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100 cursor-pointer"
                >
                  {/* Organization Name & Initials */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/20 dark:from-cyan-500/20 dark:to-blue-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50 flex items-center justify-center font-bold text-xs shrink-0">
                        {account.organization_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                          {account.organization_name}
                        </span>
                        {account.contact_information?.website ? (
                          <a
                            href={account.contact_information.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 inline-flex"
                          >
                            <span>{account.contact_information.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            ID #{account.id}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Account Type Badge */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeClass(
                        account.account_type?.category_name
                      )}`}
                    >
                      {typeName}
                    </span>
                  </td>

                  {/* Industry Sector */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[170px]">{account.industry || 'Not specified'}</span>
                    </div>
                  </td>

                  {/* Primary Stakeholder */}
                  <td className="py-4 px-3">
                    {primary ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[140px]">
                            {primary.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[140px]">
                          {primary.role_title || 'Primary Contact'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                        No primary contact
                      </span>
                    )}
                  </td>

                  {/* Facility Location */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[160px]">{account.location || 'Ethiopian IT Park'}</span>
                    </div>
                  </td>

                  {/* Portfolio Owner */}
                  <td className="py-4 px-3">
                    {account.owner ? (
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block max-w-[120px]">
                        {account.owner.first_name} {account.owner.last_name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectAccount(account)}
                        title="View Account Details & Contacts"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => onTransferOwnership(account)}
                            title="Transfer Account Ownership"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditAccount(account)}
                            title="Edit Corporate Profile"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteAccount(account)}
                            title="Delete Account"
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
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

export default AccountsTable;
