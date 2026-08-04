import React from "react";
import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No assignments found",
  description = "Get started by creating your first assignment or adjust your filter criteria.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-12 text-center shadow-sm">
      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
        <FileText size={24} />
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto mt-1.5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-semibold rounded-xl px-4 py-2.5 text-sm transition"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
