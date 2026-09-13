import React from 'react';
import { Ticket } from '../../types/ticket';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import { formatRelativeTime } from '../../lib/utils';
import { Sparkles, ChevronRight } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  onSelectTicket: (ticketId: string) => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onCreateTicket?: () => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  isLoading,
  onSelectTicket,
  isFiltered,
  onResetFilters,
  onCreateTicket,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-20 font-mono">ID</th>
              <th className="py-3 px-4 w-52">Customer</th>
              <th className="py-3 px-4 min-w-[280px]">Subject & Category</th>
              <th className="py-3 px-4 w-28">Priority</th>
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4 w-32">AI Triage</th>
              <th className="py-3 px-4 w-28 text-right">Updated</th>
              <th className="py-3 px-2 w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <TableSkeleton />
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <EmptyState
                    isFiltered={isFiltered}
                    onResetFilters={onResetFilters}
                    onCreateTicket={onCreateTicket}
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const confidencePercent = ticket.ai_confidence
                  ? Math.round(ticket.ai_confidence * 100)
                  : null;

                return (
                  <tr
                    key={ticket.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ticket ${ticket.ticket_id || `#${ticket.ticket_number}`}`}
                    onClick={() => onSelectTicket(ticket.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTicket(ticket.id);
                      }
                    }}
                    className="hover:bg-slate-800/50 focus-visible:bg-slate-800/60 focus-visible:outline-none cursor-pointer transition-colors duration-100 group"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-400 group-hover:text-blue-400">
                      {ticket.ticket_id || `#${ticket.ticket_number}`}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 group-hover:text-white truncate max-w-[190px]">
                        {ticket.customer_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[190px]">
                        {ticket.customer_email}
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200 group-hover:text-slate-100 truncate max-w-[340px]">
                          {ticket.subject}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {ticket.category && (
                          <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                            {ticket.category}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 truncate max-w-[240px]">
                          {ticket.description.slice(0, 75)}...
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    {/* AI Assist Info */}
                    <td className="py-3 px-4">
                      {confidencePercent !== null ? (
                        <span
                          title={ticket.ai_summary || 'AI Triaged'}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        >
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>{confidencePercent}%</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-mono">Pending</span>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {formatRelativeTime(ticket.updated_at)}
                    </td>

                    {/* Arrow Action */}
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
