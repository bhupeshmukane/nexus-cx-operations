import React from 'react';
import { Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  breadcrumbs: { label: string; onClick?: () => void }[];
  onCreateClick?: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  onCreateClick,
  onRefreshClick,
  isRefreshing = false,
}) => {
  return (
    <header className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              {crumb.onClick && !isLast ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={isLast ? 'text-slate-200 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {onRefreshClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Refresh ticket queue"
            aria-label="Refresh ticket queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}

        {onCreateClick && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateClick}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Ticket
          </Button>
        )}
      </div>
    </header>
  );
};
