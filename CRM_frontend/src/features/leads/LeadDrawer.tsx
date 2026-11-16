import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { LeadStatusBadge, LeadPriorityBadge } from './LeadBadges';
import leadService from '../../services/leadService';
import type { Lead, LeadStatus } from '../../types/lead';

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number | null;
  onEdit: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDeleted: (leadId: number) => void;
  onStatusUpdated: (updatedLead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  isOpen,
  onClose,
  leadId,
  onEdit,
  onAssign,
  onConvert,
  onDeleted,
  onStatusUpdated,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchLead = React.useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const data = await leadService.getLead(id);
      setLead(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLead(leadId);
    } else {
      setLead(null);
    }
  }, [isOpen, leadId, fetchLead]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || lead.status === newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await leadService.updateStatus(lead.id, newStatus);
      setLead(updated);
      onStatusUpdated(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      try {
        await leadService.deleteLead(lead.id);
        onDeleted(lead.id);
        onClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;
    setIsAddingNote(true);
    try {
      // Append note to existing notes
      const existingNotes = lead.notes ? `${lead.notes}\n---\n` : '';
      const updatedNotes = `${existingNotes}[${new Date().toLocaleDateString()}] ${newNote.trim()}`;
      const updated = await leadService.updateLead(lead.id, { notes: updatedNotes });
      setLead(updated);
      setNewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const stages: Array<{ key: LeadStatus; label: string }> = [
    { key: 'new', label: 'New Inbound' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'converted', label: 'Converted' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0b1120] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-900/90">
          <div className="space-y-1.5 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              {lead && <LeadStatusBadge status={lead.status} size="md" />}
              {lead && <LeadPriorityBadge priority={lead.priority} size="md" />}
              {lead && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  Score {lead.lead_score}/100
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {lead?.name || 'Loading details...'}
            </h2>

            {lead?.organization && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{lead.organization}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {lead && (
              <button
                onClick={() => onEdit(lead)}
                title="Edit Lead"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {lead && (
              <button
                onClick={handleDelete}
                title="Delete Lead"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Stepper Bar */}
        {lead && lead.status !== 'unqualified' && (
          <div className="px-6 py-3 bg-white dark:bg-[#0b1120] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
            {stages.map((stg, idx) => {
              const currentIdx = stages.findIndex((s) => s.key === lead.status);
              const isPast = idx <= currentIdx;
              const isCurrent = stg.key === lead.status;

              return (
                <button
                  key={stg.key}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(stg.key)}
                  className={`flex-1 min-w-[95px] text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isCurrent
                      ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-cyan-600 dark:border-cyan-500 shadow-2xs'
                      : isPast
                      ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-[10px] opacity-75 uppercase tracking-wider">Step {idx + 1}</div>
                  <div className="truncate">{stg.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* 1-Click Conversion Banner if Qualified */}
        {lead && lead.status === 'qualified' && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-slate-900 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Prospect is Park-Qualified!
              </span>
              <p className="text-[11px] text-cyan-800 dark:text-cyan-300">
                Ready to convert into Corporate Account, Contact, and Lease Opportunity.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onConvert(lead)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Convert
            </Button>
          </div>
        )}

        {/* Body Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">Loading lead information...</div>
          ) : lead ? (
            <>
              {/* Quick Contact & Action Links */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate"
                  >
                    <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>No email provided</span>
                  </div>
                )}

                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate"
                  >
                    <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="truncate">{lead.phone}</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>No phone provided</span>
                  </div>
                )}
              </div>

              {/* Assignment Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block">
                      Assigned Lead Owner
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {lead.owner ? lead.owner.full_name || lead.owner.email : 'Unassigned (Shared Pool)'}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => onAssign(lead)}>
                  Reassign
                </Button>
              </div>

              {/* Lead Details Grid */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
                  Profile & Park Specifications
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Industry Sector</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {lead.category?.category_name || 'General Tech'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Acquisition Source</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {lead.source?.source_name || 'Direct Inbound'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Estimated Space (sqm)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                      {lead.estimated_space_sqm ? `${lead.estimated_space_sqm} m²` : 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Target Desks / Staff</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                      {lead.estimated_headcount ? `${lead.estimated_headcount} staff` : 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Next Follow-Up Touchpoint</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {lead.next_follow_up_at
                          ? new Date(lead.next_follow_up_at).toLocaleString()
                          : 'No follow-up scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intake Notes */}
              {lead.notes && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
                    Intake Notes & Project Requirements
                  </span>
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {lead.notes}
                  </div>
                </div>
              )}

              {/* Activity Trail & Touchpoint Log */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
                  Activity Timeline & Touchpoints
                </span>

                {/* Quick Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a call, meeting, or quick update..."
                    className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isAddingNote}
                    disabled={!newNote.trim()}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>

                {/* Activity List */}
                <div className="space-y-2.5 pt-1">
                  {lead.activities && lead.activities.length > 0 ? (
                    lead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-lg bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</span>
                          <span className="font-mono">{new Date(act.created_at).toLocaleDateString()}</span>
                        </div>
                        {act.description && <p className="text-slate-600 dark:text-slate-300">{act.description}</p>}
                        {act.user && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                            By {act.user.full_name || act.user.first_name}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                      No activity logs recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LeadDrawer;
