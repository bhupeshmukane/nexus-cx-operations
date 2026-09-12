import React from 'react';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="divide-y divide-slate-800 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-4 py-3.5 flex items-center gap-4">
          <div className="w-12 h-4 bg-slate-800 rounded" />
          <div className="w-40 space-y-1">
            <div className="w-24 h-3.5 bg-slate-800 rounded" />
            <div className="w-32 h-2.5 bg-slate-800/60 rounded" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="w-3/4 h-3.5 bg-slate-800 rounded" />
            <div className="w-24 h-2.5 bg-slate-800/60 rounded" />
          </div>
          <div className="w-20 h-5 bg-slate-800 rounded" />
          <div className="w-20 h-5 bg-slate-800 rounded" />
          <div className="w-24 h-4 bg-slate-800 rounded" />
          <div className="w-16 h-3 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
};
