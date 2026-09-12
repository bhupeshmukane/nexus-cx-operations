export type TicketStatus = 'open' | 'in_progress' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  ticket_number: number;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority | null;
  category: string | null;
  ai_summary: string | null;
  ai_suggested_response: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  note: string;
  author: string;
  created_at: string;
}

export interface TicketWithNotes extends Ticket {
  notes: TicketNote[];
}

export interface CreateTicketInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: TicketPriority | null;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority | null;
}

export interface TicketFilterParams {
  search?: string;
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'ticket_number';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OperationalMetrics {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  urgent_high: number;
  ai_triaged_percent: number;
}
