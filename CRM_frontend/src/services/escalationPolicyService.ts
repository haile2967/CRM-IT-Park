import apiClient from './api';
import type {
  EscalationPolicy,
  CreateEscalationPolicyPayload,
  UpdateEscalationPolicyPayload,
  EscalationPoliciesResponse,
  SingleEscalationPolicyResponse,
  DeleteEscalationPolicyResponse,
  EscalationPolicyFilters,
} from '../types/escalationPolicy';

export const escalationPolicyService = {
  /**
   * List all escalation policies and reminder threshold configurations.
   * Authorized role: System Administrator.
   */
  async getPolicies(filters?: EscalationPolicyFilters): Promise<EscalationPolicy[]> {
    const response = await apiClient.get<EscalationPoliciesResponse>('/escalation-policies', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * View details of a specific escalation policy and its reminder threshold.
   * Authorized role: System Administrator.
   */
  async getPolicyById(id: number): Promise<EscalationPolicy> {
    const response = await apiClient.get<SingleEscalationPolicyResponse>(
      `/escalation-policies/${id}`
    );
    return response.data.data.policy;
  },

  /**
   * Create / configure a new escalation policy and reminder threshold.
   * Authorized role: System Administrator.
   */
  async createPolicy(payload: CreateEscalationPolicyPayload): Promise<EscalationPolicy> {
    const response = await apiClient.post<SingleEscalationPolicyResponse>(
      '/escalation-policies',
      payload
    );
    return response.data.data.policy;
  },

  /**
   * Update an escalation policy configuration.
   * Authorized role: System Administrator.
   */
  async updatePolicy(
    id: number,
    payload: UpdateEscalationPolicyPayload
  ): Promise<EscalationPolicy> {
    const response = await apiClient.put<SingleEscalationPolicyResponse>(
      `/escalation-policies/${id}`,
      payload
    );
    return response.data.data.policy;
  },

  /**
   * Update the reminder threshold specifically for a ticket priority.
   * Authorized role: System Administrator.
   */
  async updateReminderThreshold(
    id: number,
    reminderThresholdMinutes: number
  ): Promise<EscalationPolicy> {
    const response = await apiClient.patch<SingleEscalationPolicyResponse>(
      `/escalation-policies/${id}/reminder-threshold`,
      { reminder_threshold_minutes: reminderThresholdMinutes }
    );
    return response.data.data.policy;
  },

  /**
   * Activate or deactivate an escalation policy.
   * Authorized role: System Administrator.
   */
  async toggleStatus(id: number, isActive: boolean): Promise<EscalationPolicy> {
    const response = await apiClient.patch<SingleEscalationPolicyResponse>(
      `/escalation-policies/${id}/status`,
      { is_active: isActive }
    );
    return response.data.data.policy;
  },

  /**
   * Delete an escalation policy configuration.
   * Blocked if tickets have history logged against it.
   * Authorized role: System Administrator.
   */
  async deletePolicy(id: number): Promise<DeleteEscalationPolicyResponse> {
    const response = await apiClient.delete<DeleteEscalationPolicyResponse>(
      `/escalation-policies/${id}`
    );
    return response.data;
  },
};

export default escalationPolicyService;
