import {
  Ticket,
  TicketWithNotes,
  TicketNote,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilterParams,
  TicketListResponse,
  OperationalMetrics,
} from '../../types/ticket';
import { INITIAL_TICKETS } from './mockData';

const STORAGE_KEY = 'nexus_tickets_v1';

export interface TicketService {
  getTickets(params?: TicketFilterParams): Promise<TicketListResponse>;
  getTicketById(id: string): Promise<TicketWithNotes | null>;
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket>;
  addTicketNote(ticketId: string, note: string, author?: string): Promise<TicketNote>;
  getMetrics(): Promise<OperationalMetrics>;
}

function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class MockTicketService implements TicketService {
  private tickets: TicketWithNotes[];

  constructor() {
    this.tickets = this.loadTickets();
  }

  private loadTickets(): TicketWithNotes[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === 'object' &&
          parsed[0] !== null &&
          'id' in parsed[0] &&
          'ticket_number' in parsed[0]
        ) {
          return parsed as TicketWithNotes[];
        } else {
          console.warn('[NEXUS] Invalid tickets format in localStorage, resetting to initial data.');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn('[NEXUS] Could not parse tickets from localStorage, resetting:', err);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore removal error in private/restricted browsing modes
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_TICKETS));
  }

  private saveTickets(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets));
    } catch (err) {
      console.warn('[NEXUS] Failed to persist tickets to localStorage:', err);
    }
  }

  // Artificial latency to exercise UI loading skeletons
  private async delay(ms = 180): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTickets(params: TicketFilterParams = {}): Promise<TicketListResponse> {
    await this.delay(150);
    const {
      search = '',
      status = 'all',
      priority = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10,
    } = params;

    let filtered = [...this.tickets];

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.ticket_number.toString().includes(query) ||
          t.customer_name.toLowerCase().includes(query) ||
          t.customer_email.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'updated_at') {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortBy === 'ticket_number') {
        comparison = a.ticket_number - b.ticket_number;
      } else if (sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const weightA = a.priority ? priorityWeight[a.priority] || 0 : 0;
        const weightB = b.priority ? priorityWeight[b.priority] || 0 : 0;
        comparison = weightA - weightB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedTickets = filtered.slice(startIndex, startIndex + pageSize);

    // Strip notes in list view for performance (matching SQL tickets table)
    const listTickets: Ticket[] = paginatedTickets.map(({ notes: _, ...ticket }) => ticket);

    return {
      tickets: listTickets,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getTicketById(id: string): Promise<TicketWithNotes | null> {
    await this.delay(120);
    const found = this.tickets.find((t) => t.id === id || t.ticket_number.toString() === id);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  }

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    await this.delay(200);
    const highestNumber = this.tickets.reduce((max, t) => Math.max(max, t.ticket_number), 1000);
    const now = new Date().toISOString();

    // Default heuristic category & AI assist placeholder until backend AI triage pipeline is hooked
    const newTicket: TicketWithNotes = {
      id: generateId('ticket'),
      ticket_number: highestNumber + 1,
      customer_name: input.customer_name.trim(),
      customer_email: input.customer_email.trim(),
      subject: input.subject.trim(),
      description: input.description.trim(),
      status: 'open',
      priority: input.priority || 'medium',
      category: 'General Operations',
      ai_summary: `Customer ${input.customer_name.trim()} submitted inquiry regarding: ${input.subject.trim()}. Awaiting agent evaluation.`,
      ai_suggested_response: `Hello ${input.customer_name.trim()},\n\nThank you for reaching out to NEXUS Support regarding "${input.subject.trim()}". We have received your inquiry and our operational team is currently reviewing your account details. We will update this thread shortly with actionable next steps.`,
      ai_confidence: 0.8500,
      created_at: now,
      updated_at: now,
      notes: [],
    };

    this.tickets.unshift(newTicket);
    this.saveTickets();

    const { notes: _, ...ticketOnly } = newTicket;
    return ticketOnly;
  }

  async updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket> {
    await this.delay(100);
    const index = this.tickets.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found`);
    }

    const current = this.tickets[index];
    const now = new Date().toISOString();

    const updated: TicketWithNotes = {
      ...current,
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
      updated_at: now,
    };

    this.tickets[index] = updated;
    this.saveTickets();

    const { notes: _, ...ticketOnly } = updated;
    return ticketOnly;
  }

  async addTicketNote(ticketId: string, noteText: string, author = 'Agent (You)'): Promise<TicketNote> {
    await this.delay(120);
    const index = this.tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const newNote: TicketNote = {
      id: generateId('note'),
      ticket_id: ticketId,
      note: noteText.trim(),
      author,
      created_at: new Date().toISOString(),
    };

    this.tickets[index].notes.push(newNote);
    this.tickets[index].updated_at = new Date().toISOString();
    this.saveTickets();

    return newNote;
  }

  async getMetrics(): Promise<OperationalMetrics> {
    await this.delay(80);
    const total = this.tickets.length;
    const open = this.tickets.filter((t) => t.status === 'open').length;
    const in_progress = this.tickets.filter((t) => t.status === 'in_progress').length;
    const closed = this.tickets.filter((t) => t.status === 'closed').length;
    const urgent_high = this.tickets.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'closed'
    ).length;
    const triaged = this.tickets.filter((t) => t.ai_summary !== null).length;
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

export const ticketService: TicketService = new MockTicketService();
