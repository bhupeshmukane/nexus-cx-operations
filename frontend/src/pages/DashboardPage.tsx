import { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  TicketFilterParams,
  OperationalMetrics,
  TicketStatus,
  TicketPriority,
} from '../types/ticket';
import { ticketService } from '../lib/api';
import { MetricsBar } from '../components/dashboard/MetricsBar';
import { TicketFilters } from '../components/dashboard/TicketFilters';
import { TicketTable } from '../components/dashboard/TicketTable';
import { Pagination } from '../components/dashboard/Pagination';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

interface DashboardPageProps {
  onSelectTicket: (ticketId: string) => void;
  onCreateTicket: () => void;
  refreshTrigger?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTicket,
  onCreateTicket,
  refreshTrigger = 0,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    total: 0,
    open: 0,
    in_progress: 0,
    closed: 0,
    urgent_high: 0,
    ai_triaged_percent: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<TicketFilterParams>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ticketsResponse, metricsResponse] = await Promise.all([
        ticketService.getTickets(filters),
        ticketService.getMetrics(),
      ]);

      setTickets(ticketsResponse.tickets);
      setTotalPages(ticketsResponse.totalPages);
      setTotalCount(ticketsResponse.total);
      setMetrics(metricsResponse);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load tickets from NEXUS API server.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10,
    });
  };

  const handleFilterStatus = (status: TicketStatus | 'all') => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleFilterPriority = (priority: TicketPriority | 'all') => {
    setFilters((prev) => ({
      ...prev,
      priority,
      page: 1,
    }));
  };

  const isFiltered =
    Boolean(filters.search) ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all');

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* API Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-semibold text-rose-200">API Connection Error: </span>
              <span>{error}</span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="xs"
            onClick={fetchData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <MetricsBar
        metrics={metrics}
        onFilterStatus={handleFilterStatus}
        onFilterPriority={handleFilterPriority}
      />

      {/* Filter and Search Toolbar */}
      <TicketFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Ticket List Table */}
      <div className="space-y-0">
        <TicketTable
          tickets={tickets}
          isLoading={isLoading}
          onSelectTicket={onSelectTicket}
          isFiltered={isFiltered}
          onResetFilters={handleResetFilters}
          onCreateTicket={onCreateTicket}
        />

        {!isLoading && totalCount > 0 && (
          <Pagination
            page={filters.page || 1}
            pageSize={filters.pageSize || 10}
            total={totalCount}
            totalPages={totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) =>
              setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
            }
          />
        )}
      </div>
    </div>
  );
};
