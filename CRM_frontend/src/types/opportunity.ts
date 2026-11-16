export interface OpportunityType {
  id: number;
  type_name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PipelineStage {
  id: number;
  stage_name: string;
  display_order: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityStageHistory {
  id: number;
  opportunity_id: number;
  from_stage_id: number | null;
  to_stage_id: number;
  changed_by_user_id: number;
  changed_at: string;
  notes?: string | null;
  from_stage?: PipelineStage | null;
  to_stage?: PipelineStage | null;
  changed_by?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export interface ExportRecord {
  id: number;
  opportunity_id: number;
  exported_by_user_id: number;
  export_type: string;
  export_format: string;
  file_name: string;
  record_count: number;
  status: string;
  exported_at: string;
  error_message?: string | null;
  exported_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface Opportunity {
  id: number;
  lead_id?: number | null;
  account_id: number;
  owner_user_id?: number | null;
  opportunity_type_id: number;
  stage_id: number;
  probability: number;
  value: number;
  expected_close_date?: string | null;
  notes?: string | null;
  status: 'open' | 'closed_won' | 'closed_lost';
  closed_at?: string | null;
  deal_name?: string;
  created_at?: string;
  updated_at?: string;
  account?: {
    id: number;
    organization_name: string;
    industry?: string | null;
    location?: string | null;
    contact_information?: any;
    primary_contact?: {
      id: number;
      first_name: string;
      last_name: string;
      email?: string | null;
      phone?: string | null;
      role_title?: string | null;
    } | null;
  };
  owner?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  stage?: PipelineStage;
  opportunity_type?: OpportunityType;
  stage_histories?: OpportunityStageHistory[];
  export_records?: ExportRecord[];
}

export interface StageBreakdownItem {
  stage_id: number;
  stage_name: string;
  count: number;
  total_value: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
}

export interface OpportunityMetrics {
  total_opportunities: number;
  open_deals_count: number;
  closed_won_count: number;
  closed_lost_count: number;
  total_pipeline_value: number;
  weighted_forecast_value: number;
  closed_won_value: number;
  win_rate_pct: number;
  avg_deal_size: number;
  stage_breakdown: StageBreakdownItem[];
}

export interface KanbanColumn {
  stage_id: number;
  stage_name: string;
  display_order: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  total_deals: number;
  total_value: number;
  weighted_value: number;
  opportunities: Opportunity[];
}

export interface OpportunityFilters {
  search?: string;
  stage_id?: number;
  opportunity_type_id?: number;
  status?: string;
  owner_user_id?: number;
  page?: number;
  per_page?: number;
}

export interface CreateOpportunityPayload {
  account_id: number;
  opportunity_type_id: number;
  stage_id?: number;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  owner_user_id?: number;
}

export interface UpdateOpportunityPayload {
  account_id?: number;
  opportunity_type_id?: number;
  stage_id?: number;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  owner_user_id?: number;
  status?: 'open' | 'closed_won' | 'closed_lost';
}

export interface TransitionStagePayload {
  stage_id: number;
  notes?: string;
}

export interface TransferOpportunityOwnershipPayload {
  new_owner_user_id: number;
  reason?: string;
}
