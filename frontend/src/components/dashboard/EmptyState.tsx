import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '../common/Button';

interface EmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onCreateTicket?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered = false,
  onResetFilters,
  onCreateTicket,
}) => {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
        <Inbox className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
        {isFiltered ? 'No matching tickets found' : 'No tickets in queue'}
      </h3>

      <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
        {isFiltered
          ? 'Try adjusting your search criteria, clearing selected filters, or resetting your query.'
          : 'All operational customer inquiries have been resolved or triaged.'}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {isFiltered && onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Reset Filters
          </Button>
        )}
        {onCreateTicket && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateTicket}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create New Ticket
          </Button>
        )}
      </div>
    </div>
  );
};
