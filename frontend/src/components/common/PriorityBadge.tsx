import React from 'react';
import { TicketPriority } from '../../types/ticket';
import { cn } from '../../lib/utils';

interface PriorityBadgeProps {
  priority: TicketPriority | null;
  className?: string;
  showDotOnly?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
  showDotOnly = false,
}) => {
  if (!priority) {
    return <span className="text-xs text-slate-500">—</span>;
  }

  const configs: Record<
    TicketPriority,
    { label: string; bg: string; text: string; dot: string }
  > = {
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-500/10 border-rose-500/25',
      text: 'text-rose-400',
      dot: 'bg-rose-500',
    },
    high: {
      label: 'High',
      bg: 'bg-orange-500/10 border-orange-500/25',
      text: 'text-orange-400',
      dot: 'bg-orange-400',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-sky-500/10 border-sky-500/25',
      text: 'text-sky-400',
      dot: 'bg-sky-400',
    },
    low: {
      label: 'Low',
      bg: 'bg-slate-500/10 border-slate-500/25',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[priority] || configs.medium;

  if (showDotOnly) {
    return (
      <span
        title={`Priority: ${config.label}`}
        className={cn('inline-block w-2 h-2 rounded-full', config.dot, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border capitalize',
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
