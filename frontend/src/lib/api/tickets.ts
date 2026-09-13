/**
 * Ticket API functions communicating with FastAPI backend.
 */

import { apiClient } from './client';
import {
  ApiTicketSummary,
  ApiTicketDetail,
  ApiTicketCreatePayload,
  ApiTicketCreateResponse,
  ApiTicketUpdatePayload,
  ApiTicketUpdateResponse,
} from '../../types/ticket';

export interface ListTicketsParams {
  search?: string;
  status?: string;
}

export function parseTicketNumber(ticketId: string): number {
  if (!ticketId) return 0;
  const match = ticketId.match(/(?:TKT-)?(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * GET /api/tickets
 * Query parameters: search (optional), status (optional)
 */
export async function listTickets(params: ListTicketsParams = {}): Promise<ApiTicketSummary[]> {
  const queryParams: Record<string, string | undefined> = {};

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  if (params.status && params.status !== 'all') {
    queryParams.status = params.status.trim();
  }

  return apiClient<ApiTicketSummary[]>('/api/tickets', {
    method: 'GET',
    params: queryParams,
  });
}

/**
 * GET /api/tickets/{ticket_id}
 */
export async function getTicket(ticketId: string): Promise<ApiTicketDetail> {
  const cleanId = ticketId.trim();
  return apiClient<ApiTicketDetail>(`/api/tickets/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
  });
}

/**
 * POST /api/tickets
 */
export async function createTicket(
  payload: ApiTicketCreatePayload
): Promise<ApiTicketCreateResponse> {
  return apiClient<ApiTicketCreateResponse>('/api/tickets', {
    method: 'POST',
    body: {
      customer_name: payload.customer_name.trim(),
      customer_email: payload.customer_email.trim(),
      subject: payload.subject.trim(),
      description: payload.description.trim(),
    },
  });
}

/**
 * PUT /api/tickets/{ticket_id}
 */
export async function updateTicket(
  ticketId: string,
  payload: ApiTicketUpdatePayload
): Promise<ApiTicketUpdateResponse> {
  const cleanId = ticketId.trim();
  return apiClient<ApiTicketUpdateResponse>(`/api/tickets/${encodeURIComponent(cleanId)}`, {
    method: 'PUT',
    body: {
      status: payload.status,
      notes: payload.notes || '',
    },
  });
}
