import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Building2, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DuplicateWarningAlert from './DuplicateWarningAlert';
import leadService from '../../services/leadService';
import type {
  Lead,
  LeadSource,
  LeadCategory,
  CreateLeadPayload,
  DuplicateMatch,
  LeadStatus,
  LeadPriority,
} from '../../types/lead';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
  leadToEdit?: Lead | null;
  onInspectDuplicate?: (leadId: number) => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  leadToEdit,
  onInspectDuplicate,
}) => {
  const isEditing = Boolean(leadToEdit);

  // Form State
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sourceId, setSourceId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [ownerUserId, setOwnerUserId] = useState<number | undefined>();
  const [status, setStatus] = useState<LeadStatus>('new');
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [estimatedSpaceSqm, setEstimatedSpaceSqm] = useState<string>('');
  const [estimatedHeadcount, setEstimatedHeadcount] = useState<string>('');
  const [nextFollowUpAt, setNextFollowUpAt] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Duplicate Check & Options State
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [forceDuplicate, setForceDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dropdown Reference Data
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [categories, setCategories] = useState<LeadCategory[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: number; full_name: string; role_name?: string }>>([]);

  // Load dropdown metadata once
  useEffect(() => {
    if (isOpen) {
      leadService.getLeadSources().then(setSources).catch(console.error);
      leadService.getLeadCategories().then(setCategories).catch(console.error);
      leadService.getTeamMembers().then(setTeamMembers).catch(console.error);
    }
  }, [isOpen]);

  // Reset or pre-fill form when opened
  useEffect(() => {
    if (isOpen) {
      if (leadToEdit) {
        setName(leadToEdit.name || '');
        setOrganization(leadToEdit.organization || '');
        setEmail(leadToEdit.email || '');
        setPhone(leadToEdit.phone || '');
        setSourceId(leadToEdit.source_id || undefined);
        setCategoryId(leadToEdit.category_id || undefined);
        setOwnerUserId(leadToEdit.owner_user_id || undefined);
        setStatus(leadToEdit.status);
        setPriority(leadToEdit.priority);
        setEstimatedSpaceSqm(leadToEdit.estimated_space_sqm ? String(leadToEdit.estimated_space_sqm) : '');
        setEstimatedHeadcount(leadToEdit.estimated_headcount ? String(leadToEdit.estimated_headcount) : '');
        setNextFollowUpAt(leadToEdit.next_follow_up_at ? leadToEdit.next_follow_up_at.substring(0, 16) : '');
        setNotes(leadToEdit.notes || '');
      } else {
        setName('');
        setOrganization('');
        setEmail('');
        setPhone('');
        setSourceId(undefined);
        setCategoryId(undefined);
        setOwnerUserId(undefined);
        setStatus('new');
        setPriority('medium');
        setEstimatedSpaceSqm('');
        setEstimatedHeadcount('');
        setNextFollowUpAt('');
        setNotes('');
      }
      setDuplicates([]);
      setForceDuplicate(false);
      setFormError(null);
    }
  }, [isOpen, leadToEdit]);

  // Debounced duplicate detection
  const triggerDuplicateCheck = useCallback(
    async (checkEmail: string, checkPhone: string, checkOrg: string) => {
      if (!checkEmail && !checkPhone && !checkOrg) {
        setDuplicates([]);
        return;
      }
      setIsCheckingDuplicate(true);
      try {
        const res = await leadService.checkDuplicate(
          checkEmail || null,
          checkPhone || null,
          checkOrg || null,
          leadToEdit?.id || null
        );
        setDuplicates(res.duplicates || []);
      } catch {
        // Non-blocking error
      } finally {
        setIsCheckingDuplicate(false);
      }
    },
    [leadToEdit?.id]
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      triggerDuplicateCheck(email, phone, organization);
    }, 350);
    return () => clearTimeout(timer);
  }, [email, phone, organization, isOpen, triggerDuplicateCheck]);

  // Approximate live score preview
  const previewScore = Math.min(
    100,
    40 +
      (email ? 10 : 0) +
      (phone ? 10 : 0) +
      (organization ? 10 : 0) +
      (categoryId ? 10 : 0) +
      (Number(estimatedSpaceSqm) > 200 ? 10 : 0) +
      (priority === 'urgent' ? 15 : priority === 'high' ? 10 : 0)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Lead contact or founder name is required.');
      return;
    }

    const payload: CreateLeadPayload = {
      name: name.trim(),
      organization: organization.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      source_id: sourceId ? Number(sourceId) : undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      owner_user_id: ownerUserId ? Number(ownerUserId) : undefined,
      status,
      priority,
      notes: notes.trim() || undefined,
      estimated_space_sqm: estimatedSpaceSqm ? Number(estimatedSpaceSqm) : undefined,
      estimated_headcount: estimatedHeadcount ? Number(estimatedHeadcount) : undefined,
      next_follow_up_at: nextFollowUpAt || undefined,
      force_duplicate: forceDuplicate,
    };

    setIsSubmitting(true);
    try {
      let saved: Lead;
      if (isEditing && leadToEdit) {
        saved = await leadService.updateLead(leadToEdit.id, payload);
      } else {
        saved = await leadService.createLead(payload);
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.duplicate_warning) {
        setDuplicates(err.response.data.duplicates || []);
        setFormError('Duplicate match detected! Review warnings above or check the box below to proceed anyway.');
      } else {
        setFormError(err.response?.data?.message || 'Failed to save lead. Please check input values.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditing ? `Edit Lead: ${leadToEdit?.name}` : 'Register New Inbound Lead'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ethiopian IT Park Investor, Startup & Commercial Tenant Ingestion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 text-[11px] font-semibold text-cyan-800 dark:text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Score: {previewScore}/100</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Real-Time Duplicate Warning Alert */}
          <DuplicateWarningAlert
            duplicates={duplicates}
            onSelectDuplicate={(id) => {
              onClose();
              onInspectDuplicate?.(id);
            }}
          />

          {/* Section 1: Contact & Company Identity */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
              1. Prospect & Company Identity
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Contact / Founder Name *"
                placeholder="e.g. Dr. Biruk Tadesse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Organization / Company"
                placeholder="e.g. Abyssinia Cloud Tech PLC"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                type="email"
                label="Email Address"
                placeholder="biruk@abyssiniacloud.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                helperText={isCheckingDuplicate ? 'Checking duplicates...' : undefined}
              />

              <Input
                type="tel"
                label="Phone Number"
                placeholder="+251 911 223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Section 2: Park Requirements & Classification */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
              2. Classification & Space Requirements
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sector / Vertical Category
                </label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select industry sector...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Inbound Source
                </label>
                <select
                  value={sourceId || ''}
                  onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select acquisition source...</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.source_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                type="number"
                label="Estimated Space Requirement (sqm)"
                placeholder="e.g. 450"
                value={estimatedSpaceSqm}
                onChange={(e) => setEstimatedSpaceSqm(e.target.value)}
              />

              <Input
                type="number"
                label="Target Headcount / Desks"
                placeholder="e.g. 60"
                value={estimatedHeadcount}
                onChange={(e) => setEstimatedHeadcount(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Assignment & Stage Tracking */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
              3. Assignment, Priority & Next Touchpoint
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Owner (BDO)
                </label>
                <select
                  value={ownerUserId || ''}
                  onChange={(e) => setOwnerUserId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Leave Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.role_name || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Park Priority Tier
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent 🔥</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Pipeline Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="new">New Inbound</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="unqualified">Unqualified</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                type="datetime-local"
                label="Scheduled Next Follow-Up Touchpoint"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Intake Notes */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Intake Notes & Project Overview
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline specific park requirements (fiber redundancy, tax incentives, incubation track, electrical load)..."
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Force Duplicate Checkbox (if duplicate matches found) */}
          {duplicates.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="force_duplicate"
                checked={forceDuplicate}
                onChange={(e) => setForceDuplicate(e.target.checked)}
                className="mt-0.5 rounded-sm border-amber-400 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="force_duplicate" className="text-xs text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                I have verified the warnings above and confirm this is a separate inquiry. Save anyway.
              </label>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Inbound Lead'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
