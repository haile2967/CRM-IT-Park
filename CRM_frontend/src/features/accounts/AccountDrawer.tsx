import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  UserCheck,
  User,
  Plus,
  Star,
  ExternalLink,
  Edit2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import type { Account } from '../../types/account';
import type { Contact } from '../../types/contact';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onEditAccount: (account: Account) => void;
  onAddContact: (account: Account) => void;
  onTransferOwnership: (account: Account) => void;
  canManage?: boolean;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  isOpen,
  onClose,
  account,
  onEditAccount,
  onAddContact,
  onTransferOwnership,
  canManage = true,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'deals'>('profile');

  if (!isOpen || !account) return null;

  const contacts = (account as unknown as { contacts?: Contact[] }).contacts || [];
  const opportunities = (account as unknown as { opportunities?: Array<{ id: number; value: number; status: string; stage?: { stage_name: string } }> }).opportunities || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1120] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/20 dark:from-cyan-500/20 dark:to-blue-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50 flex items-center justify-center font-bold text-base shrink-0">
              {account.organization_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {account.organization_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60">
                  {account.account_type?.category_name || 'Corporate Account'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  ID #{account.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canManage && (
              <button
                type="button"
                onClick={() => onEditAccount(account)}
                title="Edit Account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Corporate Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contacts'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Stakeholders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {contacts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'deals'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Deals & Leases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {opportunities.length}
            </span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CORPORATE PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Primary Facility Information */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                  Facility & Sector
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      {account.location || 'Ethiopian IT Park'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Industry Vertical</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      {account.industry || 'Technology'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Portfolio Owner</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {account.owner ? `${account.owner.first_name} ${account.owner.last_name}` : 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Onboarded On</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block mt-0.5">
                      {new Date(account.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                  Corporate Communication Channels
                </span>
                <div className="space-y-2">
                  {account.contact_information?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a
                        href={`mailto:${account.contact_information.email}`}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        {account.contact_information.email}
                      </a>
                    </div>
                  )}
                  {account.contact_information?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${account.contact_information.phone}`}
                        className="text-slate-700 dark:text-slate-300 hover:underline font-mono"
                      >
                        {account.contact_information.phone}
                      </a>
                    </div>
                  )}
                  {account.contact_information?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <a
                        href={account.contact_information.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{account.contact_information.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Engagement Notes */}
              {account.engagement_history && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                    Engagement History & Notes
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {account.engagement_history}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAKEHOLDERS & CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                  Associated Contacts ({contacts.length})
                </span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onAddContact(account)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60 flex items-center gap-1 hover:bg-cyan-100/70 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact</span>
                  </button>
                )}
              </div>

              {contacts.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400">
                  No stakeholders registered for this account yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1120] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {contact.first_name} {contact.last_name}
                          </span>
                          {contact.is_primary && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Primary Contact
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {contact.role_title || 'Stakeholder'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            title={contact.email}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            title={contact.phone}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEALS & LEASES */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                Commercial Deals & Contracts
              </span>

              {opportunities.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400">
                  No commercial deals or leases currently recorded for this account.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {opportunities.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1120] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          Commercial Agreement #{deal.id}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Stage: {deal.stage?.stage_name || 'In Negotiation'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 block">
                          ETB {Number(deal.value || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 uppercase font-semibold">
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1120] flex items-center justify-between gap-3">
          {canManage && (
            <button
              type="button"
              onClick={() => onTransferOwnership(account)}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDrawer;
