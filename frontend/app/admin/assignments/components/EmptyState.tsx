import React from "react";
import { FileText, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No assignments found",
  description = "Get started by creating your first assignment or adjusting your filters.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
        <FileText size={28} />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl px-4 py-2.5 transition shadow-sm"
        >
          <PlusCircle size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
