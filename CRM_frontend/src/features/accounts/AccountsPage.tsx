import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Users,
  Briefcase,
  Rocket,
  Handshake,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import AccountsTable from './AccountsTable';
import AccountsGrid from './AccountsGrid';
import AccountDrawer from './AccountDrawer';
import AccountModal from './AccountModal';
import DeleteAccountModal from './DeleteAccountModal';
import TransferOwnershipModal from './TransferOwnershipModal';
import ContactModal from '../contacts/ContactModal';
import accountService from '../../services/accountService';
import { usePermission } from '../../hooks/usePermission';
import type { Account, AccountMetrics, AccountType, AccountFilters } from '../../types/account';
import type { Contact } from '../../types/contact';

export const AccountsPage: React.FC = () => {
  const { can } = usePermission();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [metrics, setMetrics] = useState<AccountMetrics>({
    total: 0,
    commercial_tenants: 0,
    startup_incubatees: 0,
    partners_investors: 0,
    unassigned: 0,
  });
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View mode switcher: 'table' | 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Drawer State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [accountToTransfer, setAccountToTransfer] = useState<Account | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [accountForNewContact, setAccountForNewContact] = useState<Account | null>(null);

  // Feedback Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreateAccount = can('accounts.create');

  // Fetch Accounts and Metrics
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filters: AccountFilters = {
        search: searchTerm.trim() || undefined,
        account_type_id: selectedType !== 'all' ? selectedType : undefined,
        page: currentPage,
        per_page: 15,
      };

      const [accountsRes, metricsRes, typesRes] = await Promise.all([
        accountService.getAccounts(filters),
        accountService.getMetrics(),
        accountTypes.length === 0 ? accountService.getAccountTypes() : Promise.resolve(accountTypes),
      ]);

      setAccounts(accountsRes.data);
      setCurrentPage(accountsRes.meta.current_page);
      setTotalPages(accountsRes.meta.last_page);
      setTotalCount(accountsRes.meta.total);
      setMetrics(metricsRes);

      if (accountTypes.length === 0) {
        setAccountTypes(typesRes);
      }
    } catch (err: unknown) {
      console.error('Failed to load corporate accounts:', err);
      setErrorMessage('Failed to load accounts. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedType, currentPage, accountTypes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Drawer handlers
  const handleSelectAccount = async (account: Account) => {
    setSelectedAccount(account);
    setIsDrawerOpen(true);
    try {
      const detailed = await accountService.getAccount(account.id);
      setSelectedAccount(detailed);
    } catch (err) {
      console.error('Failed to fetch detailed account record:', err);
    }
  };

  // Modal triggers
  const handleOpenCreateModal = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setAccountToEdit(account);
    setIsAccountModalOpen(true);
  };

  const handleOpenDeleteModal = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleOpenTransferModal = (account: Account) => {
    setAccountToTransfer(account);
    setIsTransferModalOpen(true);
  };

  const handleOpenAddContactModal = (account: Account) => {
    setAccountForNewContact(account);
    setIsContactModalOpen(true);
  };

  // Mutator Callbacks
  const handleAccountSaved = (saved: Account) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : a));
      }
      return [saved, ...prev];
    });

    if (selectedAccount?.id === saved.id) {
      setSelectedAccount(saved);
    }

    setSuccessMessage(`Account "${saved.organization_name}" successfully ${accountToEdit ? 'updated' : 'created'}.`);
    fetchData();
  };

  const handleAccountDeleted = (deletedId: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== deletedId));
    if (selectedAccount?.id === deletedId) {
      setIsDrawerOpen(false);
      setSelectedAccount(null);
    }
    setSuccessMessage('Account deleted successfully.');
    fetchData();
  };

  const handleOwnershipTransferred = (updated: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedAccount?.id === updated.id) {
      setSelectedAccount(updated);
    }
    setSuccessMessage(`Account ownership transferred to ${updated.owner ? `${updated.owner.first_name} ${updated.owner.last_name}` : 'new owner'}.`);
  };

  const handleContactSaved = (newContact: Contact) => {
    if (selectedAccount && selectedAccount.id === newContact.account_id) {
      const existingContacts = (selectedAccount as unknown as { contacts?: Contact[] }).contacts || [];
      const updatedContacts = [newContact, ...existingContacts];
      setSelectedAccount({
        ...selectedAccount,
        contacts_count: (selectedAccount.contacts_count || 0) + 1,
        ...({ contacts: updatedContacts } as object),
      });
    }
    setSuccessMessage(`Contact "${newContact.first_name} ${newContact.last_name}" added.`);
    fetchData();
  };

  return (
    <AppShell
      title="Corporate Accounts"
      subtitle="Ethiopian IT Park — Tenants, Startup Incubatees & Strategic Partner Organizations"
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

        {/* Top Header Banner & Action Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Corporate Directory & Tenant Portfolios
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60 font-mono">
                {totalCount} Total Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Official registry of technology enterprises, startup incubatees, and strategic partners leasing facilities or participating in Ethiopian IT Park ecosystems.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            >
              Refresh
            </Button>

            {canCreateAccount && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Corporate Account
              </Button>
            )}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Accounts */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Accounts</span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              Registered organizations
            </span>
          </div>

          {/* Commercial Park Tenants */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Commercial Tenants</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/60">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-700 dark:text-cyan-400 font-mono">
              {metrics.commercial_tenants}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 block">
              Active facility & data leases
            </span>
          </div>

          {/* Startup Incubatees */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Startup Incubatees</span>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/60">
                <Rocket className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-400 font-mono">
              {metrics.startup_incubatees}
            </div>
            <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium mt-0.5 block">
              Innovation cohort ventures
            </span>
          </div>

          {/* Strategic Partners & Investors */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Partners & Capital</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                <Handshake className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {metrics.partners_investors}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 block">
              Funding & institutional ties
            </span>
          </div>
        </div>

        {/* Filter and View Switcher Toolbar */}
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
              placeholder="Search company, industry, or contact..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Filter Dropdowns & View Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Filter:</span>
            </div>

            {/* Account Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            >
              <option value="all">All Account Types</option>
              {accountTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.category_name}
                </option>
              ))}
            </select>

            {(searchTerm || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setCurrentPage(1);
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}

            {/* View Mode Switcher: Table vs Cards */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/80 ml-2">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Dense Table View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#0f172a] text-cyan-700 dark:text-cyan-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Visual Card Grid View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#0f172a] text-cyan-700 dark:text-cyan-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area (Table or Grid) */}
        {viewMode === 'table' ? (
          <AccountsTable
            accounts={accounts}
            isLoading={isLoading}
            onSelectAccount={handleSelectAccount}
            onEditAccount={handleOpenEditModal}
            onDeleteAccount={handleOpenDeleteModal}
            onTransferOwnership={handleOpenTransferModal}
          />
        ) : (
          <AccountsGrid
            accounts={accounts}
            isLoading={isLoading}
            onSelectAccount={handleSelectAccount}
            onEditAccount={handleOpenEditModal}
            onDeleteAccount={handleOpenDeleteModal}
            onTransferOwnership={handleOpenTransferModal}
          />
        )}

        {/* Pagination Bar */}
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

        {/* Modals & Drawer */}
        <AccountDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          account={selectedAccount}
          onEditAccount={handleOpenEditModal}
          onAddContact={handleOpenAddContactModal}
          onTransferOwnership={handleOpenTransferModal}
        />

        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          accountToEdit={accountToEdit}
          accountTypes={accountTypes}
          onSaved={handleAccountSaved}
        />

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          account={accountToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleAccountDeleted}
        />

        <TransferOwnershipModal
          isOpen={isTransferModalOpen}
          account={accountToTransfer}
          onClose={() => setIsTransferModalOpen(false)}
          onTransferred={handleOwnershipTransferred}
        />

        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          targetAccount={accountForNewContact}
          onSaved={handleContactSaved}
        />
      </div>
    </AppShell>
  );
};

export default AccountsPage;
