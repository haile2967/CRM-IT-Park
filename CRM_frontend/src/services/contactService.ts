import apiClient from './api';
import type {
  Contact,
  ContactFilters,
  ContactsResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';

export const contactService = {
  /**
   * Fetch contacts list with optional search and account filtering.
   */
  async getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
    const params = new URLSearchParams();
    if (filters.account_id) params.append('account_id', String(filters.account_id));
    if (filters.search) params.append('search', filters.search);
    if (filters.is_primary !== undefined) params.append('is_primary', String(filters.is_primary));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await apiClient.get<ContactsResponse>(`/contacts?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single contact details.
   */
  async getContact(id: number): Promise<Contact> {
    const response = await apiClient.get<{ success: boolean; data: Contact }>(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Create a new contact person.
   */
  async createContact(payload: CreateContactPayload): Promise<Contact> {
    const response = await apiClient.post<{ success: boolean; data: Contact }>('/contacts', payload);
    return response.data.data;
  },

  /**
   * Update an existing contact person.
   */
  async updateContact(id: number, payload: UpdateContactPayload): Promise<Contact> {
    const response = await apiClient.put<{ success: boolean; data: Contact }>(`/contacts/${id}`, payload);
    return response.data.data;
  },

  /**
   * Set contact as the primary point of contact for its account.
   */
  async setPrimary(id: number): Promise<Contact> {
    const response = await apiClient.patch<{ success: boolean; data: Contact }>(`/contacts/${id}/primary`);
    return response.data.data;
  },

  /**
   * Soft delete a contact.
   */
  async deleteContact(id: number): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  },
};

export default contactService;
