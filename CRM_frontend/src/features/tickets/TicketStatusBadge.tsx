import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { InactivityState, TicketPriority, TicketStatus } from '../../types/ticket';

interface PriorityBadgeProps {
  priority: TicketPriority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const norm = String(priority).toLowerCase();
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (norm === 'urgent') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 ${px}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        Urgent
      </span>
    );
  }

  if (norm === 'high') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 ${px}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        High
      </span>
    );
  }

  if (norm === 'medium') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 ${px}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        Medium
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${px}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Low
    </span>
  );
};

interface StatusBadgeProps {
  status: TicketStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = String(status).toLowerCase();
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (norm === 'open') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 ${px}`}>
        Open
      </span>
    );
  }

  if (norm === 'in_progress') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 ${px}`}>
        In Progress
      </span>
    );
  }

  if (norm === 'resolved') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 ${px}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        Resolved
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${px}`}>
      Closed
    </span>
  );
};

interface InactivityBadgeProps {
  state: InactivityState | string;
  elapsedMinutes?: number;
  isEscalated?: boolean;
}

export const InactivityBadge: React.FC<InactivityBadgeProps> = ({ state, elapsedMinutes = 0, isEscalated }) => {
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours < 24) return remainingMins > 0 ? `${hours}h ${remainingMins}m ago` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isEscalated || state === 'escalated') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        <span>ESCALATED</span>
      </span>
    );
  }

  if (state === 'aging') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>Aging ({formatDuration(elapsedMinutes)})</span>
      </span>
    );
  }

  if (state === 'resolved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Resolved</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>Active ({formatDuration(elapsedMinutes)})</span>
    </span>
  );
};
