import React, { useState, useEffect } from 'react';
import {
  TicketWithNotes,
  TicketStatus,
  TicketPriority,
} from '../types/ticket';
import { ticketService } from '../lib/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Button } from '../components/common/Button';
import { formatDateTime, formatRelativeTime } from '../lib/utils';
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Send,
  AlertCircle,
} from 'lucide-react';

interface TicketDetailPageProps {
  ticketId: string;
  onBack: () => void;
  onTicketUpdated?: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  onBack,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<TicketWithNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Note addition state
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Copy suggested response state
  const [copied, setCopied] = useState(false);

  // Status & Priority updating state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTicket() {
      setIsLoading(true);
      setError(null);
      setActionError(null);
      try {
        const data = await ticketService.getTicketById(ticketId);
        if (mounted) {
          if (!data) {
            setError(`Ticket #${ticketId} not found`);
          } else {
            setTicket(data);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : 'Error loading ticket details';
          setError(msg);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadTicket();
    return () => {
      mounted = false;
    };
  }, [ticketId]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || ticket.status === newStatus) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      await ticketService.updateTicket(ticket.ticket_id || ticket.id, {
        status: newStatus,
      });
      const refreshed = await ticketService.getTicketById(ticket.ticket_id || ticket.id);
      if (refreshed) {
        setTicket(refreshed);
      }
      onTicketUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setActionError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket || ticket.priority === newPriority) return;
    setIsUpdatingPriority(true);
    setActionError(null);
    try {
      await ticketService.updateTicket(ticket.ticket_id || ticket.id, {
        priority: newPriority,
      });
      const refreshed = await ticketService.getTicketById(ticket.ticket_id || ticket.id);
      if (refreshed) {
        setTicket(refreshed);
      }
      onTicketUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update priority';
      setActionError(msg);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !noteText.trim()) return;

    setIsAddingNote(true);
    setActionError(null);
    try {
      await ticketService.addTicketNote(ticket.ticket_id || ticket.id, noteText);
      const refreshed = await ticketService.getTicketById(ticket.ticket_id || ticket.id);
      if (refreshed) {
        setTicket(refreshed);
      }
      setNoteText('');
      onTicketUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add note';
      setActionError(msg);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCopyResponse = async () => {
    if (!ticket?.ai_suggested_response) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(ticket.ai_suggested_response);
      } else {
        const el = document.createElement('textarea');
        el.value = ticket.ai_suggested_response;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy response to clipboard:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-44 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-slate-200">Ticket Not Found</h2>
        <p className="mt-1 text-xs text-slate-400">{error || 'The requested ticket could not be found.'}</p>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onBack}>
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  const confidencePercent = ticket.ai_confidence
    ? Math.round(ticket.ai_confidence * 100)
    : null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-5">
      {/* Top Breadcrumb & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-bold text-slate-100">
                {ticket.ticket_id || `#${ticket.ticket_number}`}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span>Opened {formatRelativeTime(ticket.created_at)}</span>
              <span>•</span>
              <span>Updated {formatRelativeTime(ticket.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Fast Status Action Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <span className="px-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            State:
          </span>
          {(['open', 'in_progress', 'closed'] as TicketStatus[]).map((status) => {
            const isActive = ticket.status === status;
            return (
              <button
                key={status}
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Customer, Issue, AI Assist, History) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Issue & Customer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* Subject bar */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-sm font-semibold text-slate-100 leading-snug">
                  {ticket.subject}
                </h1>
                {ticket.category && (
                  <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Category: {ticket.category}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Info Strip */}
            <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
                  {ticket.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-200">
                    {ticket.customer_name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {ticket.customer_email}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-mono">
                {formatDateTime(ticket.created_at)}
              </div>
            </div>

            {/* Customer Message Body */}
            <div className="p-5">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-md border border-slate-800/80">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* AI Operational Assist Card (Priority: Operational Assistant, NOT a chatbot) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                  AI Operational Assist
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Operational Triage
                </span>
              </div>

              {confidencePercent !== null && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span>Confidence:</span>
                  <span className="text-blue-400 font-medium">{confidencePercent}%</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Executive Summary */}
              {ticket.ai_summary && (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Triage Synthesis
                  </h4>
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded border border-slate-800 leading-relaxed">
                    {ticket.ai_summary}
                  </div>
                </div>
              )}

              {/* Suggested Response */}
              {ticket.ai_suggested_response && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Suggested Next Action / Operator Draft
                    </h4>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleCopyResponse}
                      leftIcon={
                        copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )
                      }
                      className={copied ? 'text-emerald-400' : 'text-slate-400'}
                    >
                      {copied ? 'Copied to Clipboard' : 'Copy Draft'}
                    </Button>
                  </div>

                  <div className="relative">
                    <pre className="text-xs text-slate-200 bg-slate-950 p-4 rounded-md border border-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                      {ticket.ai_suggested_response}
                    </pre>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500">
                    Review and customize this response before dispatching to the customer.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes & Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  Internal Notes & Activity ({ticket.notes.length})
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Existing Notes Timeline */}
              {ticket.notes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No internal notes recorded on this ticket yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {ticket.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-md bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">
                            {note.author}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Staff
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatRelativeTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {note.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Input Form */}
              <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-800/80">
                <label htmlFor="internal_note_input" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Add Internal Note (Not visible to customer)
                </label>
                <textarea
                  id="internal_note_input"
                  rows={3}
                  placeholder="Record investigation findings, escalation status, or next steps..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={!noteText.trim() || isAddingNote}
                    isLoading={isAddingNote}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Add Note
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Properties & Metadata */}
        <div className="space-y-5">
          {/* Operational Controls Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              Operational Controls
            </h3>

            {/* Status Selector */}
            <div>
              <label htmlFor="ticket_status_select" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Current State
              </label>
              <select
                id="ticket_status_select"
                value={ticket.status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label htmlFor="ticket_priority_select" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Priority SLA Level
              </label>
              <select
                id="ticket_priority_select"
                value={ticket.priority || 'medium'}
                disabled={isUpdatingPriority}
                onChange={(e) =>
                  handlePriorityChange(e.target.value as TicketPriority)
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500 capitalize"
              >
                <option value="urgent">Urgent (SLA: 1h)</option>
                <option value="high">High (SLA: 4h)</option>
                <option value="medium">Medium (SLA: 12h)</option>
                <option value="low">Low (SLA: 24h)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Classified Category
              </label>
              <div className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300">
                {ticket.category || 'Unclassified'}
              </div>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              Customer Identity
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Name</span>
                <span className="font-medium text-slate-200">
                  {ticket.customer_name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Email</span>
                <span className="font-mono text-slate-300 break-all">
                  {ticket.customer_email}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Domain</span>
                <span className="font-mono text-slate-400">
                  {ticket.customer_email.split('@')[1] || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 shadow-sm text-xs">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              System Audit
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">Created</span>
                <span className="font-mono">{formatDateTime(ticket.created_at)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">Last Modified</span>
                <span className="font-mono">{formatDateTime(ticket.updated_at)}</span>
              </div>

              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="text-slate-500">Record ID</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={ticket.ticket_id || ticket.id}>
                  {ticket.ticket_id || ticket.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
