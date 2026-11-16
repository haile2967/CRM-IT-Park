import React, { useState, useEffect } from 'react';
import { X, UserCheck, Check, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import contactService from '../../services/contactService';
import type { Contact, CreateContactPayload, UpdateContactPayload } from '../../types/contact';
import type { Account } from '../../types/account';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: Contact | null;
  targetAccount?: Account | null;
  accounts?: Account[];
  onSaved: (contact: Contact) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactToEdit,
  targetAccount,
  accounts = [],
  onSaved,
}) => {
  const isEditing = Boolean(contactToEdit);

  const [accountId, setAccountId] = useState<number | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setAccountId(contactToEdit.account_id);
      setFirstName(contactToEdit.first_name);
      setLastName(contactToEdit.last_name);
      setRoleTitle(contactToEdit.role_title || '');
      setEmail(contactToEdit.email || '');
      setPhone(contactToEdit.phone || '');
      setIsPrimary(contactToEdit.is_primary);
      setErrorMessage(null);
    } else {
      setAccountId(targetAccount?.id || (accounts[0]?.id || ''));
      setFirstName('');
      setLastName('');
      setRoleTitle('Liaison / Director');
      setEmail('');
      setPhone('');
      setIsPrimary(false);
      setErrorMessage(null);
    }
  }, [contactToEdit, targetAccount, accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!accountId) {
      setErrorMessage('Please select a parent organization.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and last name are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && contactToEdit) {
        const payload: UpdateContactPayload = {
          account_id: Number(accountId),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role_title: roleTitle.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_primary: isPrimary,
        };

        const updated = await contactService.updateContact(contactToEdit.id, payload);
        onSaved(updated);
        onClose();
      } else {
        const payload: CreateContactPayload = {
          account_id: Number(accountId),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role_title: roleTitle.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_primary: isPrimary,
        };

        const created = await contactService.createContact(payload);
        onSaved(created);
        onClose();
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(apiErr.response?.data?.message || 'Failed to save contact person.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1120]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Stakeholder Contact' : 'Add Stakeholder Contact'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetAccount ? targetAccount.organization_name : 'Contact person directory'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Account Selection (if not locked to targetAccount) */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Organization / Account <span className="text-rose-500">*</span>
            </label>
            {targetAccount ? (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {targetAccount.organization_name}
              </div>
            ) : (
              <select
                value={accountId}
                onChange={(e) => setAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                required
              >
                <option value="" disabled>Select parent organization</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.organization_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Name Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Dawit"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Kebede"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Role Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Role / Designation Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Managing Director, Lead Architect"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Direct Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dawit@company.et"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Direct Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Primary Contact Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-white dark:bg-slate-900"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${isPrimary ? 'text-amber-500 fill-current' : 'text-slate-400'}`} />
                Designate as Primary Point of Contact
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isEditing ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
