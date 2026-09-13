/**
 * Production HTTP TicketService communicating with FastAPI backend.
 * Replaces mock/localStorage implementation.
 */

import {
  Ticket,
  TicketWithNotes,
  TicketNote,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilterParams,
  TicketListResponse,
  OperationalMetrics,
  TicketStatus,
  TicketPriority,
  ApiTicketSummary,
  ApiTicketDetail,
} from '../../types/ticket';
import {
  listTickets as apiListTickets,
  getTicket as apiGetTicket,
  createTicket as apiCreateTicket,
  updateTicket as apiUpdateTicket,
  parseTicketNumber,
} from './tickets';
import { ApiError } from './client';

export interface TicketService {
  getTickets(params?: TicketFilterParams): Promise<TicketListResponse>;
  getTicketById(id: string): Promise<TicketWithNotes | null>;
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket>;
  addTicketNote(ticketId: string, note: string, author?: string): Promise<TicketNote>;
  getMetrics(): Promise<OperationalMetrics>;
}

function mapSummaryToTicket(summary: ApiTicketSummary): Ticket {
  return {
    id: summary.ticket_id,
    ticket_id: summary.ticket_id,
    ticket_number: parseTicketNumber(summary.ticket_id),
    customer_name: summary.customer_name,
    customer_email: summary.customer_email,
    subject: summary.subject,
    description: '',
    status: (summary.status || 'open') as TicketStatus,
    priority: summary.priority as TicketPriority | null,
    category: summary.category,
    ai_summary: summary.ai_summary,
    ai_confidence: summary.ai_confidence,
    created_at: summary.created_at,
    updated_at: summary.updated_at,
  };
}

function mapDetailToTicket(detail: ApiTicketDetail): TicketWithNotes {
  return {
    id: detail.ticket_id,
    ticket_id: detail.ticket_id,
    ticket_number: parseTicketNumber(detail.ticket_id),
    customer_name: detail.customer_name,
    customer_email: detail.customer_email,
    subject: detail.subject,
    description: detail.description,
    status: (detail.status || 'open') as TicketStatus,
    priority: detail.priority as TicketPriority | null,
    category: detail.category,
    ai_summary: detail.ai_summary,
    ai_suggested_response: detail.ai_suggested_response,
    ai_confidence: detail.ai_confidence,
    created_at: detail.created_at,
    updated_at: detail.updated_at,
    notes: (detail.notes || []).map((n) => ({
      id: String(n.id),
      ticket_id: detail.ticket_id,
      note: n.note,
      author: n.author || 'agent',
      created_at: n.created_at,
    })),
  };
}

class HttpTicketService implements TicketService {
  async getTickets(params: TicketFilterParams = {}): Promise<TicketListResponse> {
    const {
      search = '',
      status = 'all',
      priority = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10,
    } = params;

    // Call FastAPI GET /api/tickets with server-side status and search filters
    const summaries = await apiListTickets({
      search: search.trim() || undefined,
      status: status !== 'all' ? status : undefined,
    });

    let tickets: Ticket[] = summaries.map(mapSummaryToTicket);

    // Client-side priority filter if specified
    if (priority && priority !== 'all') {
      tickets = tickets.filter((t) => t.priority === priority);
    }

    // Client-side sorting
    tickets.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'updated_at') {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'ticket_number') {
        comparison = a.ticket_number - b.ticket_number;
      } else if (sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const weightA = a.priority ? priorityWeight[a.priority] || 0 : 0;
        const weightB = b.priority ? priorityWeight[b.priority] || 0 : 0;
        comparison = weightA - weightB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = tickets.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedTickets = tickets.slice(startIndex, startIndex + pageSize);

    return {
      tickets: paginatedTickets,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getTicketById(id: string): Promise<TicketWithNotes | null> {
    try {
      const detail = await apiGetTicket(id);
      return mapDetailToTicket(detail);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const res = await apiCreateTicket({
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      subject: input.subject,
      description: input.description,
    });

    // Fetch the newly created ticket from the server
    const detail = await apiGetTicket(res.ticket_id);
    return mapDetailToTicket(detail);
  }

  async updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket> {
    let currentStatus: TicketStatus = updates.status || 'open';

    if (!updates.status) {
      const existing = await apiGetTicket(id);
      currentStatus = (existing.status as TicketStatus) || 'open';
    }

    await apiUpdateTicket(id, {
      status: currentStatus,
      notes: updates.notes || '',
    });

    const refreshed = await apiGetTicket(id);
    return mapDetailToTicket(refreshed);
  }

  async addTicketNote(ticketId: string, noteText: string, author = 'agent'): Promise<TicketNote> {
    const existing = await apiGetTicket(ticketId);
    const currentStatus = (existing.status as TicketStatus) || 'open';

    await apiUpdateTicket(ticketId, {
      status: currentStatus,
      notes: noteText.trim(),
    });

    const refreshed = await apiGetTicket(ticketId);
    const notes = refreshed.notes || [];
    if (notes.length > 0) {
      const latest = notes[notes.length - 1];
      return {
        id: String(latest.id),
        ticket_id: refreshed.ticket_id,
        note: latest.note,
        author: latest.author || author,
        created_at: latest.created_at,
      };
    }

    return {
      id: `note-${Date.now()}`,
      ticket_id: ticketId,
      note: noteText.trim(),
      author,
      created_at: new Date().toISOString(),
    };
  }

  async getMetrics(): Promise<OperationalMetrics> {
    const summaries = await apiListTickets();
    const total = summaries.length;
    const open = summaries.filter((t) => t.status === 'open').length;
    const in_progress = summaries.filter((t) => t.status === 'in_progress').length;
    const closed = summaries.filter((t) => t.status === 'closed').length;
    const urgent_high = summaries.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'closed'
    ).length;
    const triaged = summaries.filter((t) => t.ai_summary !== null).length;
    const ai_triaged_percent = total > 0 ? Math.round((triaged / total) * 100) : 0;

    return {
      total,
      open,
      in_progress,
      closed,
      urgent_high,
      ai_triaged_percent,
    };
  }
}

export const ticketService: TicketService = new HttpTicketService();
