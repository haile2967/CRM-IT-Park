import React from 'react';
import Badge from '../../components/ui/Badge';
import type { LeadPriority, LeadStatus } from '../../types/lead';

export const LeadStatusBadge: React.FC<{ status: LeadStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const configs: Record<
    LeadStatus,
    { label: string; variant: 'slate' | 'blue' | 'purple' | 'emerald' | 'rose' | 'cyan' }
  > = {
    new: { label: 'New Inbound', variant: 'blue' },
    contacted: { label: 'Contacted', variant: 'purple' },
    qualified: { label: 'Qualified', variant: 'cyan' },
    converted: { label: 'Converted', variant: 'emerald' },
    unqualified: { label: 'Unqualified', variant: 'rose' },
  };

  const config = configs[status] || { label: status, variant: 'slate' };

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
};

export const LeadPriorityBadge: React.FC<{ priority: LeadPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  const configs: Record<
    LeadPriority,
    { label: string; variant: 'slate' | 'blue' | 'amber' | 'rose' }
  > = {
    low: { label: 'Low', variant: 'slate' },
    medium: { label: 'Medium', variant: 'blue' },
    high: { label: 'High', variant: 'amber' },
    urgent: { label: 'Urgent 🔥', variant: 'rose' },
  };

  const config = configs[priority] || { label: priority, variant: 'slate' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};
