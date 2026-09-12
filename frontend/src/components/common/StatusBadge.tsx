import React from 'react';
import { TicketStatus } from '../../types/ticket';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; dot: string }> = {
    open: {
      label: 'Open',
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
      dot: 'bg-blue-400',
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-500/10 border-slate-500/20',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[status] || configs.open;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border tracking-wide',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};
