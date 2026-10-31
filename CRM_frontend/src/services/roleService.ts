import apiClient from './api';
import type {
  Role,
  PermissionGroup,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/role';

export const roleService = {
  /**
   * Fetch all roles with assigned permissions and user counts.
   * Endpoint: GET /api/roles (or /api/v1/roles)
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<{ data: Role[] }>('/roles');
    return response.data.data;
  },

  /**
   * Fetch catalog of all permissions grouped by domain for checkbox matrix.
   * Endpoint: GET /api/permissions
   */
  async getPermissions(): Promise<PermissionGroup[]> {
    const response = await apiClient.get<{ success: boolean; data: PermissionGroup[] }>('/permissions');
    return response.data.data;
  },

  /**
   * Create a new custom role and assign permissions.
   * Endpoint: POST /api/roles
   */
  async createRole(payload: CreateRolePayload): Promise<Role> {
    const response = await apiClient.post<{ data: Role; message?: string }>('/roles', payload);
    return response.data.data;
  },

  /**
   * Update an existing custom role and synchronize permissions.
   * Endpoint: PUT /api/roles/{id}
   */
  async updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
    const response = await apiClient.put<{ data: Role; message?: string }>(`/roles/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete an unassigned custom role.
   * Endpoint: DELETE /api/roles/{id}
   */
  async deleteRole(id: number): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};

export default roleService;
