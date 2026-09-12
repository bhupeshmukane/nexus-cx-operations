import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center gap-4">
        <span>
          Showing <strong className="text-slate-200 font-medium">{startItem}</strong> to{' '}
          <strong className="text-slate-200 font-medium">{endItem}</strong> of{' '}
          <strong className="text-slate-200 font-medium">{total}</strong> tickets
        </span>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-500">Rows:</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded text-slate-300 text-xs focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-500 mr-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="xs"
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 px-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        <Button
          variant="outline"
          size="xs"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 px-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
