import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { TicketFilterParams, TicketStatus, TicketPriority } from '../../types/ticket';
import { Button } from '../common/Button';

interface TicketFiltersProps {
  filters: TicketFilterParams;
  onChange: (newFilters: TicketFilterParams) => void;
  onReset: () => void;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Search tickets"
            placeholder="Search tickets by ID, customer name, email, or subject..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '', page: 1 })}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <label htmlFor="filter_status_select" className="hidden sm:inline text-slate-500 font-medium">
              Status:
            </label>
            <select
              id="filter_status_select"
              aria-label="Filter tickets by status"
              value={filters.status || 'all'}
              onChange={(e) =>
                onChange({
                  ...filters,
                  status: e.target.value as TicketStatus | 'all',
                  page: 1,
                })
              }
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <label htmlFor="filter_priority_select" className="hidden sm:inline text-slate-500 font-medium">
              Priority:
            </label>
            <select
              id="filter_priority_select"
              aria-label="Filter tickets by priority"
              value={filters.priority || 'all'}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priority: e.target.value as TicketPriority | 'all',
                  page: 1,
                })
              }
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            <select
              aria-label="Sort tickets by"
              value={`${filters.sortBy || 'created_at'}_${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_') as [
                  'created_at' | 'updated_at' | 'priority' | 'ticket_number',
                  'asc' | 'desc',
                ];
                onChange({ ...filters, sortBy, sortOrder });
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="priority_desc">Highest Priority</option>
              <option value="ticket_number_desc">Ticket # (Desc)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onReset}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
