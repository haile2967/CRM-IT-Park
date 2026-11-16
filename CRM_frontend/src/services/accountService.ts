import apiClient from './api';
import type {
  Account,
  AccountFilters,
  AccountMetrics,
  AccountType,
  AccountsResponse,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../types/account';

export const accountService = {
  /**
   * Fetch paginated list of accounts with optional search and filters.
   */
  async getAccounts(filters: AccountFilters = {}): Promise<AccountsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.account_type_id && filters.account_type_id !== 'all') {
      params.append('account_type_id', String(filters.account_type_id));
    }
    if (filters.owner_user_id && filters.owner_user_id !== 'all') {
      params.append('owner_user_id', String(filters.owner_user_id));
    }
    if (filters.industry && filters.industry !== 'all') {
      params.append('industry', filters.industry);
    }
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await apiClient.get<AccountsResponse>(`/accounts?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch aggregate KPI metrics for accounts.
   */
  async getMetrics(): Promise<AccountMetrics> {
    const response = await apiClient.get<{ success: boolean; data: AccountMetrics }>('/accounts/metrics');
    return response.data.data;
  },

  /**
   * Fetch single account details with relations.
   */
  async getAccount(id: number): Promise<Account> {
    const response = await apiClient.get<{ success: boolean; data: Account }>(`/accounts/${id}`);
    return response.data.data;
  },

  /**
   * Create a new corporate account.
   */
  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const response = await apiClient.post<{ success: boolean; data: Account }>('/accounts', payload);
    return response.data.data;
  },

  /**
   * Update an existing account profile.
   */
  async updateAccount(id: number, payload: UpdateAccountPayload): Promise<Account> {
    const response = await apiClient.put<{ success: boolean; data: Account }>(`/accounts/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft delete an account.
   */
  async deleteAccount(id: number): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },

  /**
   * Transfer ownership of an account (BR-002).
   */
  async transferOwnership(id: number, newOwnerUserId: number): Promise<Account> {
    const response = await apiClient.patch<{ success: boolean; data: Account }>(
      `/accounts/${id}/transfer-ownership`,
      { owner_user_id: newOwnerUserId }
    );
    return response.data.data;
  },

  /**
   * Fetch active account types taxonomy for dropdowns.
   */
  async getAccountTypes(): Promise<AccountType[]> {
    const response = await apiClient.get<{ success: boolean; data: AccountType[] }>('/account-types');
    return response.data.data;
  },
};

export default accountService;
