import apiClient from './api';
import type {
  CreateTicketCommentPayload,
  CreateTicketPayload,
  Ticket,
  TicketCategory,
  TicketCounts,
  TicketFilters,
  TicketMetrics,
  TicketStatus,
  UpdateTicketPayload,
} from '../types/ticket';

export interface TicketsResponse {
  status: string;
  data: Ticket[];
  counts: TicketCounts;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const ticketService = {
  /**
   * Fetch paginated list of tickets with queue filters, search, and tab counts.
   */
  async getTickets(filters: TicketFilters = {}): Promise<TicketsResponse> {
    const params = new URLSearchParams();
    if (filters.queue) params.append('queue', filters.queue);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category_id) params.append('category_id', String(filters.category_id));
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await apiClient.get<TicketsResponse>(`/tickets?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch operational KPI metrics for the 4 hub cards.
   */
  async getMetrics(): Promise<TicketMetrics> {
    const response = await apiClient.get<{ status: string; data: TicketMetrics }>('/tickets/metrics');
    return response.data.data;
  },

  /**
   * Get single ticket with comments and escalation audit trail.
   */
  async getTicket(id: number): Promise<Ticket> {
    const response = await apiClient.get<{ status: string; data: Ticket }>(`/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Create a new support ticket.
   */
  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    const response = await apiClient.post<{ status: string; data: Ticket }>('/tickets', payload);
    return response.data.data;
  },

  /**
   * Update ticket fields.
   */
  async updateTicket(id: number, payload: UpdateTicketPayload): Promise<Ticket> {
    const response = await apiClient.put<{ status: string; data: Ticket }>(`/tickets/${id}`, payload);
    return response.data.data;
  },

  /**
   * 1-Click claim ticket by current support engineer.
   */
  async claimTicket(id: number): Promise<Ticket> {
    const response = await apiClient.post<{ status: string; data: Ticket }>(`/tickets/${id}/claim`);
    return response.data.data;
  },

  /**
   * Reassign ticket to another agent.
   */
  async assignTicket(id: number, assigneeUserId: number): Promise<Ticket> {
    const response = await apiClient.patch<{ status: string; data: Ticket }>(`/tickets/${id}/assign`, {
      assignee_user_id: assigneeUserId,
    });
    return response.data.data;
  },

  /**
   * Add a public customer reply or private staff note.
   */
  async addComment(id: number, payload: CreateTicketCommentPayload): Promise<{ comment: any; ticket: Ticket }> {
    const response = await apiClient.post<{ status: string; data: { comment: any; ticket: Ticket } }>(
      `/tickets/${id}/comments`,
      payload
    );
    return response.data.data;
  },

  /**
   * Update ticket lifecycle status.
   */
  async updateStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const response = await apiClient.patch<{ status: string; data: Ticket }>(`/tickets/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  /**
   * Manually escalate ticket.
   */
  async escalateTicket(id: number, reason?: string): Promise<Ticket> {
    const response = await apiClient.post<{ status: string; data: Ticket }>(`/tickets/${id}/escalate`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * Delete ticket.
   */
  async deleteTicket(id: number): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  /**
   * Fetch active ticket categories for dropdowns.
   */
  async getCategories(): Promise<TicketCategory[]> {
    const response = await apiClient.get<{ status: string; data: TicketCategory[] }>('/ticket-categories');
    return response.data.data;
  },
};
