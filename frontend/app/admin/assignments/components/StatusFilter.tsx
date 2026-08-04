import React from "react";
import { LearningModuleOption } from "../types";

interface StatusFilterProps {
  moduleId: string;
  onModuleChange: (val: string) => void;
  dueDateRange: string;
  onDueDateChange: (val: string) => void;
  modules: LearningModuleOption[];
}

export function StatusFilter({
  moduleId,
  onModuleChange,
  dueDateRange,
  onDueDateChange,
  modules,
}: StatusFilterProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-3">
      {/* Module Filter */}
      <select
        value={moduleId}
        onChange={(e) => onModuleChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer min-w-[200px] shadow-sm"
      >
        <option value="all">All Modules</option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>

      {/* Due Date Filter */}
      <select
        value={dueDateRange}
        onChange={(e) => onDueDateChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer shadow-sm"
      >
        <option value="all">All Due Dates</option>
        <option value="upcoming">Upcoming / Active</option>
        <option value="overdue">Past Due</option>
        <option value="no_due_date">No Due Date</option>
      </select>
    </div>
  );
}
