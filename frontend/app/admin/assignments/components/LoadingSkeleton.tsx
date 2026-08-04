import React from "react";

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-100 rounded w-3/4" />
            <div className="h-5 bg-slate-100 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="h-8 bg-slate-50 rounded-lg" />
            <div className="h-8 bg-slate-50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
