export interface PipelineStage {
  id: number;
  stage_name: string;
  display_order: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  is_active: boolean;
  opportunities_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePipelineStagePayload {
  stage_name: string;
  display_order: number;
  is_closed_won?: boolean;
  is_closed_lost?: boolean;
}

export interface UpdatePipelineStagePayload {
  stage_name?: string;
  display_order?: number;
  is_closed_won?: boolean;
  is_closed_lost?: boolean;
}

export interface ReorderStagesPayload {
  stages: {
    id: number;
    display_order: number;
  }[];
}

export interface PipelineStageResponse {
  data: PipelineStage[];
}

export interface SinglePipelineStageResponse {
  success: boolean;
  message: string;
  data: {
    stage: PipelineStage;
  };
}

export interface ReorderPipelineStagesResponse {
  success: boolean;
  message: string;
  data: {
    stages: PipelineStage[];
  };
}

export interface DeletePipelineStageResponse {
  success: boolean;
  message: string;
}
