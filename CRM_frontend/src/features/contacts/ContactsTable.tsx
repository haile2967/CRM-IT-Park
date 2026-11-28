import React from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  Star,
  Edit2,
  Trash2,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import type { Contact } from '../../types/contact';

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onSetPrimary: (contact: Contact) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  isLoading,
  onEditContact,
  onDeleteContact,
  onSetPrimary,
}) => {
  const { can } = usePermission();
  const canEdit = can('contacts.edit');
  const canDelete = can('contacts.delete');
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 overflow-hidden shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-md" />
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a]/95 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No Stakeholders Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          No contacts matched your search or filters. Add a new stakeholder to an organization.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/95 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-[#0b1120]/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <th className="py-3.5 pl-6 pr-3">Stakeholder</th>
              <th className="py-3.5 px-3">Role / Designation</th>
              <th className="py-3.5 px-3">Organization</th>
              <th className="py-3.5 px-3">Email Address</th>
              <th className="py-3.5 px-3">Direct Phone</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100"
              >
                {/* Stakeholder Name & Primary Indicator */}
                <td className="py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.is_primary && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        ID #{contact.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Role Title */}
                <td className="py-4 px-3">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {contact.role_title || 'Stakeholder'}
                  </span>
                </td>

                {/* Organization Name */}
                <td className="py-4 px-3">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate max-w-[170px]">
                      {contact.account?.organization_name || 'Unassigned'}
                    </span>
                  </div>
                </td>

                {/* Email Address */}
                <td className="py-4 px-3">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.email}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">None</span>
                  )}
                </td>

                {/* Phone Number */}
                <td className="py-4 px-3">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1.5 font-mono"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">None</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 pl-3 pr-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <>
                        {!contact.is_primary && (
                          <button
                            type="button"
                            onClick={() => onSetPrimary(contact)}
                            title="Set as Primary Contact for this organization"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEditContact(contact)}
                          title="Edit Contact Details"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteContact(contact)}
                        title="Delete Contact"
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
