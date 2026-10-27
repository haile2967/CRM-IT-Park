import apiClient from './api';
import type { AuthResponse, ChangePasswordPayload, ChangePasswordResponse, LoginCredentials, User } from '../types/auth';

export const authService = {
  /**
   * Authenticate with email & password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Retrieve active authenticated profile.
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Terminate active session and invalidate token.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
    }
  },

  /**
   * Change password with current password verification and Keycloak sync.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await apiClient.put<ChangePasswordResponse>('/auth/change-password', payload);
    return response.data;
  },
};

export default authService;
