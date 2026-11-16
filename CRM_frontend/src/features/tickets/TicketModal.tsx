import React, { useState, useEffect } from 'react';
import { X, Building2, User, AlertCircle, Headphones } from 'lucide-react';
import type { CreateTicketPayload, Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types/ticket';
import type { Account } from '../../types/account';
import type { User as CRMUser } from '../../types/user';
import { ticketService } from '../../services/ticketService';
import { accountService } from '../../services/accountService';
import { userService } from '../../services/userService';

interface TicketModalProps {
  isOpen: boolean;
  ticketToEdit?: Ticket | null;
  onClose: () => void;
  onSaved: (ticket: Ticket) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  ticketToEdit,
  onClose,
  onSaved,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [accountId, setAccountId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [status, setStatus] = useState<TicketStatus>('open');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assigneeUserId, setAssigneeUserId] = useState<number | ''>('');

  useEffect(() => {
    if (!isOpen) return;

    const loadMetadata = async () => {
      try {
        setIsLoadingMetadata(true);
        const [accountsRes, categoriesRes, usersRes] = await Promise.all([
          accountService.getAccounts({ per_page: 100 }),
          ticketService.getCategories(),
          userService.getUsers().catch(() => []),
        ]);

        setAccounts(accountsRes.data);
        setCategories(categoriesRes);
        setUsers(usersRes);

        if (ticketToEdit) {
          setAccountId(ticketToEdit.account_id);
          setCategoryId(ticketToEdit.category_id);
          setPriority(ticketToEdit.priority);
          setStatus(ticketToEdit.status);
          setSubject(ticketToEdit.subject);
          setDescription(ticketToEdit.description || '');
          setAssigneeUserId(ticketToEdit.assignee_user_id || '');
        } else {
          setAccountId(accountsRes.data[0]?.id || '');
          setCategoryId(categoriesRes[0]?.id || '');
          setPriority('Medium');
          setStatus('open');
          setSubject('');
          setDescription('');
          setAssigneeUserId('');
        }
      } catch (err) {
        console.error('Failed to load ticket metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [isOpen, ticketToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !categoryId || !subject.trim()) {
      setError('Please select an account, category, and enter a ticket subject.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (ticketToEdit) {
        const updated = await ticketService.updateTicket(ticketToEdit.id, {
          account_id: Number(accountId),
          category_id: Number(categoryId),
          priority,
          status,
          subject: subject.trim(),
          description: description.trim() || undefined,
          assignee_user_id: assigneeUserId ? Number(assigneeUserId) : null,
        });
        onSaved(updated);
      } else {
        const created = await ticketService.createTicket({
          account_id: Number(accountId),
          category_id: Number(categoryId),
          priority,
          status,
          subject: subject.trim(),
          description: description.trim() || undefined,
          assignee_user_id: assigneeUserId ? Number(assigneeUserId) : null,
        });
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save ticket:', err);
      setError(err.response?.data?.message || 'Failed to save support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {ticketToEdit ? `Edit Ticket (${ticketToEdit.ticket_number})` : 'Create Support Ticket'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log and assign a customer service issue or technical inquiry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Organization / Tenant */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tenant Account / Company *
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}
              required
              disabled={isLoadingMetadata}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select Tenant Account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.organization_name} {acc.industry ? `(${acc.industry})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category / Classification *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                required
                disabled={isLoadingMetadata}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Urgent">Urgent (2h SLA / P1)</option>
                <option value="High">High (4h SLA / P2)</option>
                <option value="Medium">Medium (12h SLA / P3)</option>
                <option value="Low">Low (24h SLA / P4)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ticket Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Fiber link down between Block A & Data Center"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Description & Symptoms
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail error codes, affected equipment, or customer request..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Assignee & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee Engineer
              </label>
              <select
                value={assigneeUserId}
                onChange={(e) => setAssigneeUserId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Leave Unassigned (Shared Queue)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {isSubmitting ? 'Saving...' : ticketToEdit ? 'Update Ticket' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
