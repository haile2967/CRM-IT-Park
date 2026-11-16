import apiClient from './api';
import type {
  CreateOpportunityPayload,
  KanbanColumn,
  Opportunity,
  OpportunityFilters,
  OpportunityMetrics,
  OpportunityType,
  PipelineStage,
  TransferOpportunityOwnershipPayload,
  TransitionStagePayload,
  UpdateOpportunityPayload,
} from '../types/opportunity';

export interface OpportunitiesResponse {
  success: boolean;
  data: Opportunity[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const opportunityService = {
  /**
   * Fetch paginated list of opportunities with optional search and filters.
   */
  async getOpportunities(filters: OpportunityFilters = {}): Promise<OpportunitiesResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.stage_id) params.append('stage_id', String(filters.stage_id));
    if (filters.opportunity_type_id) params.append('opportunity_type_id', String(filters.opportunity_type_id));
    if (filters.status) params.append('status', filters.status);
    if (filters.owner_user_id) params.append('owner_user_id', String(filters.owner_user_id));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await apiClient.get<OpportunitiesResponse>(`/opportunities?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch structured Kanban board data.
   */
  async getKanban(filters: { search?: string; opportunity_type_id?: number; owner_user_id?: number } = {}): Promise<KanbanColumn[]> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.opportunity_type_id) params.append('opportunity_type_id', String(filters.opportunity_type_id));
    if (filters.owner_user_id) params.append('owner_user_id', String(filters.owner_user_id));

    const response = await apiClient.get<{ success: boolean; data: KanbanColumn[] }>(`/opportunities/kanban?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Fetch high-level pipeline and forecasting metrics.
   */
  async getMetrics(): Promise<OpportunityMetrics> {
    const response = await apiClient.get<{ success: boolean; data: OpportunityMetrics }>('/opportunities/metrics');
    return response.data.data;
  },

  /**
   * Fetch full details for a single opportunity.
   */
  async getOpportunity(id: number): Promise<Opportunity> {
    const response = await apiClient.get<{ success: boolean; data: Opportunity }>(`/opportunities/${id}`);
    return response.data.data;
  },

  /**
   * Create a new commercial opportunity.
   */
  async createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
    const response = await apiClient.post<{ success: boolean; data: Opportunity }>('/opportunities', payload);
    return response.data.data;
  },

  /**
   * Update an opportunity.
   */
  async updateOpportunity(id: number, payload: UpdateOpportunityPayload): Promise<Opportunity> {
    const response = await apiClient.put<{ success: boolean; data: Opportunity }>(`/opportunities/${id}`, payload);
    return response.data.data;
  },

  /**
   * Transition stage (Kanban drag-and-drop or 1-click step).
   */
  async transitionStage(id: number, payload: TransitionStagePayload): Promise<Opportunity> {
    const response = await apiClient.patch<{ success: boolean; data: Opportunity }>(`/opportunities/${id}/stage`, payload);
    return response.data.data;
  },

  /**
   * Transfer ownership of an opportunity (BR-002).
   */
  async transferOwnership(id: number, payload: TransferOpportunityOwnershipPayload): Promise<Opportunity> {
    const response = await apiClient.patch<{ success: boolean; data: Opportunity }>(`/opportunities/${id}/transfer-ownership`, payload);
    return response.data.data;
  },

  /**
   * Soft delete an opportunity.
   */
  async deleteOpportunity(id: number): Promise<void> {
    await apiClient.delete(`/opportunities/${id}`);
  },

  /**
   * Get active opportunity types.
   */
  async getOpportunityTypes(): Promise<OpportunityType[]> {
    const response = await apiClient.get<{ success: boolean; data: OpportunityType[] }>('/opportunity-types');
    return response.data.data;
  },

  /**
   * Get pipeline stages.
   */
  async getPipelineStages(): Promise<PipelineStage[]> {
    const response = await apiClient.get<{ success: boolean; data: PipelineStage[] }>('/pipeline-stages');
    return response.data.data;
  },

  /**
   * Export PMS Handoff payload.
   */
  async exportPms(id: number, format: 'json' | 'csv' = 'json'): Promise<any> {
    if (format === 'json') {
      const response = await apiClient.get(`/opportunities/${id}/pms-export?format=json`);
      return response.data;
    } else {
      // Trigger CSV download
      const response = await apiClient.get(`/opportunities/${id}/pms-export?format=csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PMS_Handoff_Deal_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    }
  },
};
