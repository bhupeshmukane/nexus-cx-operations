import React from 'react';
import { cn } from '../../lib/utils';

interface MetricsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  highlight?: 'default' | 'amber' | 'blue' | 'rose' | 'emerald';
  className?: string;
  onClick?: () => void;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  subtext,
  icon,
  highlight = 'default',
  className,
  onClick,
}) => {
  const highlights = {
    default: 'border-slate-800 bg-slate-900/90 text-slate-100',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    rose: 'border-rose-500/20 bg-rose-500/5 text-rose-300',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3.5 rounded-lg border flex flex-col justify-between transition-all duration-150',
        highlights[highlight],
        onClick && 'cursor-pointer hover:border-slate-700',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-100 font-sans">
          {value}
        </span>
        {subtext && (
          <span className="text-xs font-medium text-slate-400 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
