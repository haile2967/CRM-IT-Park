export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TimeBasis = 'calendar' | 'business_hours';

export interface EscalationPolicyUser {
  id: number;
  name: string;
  email: string;
}

export interface EscalationPolicy {
  id: number;
  priority: TicketPriority;
  reminder_threshold_minutes: number;
  escalation_threshold_minutes: number;
  time_basis: TimeBasis;
  is_active: boolean;
  created_by?: EscalationPolicyUser;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEscalationPolicyPayload {
  priority: TicketPriority;
  reminder_threshold_minutes: number;
  escalation_threshold_minutes: number;
  time_basis?: TimeBasis;
  is_active?: boolean;
}

export interface UpdateEscalationPolicyPayload {
  priority?: TicketPriority;
  reminder_threshold_minutes?: number;
  escalation_threshold_minutes?: number;
  time_basis?: TimeBasis;
  is_active?: boolean;
}

export interface UpdateReminderThresholdPayload {
  reminder_threshold_minutes: number;
}

export interface TogglePolicyStatusPayload {
  is_active: boolean;
}

export interface EscalationPoliciesResponse {
  data: EscalationPolicy[];
}

export interface SingleEscalationPolicyResponse {
  success: boolean;
  message?: string;
  data: {
    policy: EscalationPolicy;
  };
}

export interface DeleteEscalationPolicyResponse {
  success: boolean;
  message: string;
}

export interface EscalationPolicyFilters {
  priority?: TicketPriority;
  active_only?: boolean;
  is_active?: boolean;
}
