import { BookOpen } from "lucide-react";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
      <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded mb-3" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}
