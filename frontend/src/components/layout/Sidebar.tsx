import {
  Inbox,
  BarChart3,
  Settings,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  openTicketsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  openTicketsCount = 0,
}) => {
  const navItems = [
    {
      id: 'tickets',
      label: 'Tickets',
      icon: <Inbox className="w-4 h-4" />,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      active: currentView === 'dashboard' || currentView === 'detail' || currentView === 'create',
    },
    {
      id: 'triage',
      label: 'AI Triage Queue',
      icon: <Sparkles className="w-4 h-4 text-blue-400" />,
      badge: 'Live',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      disabled: false,
    },
    {
      id: 'analytics',
      label: 'Operations Metrics',
      icon: <BarChart3 className="w-4 h-4" />,
      disabled: true,
      badge: 'Soon',
    },
    {
      id: 'settings',
      label: 'Console Settings',
      icon: <Settings className="w-4 h-4" />,
      disabled: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-slate-100">
                NEXUS
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v0.1
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight">
              CX Operations Console
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6">
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.active;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.disabled) {
                        onNavigate('dashboard');
                      }
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors text-left',
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent',
                      item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-400'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(isActive ? 'text-blue-400' : 'text-slate-400')}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                          item.badgeColor ||
                            (isActive
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700')
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 rounded-md bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FastAPI & Supabase</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Connected via secure API gateway. Direct client Supabase access restricted.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Profile & System Health */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-300">Backend API Online</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">200 OK</span>
        </div>

        <div className="p-2 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-300">
              OP
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200">Operator Console</span>
              <span className="text-[10px] text-slate-500">Tier-2 Response Lead</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
