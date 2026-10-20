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
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dotClass: 'bg-rose-500',
    borderClass: 'border-rose-200',
    bgLightClass: 'bg-rose-50/50',
    accentText: 'text-rose-700',
    description: 'Critical business blockers, severe tenant outages & security incidents.',
    defaultReminder: 30, // 30 minutes
    defaultEscalation: 120, // 2 hours
  },
  High: {
    label: 'High',
    colorName: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-200',
    bgLightClass: 'bg-amber-50/50',
    accentText: 'text-amber-700',
    description: 'Significant operational impact, service degradation or client escalation.',
    defaultReminder: 120, // 2 hours
    defaultEscalation: 360, // 6 hours
  },
  Medium: {
    label: 'Medium',
    colorName: 'blue',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/90',
    dotClass: 'bg-sky-500',
    borderClass: 'border-sky-200',
    bgLightClass: 'bg-sky-50/50',
    accentText: 'text-sky-700',
    description: 'Standard inquiries, facility requests, general park tenant support.',
    defaultReminder: 720, // 12 hours
    defaultEscalation: 1440, // 24 hours (1 day)
  },
  Low: {
    label: 'Low',
    colorName: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-200',
    bgLightClass: 'bg-emerald-50/50',
    accentText: 'text-emerald-700',
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
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  business_hours: {
    label: 'Park Business Hours',
    description: 'Counted only during official Ethiopian IT Park operational hours (8:30 - 17:30).',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
};
