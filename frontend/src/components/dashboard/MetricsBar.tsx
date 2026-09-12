import React from 'react';
import { OperationalMetrics, TicketStatus, TicketPriority } from '../../types/ticket';
import { MetricsCard } from '../common/MetricsCard';
import { Inbox, Clock, AlertTriangle, Sparkles } from 'lucide-react';

interface MetricsBarProps {
  metrics: OperationalMetrics;
  onFilterStatus?: (status: TicketStatus | 'all') => void;
  onFilterPriority?: (priority: TicketPriority | 'all') => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  onFilterStatus,
  onFilterPriority,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <MetricsCard
        label="Total In Queue"
        value={metrics.total}
        subtext="All operational tickets"
        icon={<Inbox className="w-4 h-4" />}
        onClick={onFilterStatus ? () => onFilterStatus('all') : undefined}
      />

      <MetricsCard
        label="Open"
        value={metrics.open}
        subtext="Requires initial review"
        highlight="amber"
        icon={<Clock className="w-4 h-4 text-amber-400" />}
        onClick={onFilterStatus ? () => onFilterStatus('open') : undefined}
      />

      <MetricsCard
        label="In Progress"
        value={metrics.in_progress}
        subtext="Active triage / handling"
        highlight="blue"
        icon={<Clock className="w-4 h-4 text-blue-400" />}
        onClick={onFilterStatus ? () => onFilterStatus('in_progress') : undefined}
      />

      <MetricsCard
        label="Urgent / High"
        value={metrics.urgent_high}
        subtext="SLA critical focus"
        highlight="rose"
        icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
        onClick={onFilterPriority ? () => onFilterPriority('urgent') : undefined}
      />

      <MetricsCard
        label="AI Triage"
        value={`${metrics.ai_triaged_percent}%`}
        subtext="Classified & summarized"
        highlight="emerald"
        icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
      />
    </div>
  );
};
