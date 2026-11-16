import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Check,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import accountService from '../../services/accountService';
import type { Account, AccountType, CreateAccountPayload, UpdateAccountPayload } from '../../types/account';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  accountTypes: AccountType[];
  onSaved: (account: Account) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  accountTypes,
  onSaved,
}) => {
  const isEditing = Boolean(accountToEdit);

  // Form State
  const [organizationName, setOrganizationName] = useState('');
  const [accountTypeId, setAccountTypeId] = useState<number | ''>('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Optional Primary Contact (for Create mode)
  const [includePrimaryContact, setIncludePrimaryContact] = useState(false);
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactRoleTitle, setContactRoleTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accountToEdit) {
      setOrganizationName(accountToEdit.organization_name);
      setAccountTypeId(accountToEdit.account_type_id);
      setIndustry(accountToEdit.industry || '');
      setLocation(accountToEdit.location || '');
      setEmail(accountToEdit.contact_information?.email || '');
      setPhone(accountToEdit.contact_information?.phone || '');
      setWebsite(accountToEdit.contact_information?.website || '');
      setNotes(accountToEdit.engagement_history || '');
      setIncludePrimaryContact(false);
      setErrorMessage(null);
    } else {
      setOrganizationName('');
      setAccountTypeId(accountTypes[0]?.id || '');
      setIndustry('');
      setLocation('Ethiopian IT Park, Addis Ababa');
      setEmail('');
      setPhone('');
      setWebsite('');
      setNotes('');
      setIncludePrimaryContact(false);
      setContactFirstName('');
      setContactLastName('');
      setContactRoleTitle('Primary Contact / Founder');
      setContactEmail('');
      setContactPhone('');
      setErrorMessage(null);
    }
  }, [accountToEdit, isOpen, accountTypes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!organizationName.trim()) {
      setErrorMessage('Organization name is required.');
      return;
    }

    if (!accountTypeId) {
      setErrorMessage('Please select an account type.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && accountToEdit) {
        const payload: UpdateAccountPayload = {
          organization_name: organizationName.trim(),
          account_type_id: Number(accountTypeId),
          industry: industry.trim() || undefined,
          location: location.trim() || undefined,
          contact_information: {
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            website: website.trim() || undefined,
          },
          engagement_history: notes.trim() || undefined,
        };

        const updated = await accountService.updateAccount(accountToEdit.id, payload);
        onSaved(updated);
        onClose();
      } else {
        const payload: CreateAccountPayload = {
          organization_name: organizationName.trim(),
          account_type_id: Number(accountTypeId),
          industry: industry.trim() || undefined,
          location: location.trim() || undefined,
          contact_information: {
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            website: website.trim() || undefined,
          },
          engagement_history: notes.trim() || undefined,
        };

        if (includePrimaryContact && contactFirstName.trim() && contactLastName.trim()) {
          payload.primary_contact = {
            first_name: contactFirstName.trim(),
            last_name: contactLastName.trim(),
            role_title: contactRoleTitle.trim() || 'Primary Contact',
            email: contactEmail.trim() || undefined,
            phone: contactPhone.trim() || undefined,
          };
        }

        const created = await accountService.createAccount(payload);
        onSaved(created);
        onClose();
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const responseData = apiErr.response?.data;
      if (responseData?.errors) {
        const firstKey = Object.keys(responseData.errors)[0];
        setErrorMessage(responseData.errors[firstKey][0]);
      } else {
        setErrorMessage(responseData?.message || 'Failed to save account. Please check your entries.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1120]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isEditing ? `Edit Corporate Account` : 'New Corporate Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? `Update organization profile for ${accountToEdit?.organization_name}`
                  : 'Register a tenant company, startup incubatee, or partner organization'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Organization Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Organization / Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. Abyssinia Cloud Tech PLC"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              required
            />
          </div>

          {/* Account Type & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Account Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={accountTypeId}
                onChange={(e) => setAccountTypeId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                required
              >
                <option value="" disabled>Select account type</option>
                {accountTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Industry / Sector
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Fintech, Cloud & AI, BPO"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Facility Location */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Facility Location / Office Suite
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Building B, 2nd Floor, Phase 1"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Contact Details (Email, Phone, Website) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.et"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.et"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Engagement Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Engagement History & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Park lease specifications, incubation track goals, or partner agreements..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Optional Inline Primary Contact Section (Only when creating) */}
          {!isEditing && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={() => setIncludePrimaryContact(!includePrimaryContact)}
                className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Register Primary Contact Person (Optional)</span>
                </span>
                {includePrimaryContact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {includePrimaryContact && (
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0b1120]/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactFirstName}
                        onChange={(e) => setContactFirstName(e.target.value)}
                        placeholder="e.g. Dawit"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactLastName}
                        onChange={(e) => setContactLastName(e.target.value)}
                        placeholder="e.g. Kebede"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={contactRoleTitle}
                        onChange={(e) => setContactRoleTitle(e.target.value)}
                        placeholder="Managing Director"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Direct Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="dawit@company.et"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Direct Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+251 91 123 4567"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              {isEditing ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
