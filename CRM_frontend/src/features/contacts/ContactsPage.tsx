import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Building2,
  Star,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ContactsTable from './ContactsTable';
import ContactModal from './ContactModal';
import DeleteContactModal from './DeleteContactModal';
import contactService from '../../services/contactService';
import accountService from '../../services/accountService';
import { usePermission } from '../../hooks/usePermission';
import type { Contact, ContactFilters } from '../../types/contact';
import type { Account } from '../../types/account';

export const ContactsPage: React.FC = () => {
  const { can } = usePermission();
  const canCreateContact = can('contacts.create');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [primaryOnly, setPrimaryOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Accounts for dropdown filter (only when user can view accounts)
  useEffect(() => {
    if (!can('accounts.view')) return;
    const loadAccounts = async () => {
      try {
        const res = await accountService.getAccounts({ per_page: 100 });
        setAccounts(res.data);
      } catch (err) {
        console.error('Failed to load accounts for contacts filter:', err);
      }
    };
    loadAccounts();
  }, [can]);

  // Fetch Contacts
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filters: ContactFilters = {
        search: searchTerm.trim() || undefined,
        account_id: selectedAccountId !== 'all' ? selectedAccountId : undefined,
        is_primary: primaryOnly ? true : undefined,
        page: currentPage,
        per_page: 20,
      };

      const res = await contactService.getContacts(filters);
      setContacts(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
      setTotalCount(res.meta.total);
    } catch (err: unknown) {
      console.error('Failed to load contacts:', err);
      setErrorMessage('Failed to load stakeholder contacts.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedAccountId, primaryOnly, currentPage]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleSetPrimary = async (contact: Contact) => {
    try {
      await contactService.setPrimary(contact.id);
      setSuccessMessage(`${contact.name} is now the primary contact for ${contact.account?.organization_name || 'Account'}.`);
      fetchContacts();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(apiErr.response?.data?.message || 'Failed to update primary contact.');
    }
  };

  const handleContactSaved = (saved: Contact) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev];
    });
    setSuccessMessage(`Contact "${saved.name}" successfully saved.`);
    fetchContacts();
  };

  const handleContactDeleted = (deletedId: number) => {
    setContacts((prev) => prev.filter((c) => c.id !== deletedId));
    setSuccessMessage('Contact successfully deleted.');
    fetchContacts();
  };

  return (
    <AppShell
      title="Contacts Directory"
      subtitle="Ethiopian IT Park — Stakeholders, Founders, Executive Liaisons & Tenant Representatives"
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Stakeholder & Liaison Directory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60 font-mono">
                {totalCount} Contacts Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Maintain verified direct communication lines with founders, facility directors, managing partners, and primary technical liaisons.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContacts}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            >
              Refresh
            </Button>

            {canCreateContact && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Stakeholder
              </Button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search contact name, role, email, phone, or company..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Filter Dropdowns & Checkbox */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Filter:</span>
            </div>

            {/* Account Filter */}
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 max-w-[200px] truncate"
            >
              <option value="all">All Organizations</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.organization_name}
                </option>
              ))}
            </select>

            {/* Primary Only Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={primaryOnly}
                onChange={(e) => {
                  setPrimaryOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-white dark:bg-slate-900"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-current" />
                Primary Contacts Only
              </span>
            </label>

            {(searchTerm || selectedAccountId !== 'all' || primaryOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAccountId('all');
                  setPrimaryOnly(false);
                  setCurrentPage(1);
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Contacts Table */}
        <ContactsTable
          contacts={contacts}
          isLoading={isLoading}
          onEditContact={handleOpenEditModal}
          onDeleteContact={handleOpenDeleteModal}
          onSetPrimary={handleSetPrimary}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing page <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({totalCount} total)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contactToEdit={contactToEdit}
          accounts={accounts}
          onSaved={handleContactSaved}
        />

        <DeleteContactModal
          isOpen={isDeleteModalOpen}
          contact={contactToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleContactDeleted}
        />
      </div>
    </AppShell>
  );
};

export default ContactsPage;
