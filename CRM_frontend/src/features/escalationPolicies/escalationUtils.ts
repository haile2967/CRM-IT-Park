import type { TicketPriority, TimeBasis } from '../../types/escalationPolicy';

/**
 * Convert duration in minutes to an intuitive human-readable string.
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '0 mins';
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hr${hours === 1 ? '' : 's'}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0 && remainingMinutes === 0) {
    return `${days} day${days === 1 ? '' : 's'} (${hours}h)`;
  }

  if (remainingMinutes === 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d ${remainingHours}h ${remainingMinutes}m`;
}

/**
 * Priority badge metadata and styling tailored to the Ethiopian IT Park CRM aesthetic.
 */
export interface PriorityMeta {
  label: TicketPriority;
  colorName: 'rose' | 'amber' | 'blue' | 'emerald';
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  bgLightClass: string;
  accentText: string;
  description: string;
  defaultReminder: number;
  defaultEscalation: number;
}

export const PRIORITY_CONFIG: Record<TicketPriority, PriorityMeta> = {
  Urgent: {
    label: 'Urgent',
    colorName: 'rose',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/60',
    dotClass: 'bg-rose-500',
    borderClass: 'border-rose-200 dark:border-rose-800/60',
    bgLightClass: 'bg-rose-50/50 dark:bg-rose-950/20',
    accentText: 'text-rose-700 dark:text-rose-400',
    description: 'Critical business blockers, severe tenant outages & security incidents.',
    defaultReminder: 30, // 30 minutes
    defaultEscalation: 120, // 2 hours
  },
  High: {
    label: 'High',
    colorName: 'amber',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/60',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    bgLightClass: 'bg-amber-50/50 dark:bg-amber-950/20',
    accentText: 'text-amber-700 dark:text-amber-400',
    description: 'Significant operational impact, service degradation or client escalation.',
    defaultReminder: 120, // 2 hours
    defaultEscalation: 360, // 6 hours
  },
  Medium: {
    label: 'Medium',
    colorName: 'blue',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200/90 dark:border-sky-800/60',
    dotClass: 'bg-sky-500',
    borderClass: 'border-sky-200 dark:border-sky-800/60',
    bgLightClass: 'bg-sky-50/50 dark:bg-sky-950/20',
    accentText: 'text-sky-700 dark:text-sky-400',
    description: 'Standard inquiries, facility requests, general park tenant support.',
    defaultReminder: 720, // 12 hours
    defaultEscalation: 1440, // 24 hours (1 day)
  },
  Low: {
    label: 'Low',
    colorName: 'emerald',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/60',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    bgLightClass: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    description: 'Minor questions, routine maintenance, scheduled non-critical changes.',
    defaultReminder: 1440, // 24 hours (1 day)
    defaultEscalation: 2880, // 48 hours (2 days)
  },
};

export const ALL_PRIORITIES: TicketPriority[] = ['Urgent', 'High', 'Medium', 'Low'];

export const TIME_BASIS_CONFIG: Record<
  TimeBasis,
  { label: string; description: string; badge: string }
> = {
  calendar: {
    label: 'Calendar Clock (24/7)',
    description: 'Elapsed absolute time including nights, weekends, and national holidays.',
    badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
  },
  business_hours: {
    label: 'Park Business Hours',
    description: 'Counted only during official Ethiopian IT Park operational hours (8:30 - 17:30).',
    badge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
  },
};
