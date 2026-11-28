import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Send,
  Lock,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import type { Ticket, TicketComment, TicketStatus } from '../../types/ticket';
import { PriorityBadge, StatusBadge, InactivityBadge } from './TicketStatusBadge';
import { ticketService } from '../../services/ticketService';

interface TicketDrawerProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: (ticket: Ticket) => void;
  currentUserId?: number;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdated,
  currentUserId,
}) => {
  const { can } = usePermission();
  const canEdit = can('tickets.edit');
  const canAssign = can('tickets.assign');
  const canEscalate = can('tickets.escalate');
  const [activeTab, setActiveTab] = useState<'conversation' | 'details' | 'escalation'>('conversation');
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  if (!isOpen || !ticket) return null;

  const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';
  const isAssignedToMe = currentUserId && ticket.assignee_user_id === currentUserId;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await ticketService.addComment(ticket.id, {
        comment_text: commentText.trim(),
        is_internal: isInternal,
      });

      setCommentText('');
      // Reload fresh ticket data
      const refreshed = await ticketService.getTicket(ticket.id);
      onTicketUpdated(refreshed);
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      setActionError(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await ticketService.claimTicket(ticket.id);
      onTicketUpdated(updated);
    } catch (err: any) {
      console.error('Failed to claim ticket:', err);
      setActionError(err.response?.data?.message || 'Failed to claim ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await ticketService.updateStatus(ticket.id, status);
      const refreshed = await ticketService.getTicket(ticket.id);
      onTicketUpdated(refreshed);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setActionError(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    try {
      await ticketService.escalateTicket(ticket.id, escalateReason.trim() || undefined);
      setIsEscalateModalOpen(false);
      setEscalateReason('');
      const refreshed = await ticketService.getTicket(ticket.id);
      onTicketUpdated(refreshed);
    } catch (err: any) {
      console.error('Failed to escalate ticket:', err);
      setActionError(err.response?.data?.message || 'Failed to escalate ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
                    {ticket.ticket_number}
                  </span>
                  <PriorityBadge priority={ticket.priority} size="sm" />
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {ticket.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ticket.account?.organization_name || 'Direct Tenant'}</span>
                  </div>
                  <span>•</span>
                  <span>{ticket.category?.category_name || 'General Support'}</span>
                  {ticket.contact && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {ticket.contact.first_name} {ticket.contact.last_name}
                      </span>
                      {ticket.contact.phone && (
                        <a
                          href={`tel:${ticket.contact.phone}`}
                          className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{ticket.contact.phone}</span>
                        </a>
                      )}
                    </>
                  )}
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

            {/* Inactivity & Escalation Alert Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
              <InactivityBadge
                state={ticket.inactivity_state}
                elapsedMinutes={ticket.elapsed_inactivity_minutes}
                isEscalated={ticket.escalated}
              />

              <div className="flex items-center gap-2">
                {!ticket.assignee_user_id && canAssign && (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Claim Ticket</span>
                  </button>
                )}

                {canEscalate && !ticket.escalated && !isResolvedOrClosed && (
                  <button
                    type="button"
                    onClick={() => setIsEscalateModalOpen(true)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/50 font-semibold text-xs transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Action Controls */}
          <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              <StatusBadge status={ticket.status} size="sm" />
            </div>
            {canEdit && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] mr-1 hidden sm:inline">Set Status:</span>
                {ticket.status !== 'open' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('open')}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Open
                  </button>
                )}
                {ticket.status !== 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 font-medium text-amber-600 dark:text-amber-400 transition-colors"
                  >
                    In Progress
                  </button>
                )}
                {ticket.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-xs transition-colors"
                  >
                    Resolve
                  </button>
                )}
                {ticket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('closed')}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold text-white shadow-xs transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800/80 px-6 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('conversation')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'conversation'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversation ({ticket.comments?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Client & Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('escalation')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'escalation'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalation History ({ticket.escalation_histories?.length || 0})</span>
            </button>
          </div>

          {/* Action Error Banner */}
          {actionError && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400">
              {actionError}
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'conversation' && (
              <div className="space-y-6">
                {/* Initial Description Card */}
                {ticket.description && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Initial Request Description
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>
                )}

                {/* Comment Feed */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Activity & Communication Stream
                  </div>

                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          comment.is_internal
                            ? 'bg-amber-50/70 dark:bg-amber-950/25 border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900/40'
                            : 'bg-white dark:bg-slate-800/70 border-l-4 border-l-cyan-500 border-slate-200 dark:border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                comment.is_internal
                                  ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300'
                              }`}
                            >
                              {comment.user?.first_name?.[0] || 'S'}
                              {comment.user?.last_name?.[0] || 'A'}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'System Admin'}
                            </span>
                            {comment.is_internal && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Internal Note</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pl-7">
                          {comment.comment_text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No communications recorded yet. Use the response box below to write to the tenant or leave an internal team note.
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                {canEdit && (
                  <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Add Reply or Team Note:
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setIsInternal(false)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          !isInternal
                            ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Public Customer Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternal(true)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          isInternal
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Internal Note</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      isInternal
                        ? 'Write a private staff note (hidden from customer, visible to IT Park team)...'
                        : 'Write official response to the customer...'
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-xs"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isInternal ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Note will reset inactivity timer & clear live escalation.
                        </span>
                      ) : (
                        <span>Customer will be notified on portal.</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmitting}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-semibold text-xs transition-colors shadow-xs ${
                        isInternal
                          ? 'bg-amber-600 hover:bg-amber-500 disabled:opacity-40'
                          : 'bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInternal ? 'Save Internal Note' : 'Post Reply'}</span>
                    </button>
                  </div>
                </form>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Tenant Account Profile
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">Company Name</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {ticket.account?.organization_name || 'Direct Tenant'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">Industry Sector</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {ticket.account?.industry || 'Information Technology'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">Park Location</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {ticket.account?.location || 'Addis Ababa IT Park'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">Current Assignee</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {ticket.contact && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Designated Contact Person
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400 dark:text-slate-500">Full Name</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {ticket.contact.first_name} {ticket.contact.last_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 dark:text-slate-500">Role / Title</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {ticket.contact.role_title || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 dark:text-slate-500">Email Address</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.contact.email || 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 dark:text-slate-500">Phone Number</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.contact.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'escalation' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Audit trail of SLA reminder triggers and managerial escalations for this ticket.
                </div>

                {ticket.escalation_histories && ticket.escalation_histories.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {ticket.escalation_histories.map((hist) => (
                      <div key={hist.id} className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-700 dark:text-rose-400">
                              Escalated to Management
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {new Date(hist.escalated_at).toLocaleString()}
                            </span>
                          </div>
                          {hist.inactivity_duration_minutes && (
                            <div className="text-slate-600 dark:text-slate-400">
                              Elapsed Inactivity: <span className="font-semibold">{hist.inactivity_duration_minutes} minutes</span>
                            </div>
                          )}
                          {hist.cleared_at ? (
                            <div className="text-emerald-700 dark:text-emerald-400 text-[11px] pt-1">
                              ✓ Cleared by staff action on {new Date(hist.cleared_at).toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-rose-600 dark:text-rose-400 font-semibold text-[11px] pt-1">
                              ⚠ Escalation currently active
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No SLA breach escalations recorded for this ticket. Inactivity is within baseline SLA policies.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Escalate Prompt Modal */}
      {isEscalateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 border border-rose-200 dark:border-rose-900 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Escalate Ticket to Management</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Flag this ticket for immediate managerial intervention and broadcast an urgent notification.
            </p>

            <form onSubmit={handleConfirmEscalate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Escalation
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="e.g. Critical tenant production outage, SLA threshold exceeded..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
