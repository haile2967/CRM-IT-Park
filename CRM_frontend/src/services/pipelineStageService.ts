import apiClient from './api';
import type {
  PipelineStage,
  CreatePipelineStagePayload,
  UpdatePipelineStagePayload,
  PipelineStageResponse,
  SinglePipelineStageResponse,
  ReorderPipelineStagesResponse,
  DeletePipelineStageResponse,
} from '../types/pipelineStage';

export const pipelineStageService = {
  /**
   * Fetch all pipeline stages ordered by display_order.
   * If logged in as System Administrator, includes opportunities_count.
   * Authorized: all authenticated users.
   */
  async getStages(params?: { active_only?: boolean; status?: string }): Promise<PipelineStage[]> {
    const response = await apiClient.get<PipelineStageResponse>('/pipeline-stages', {
      params,
    });
    return response.data.data;
  },

  /**
   * Create a new pipeline stage.
   * Authorized role: System Administrator.
   */
  async createStage(payload: CreatePipelineStagePayload): Promise<PipelineStage> {
    const response = await apiClient.post<SinglePipelineStageResponse>(
      '/pipeline-stages',
      payload
    );
    return response.data.data.stage;
  },

  /**
   * Update an existing pipeline stage's name, display order, or terminal flags.
   * Authorized role: System Administrator.
   */
  async updateStage(id: number, payload: UpdatePipelineStagePayload): Promise<PipelineStage> {
    const response = await apiClient.put<SinglePipelineStageResponse>(
      `/pipeline-stages/${id}`,
      payload
    );
    return response.data.data.stage;
  },

  /**
   * Toggle the active status of a pipeline stage.
   * Authorized role: System Administrator.
   */
  async toggleStatus(id: number, isActive: boolean): Promise<PipelineStage> {
    const response = await apiClient.patch<SinglePipelineStageResponse>(
      `/pipeline-stages/${id}/status`,
      { is_active: isActive }
    );
    return response.data.data.stage;
  },

  /**
   * Bulk-update the display_order of multiple stages in a single atomic transaction.
   * Authorized role: System Administrator.
   */
  async reorderStages(stages: { id: number; display_order: number }[]): Promise<PipelineStage[]> {
    const response = await apiClient.post<ReorderPipelineStagesResponse>(
      '/pipeline-stages/reorder',
      { stages }
    );
    return response.data.data.stages;
  },

  /**
   * Permanently delete a pipeline stage.
   * Blocked when opportunities are currently linked to this stage.
   * Authorized role: System Administrator.
   */
  async deleteStage(id: number): Promise<DeletePipelineStageResponse> {
    const response = await apiClient.delete<DeletePipelineStageResponse>(
      `/pipeline-stages/${id}`
    );
    return response.data;
  },
};

export default pipelineStageService;
