export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type InactivityState = 'recent' | 'aging' | 'escalated' | 'resolved';
export type TicketQueue = 'all' | 'my_assigned' | 'unassigned' | 'escalated';

export interface TicketCategory {
  id: number;
  category_name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export interface TicketEscalationHistory {
  id: number;
  ticket_id: number;
  escalation_policy_id?: number | null;
  escalated_at: string;
  cleared_at?: string | null;
  inactivity_duration_minutes?: number | null;
  notification_sent: boolean;
  policy?: {
    id: number;
    priority: string;
    reminder_threshold_minutes: number;
    escalation_threshold_minutes: number;
  };
}

export interface Ticket {
  id: number;
  ticket_number: string;
  account_id: number;
  contact_id?: number | null;
  assignee_user_id?: number | null;
  category_id: number;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description?: string | null;
  last_activity_at: string;
  inactivity_duration_seconds?: number | null;
  escalated: boolean;
  escalated_at?: string | null;
  closed_at?: string | null;
  inactivity_state: InactivityState;
  elapsed_inactivity_minutes: number;
  created_at: string;
  updated_at?: string;
  account?: {
    id: number;
    organization_name: string;
    industry?: string | null;
    location?: string | null;
    primary_contact?: {
      id: number;
      first_name: string;
      last_name: string;
      email?: string | null;
      phone?: string | null;
    } | null;
  };
  contact?: {
    id: number;
    account_id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    role_title?: string | null;
  } | null;
  category?: TicketCategory;
  assignee?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
  comments?: TicketComment[];
  escalation_histories?: TicketEscalationHistory[];
}

export interface TicketMetrics {
  total_active: number;
  unassigned_count: number;
  escalated_count: number;
  avg_resolution_hours: number;
  urgent_high_count: number;
  priority_breakdown: Record<string, number>;
}

export interface TicketCounts {
  all: number;
  my_assigned: number;
  unassigned: number;
  escalated: number;
}

export interface TicketFilters {
  queue?: TicketQueue;
  status?: string;
  priority?: string;
  category_id?: number | string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CreateTicketPayload {
  account_id: number;
  contact_id?: number | null;
  category_id: number;
  priority: TicketPriority;
  subject: string;
  description?: string;
  assignee_user_id?: number | null;
  status?: TicketStatus;
}

export interface UpdateTicketPayload {
  account_id?: number;
  contact_id?: number | null;
  category_id?: number;
  priority?: TicketPriority;
  subject?: string;
  description?: string;
  assignee_user_id?: number | null;
  status?: TicketStatus;
}

export interface CreateTicketCommentPayload {
  comment_text: string;
  is_internal?: boolean;
}
