import React from "react";
import { LearningModuleOption, AssignmentStatus } from "../types";

interface AssignmentFilterProps {
  modules: LearningModuleOption[];
  selectedModule: string;
  onModuleChange: (moduleId: string) => void;
  selectedDateRange: "ALL" | "UPCOMING" | "OVERDUE" | "NEXT_7_DAYS";
  onDateRangeChange: (range: "ALL" | "UPCOMING" | "OVERDUE" | "NEXT_7_DAYS") => void;
}

export function AssignmentStatusFilter({
  modules,
  selectedModule,
  onModuleChange,
  selectedDateRange,
  onDateRangeChange,
}: AssignmentFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Module filter */}
      <select
        value={selectedModule}
        onChange={(e) => onModuleChange(e.target.value)}
        className="bg-slate-900/80 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
      >
        <option value="" className="bg-slate-900 text-white">
          All Modules
        </option>
        <option value="UNLINKED" className="bg-slate-900 text-white">
          Standalone (No Module)
        </option>
        {modules.map((m) => (
          <option key={m.id} value={m.id} className="bg-slate-900 text-white">
            {m.title}
          </option>
        ))}
      </select>

      {/* Due date range filter */}
      <select
        value={selectedDateRange}
        onChange={(e) =>
          onDateRangeChange(e.target.value as "ALL" | "UPCOMING" | "OVERDUE" | "NEXT_7_DAYS")
        }
        className="bg-slate-900/80 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
      >
        <option value="ALL" className="bg-slate-900 text-white">
          All Dates
        </option>
        <option value="UPCOMING" className="bg-slate-900 text-white">
          Upcoming Due Dates
        </option>
        <option value="NEXT_7_DAYS" className="bg-slate-900 text-white">
          Due in Next 7 Days
        </option>
        <option value="OVERDUE" className="bg-slate-900 text-white">
          Overdue
        </option>
      </select>
    </div>
  );
}

interface SubmissionFilterProps {
  selectedStatus: "ALL" | AssignmentStatus;
  onStatusChange: (status: "ALL" | AssignmentStatus) => void;
}

export function SubmissionStatusFilter({ selectedStatus, onStatusChange }: SubmissionFilterProps) {
  const statuses: { label: string; value: "ALL" | AssignmentStatus }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Reviewed", value: "REVIEWED" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 bg-slate-900/80 border border-white/10 p-1 rounded-xl">
      {statuses.map((item) => (
        <button
          key={item.value}
          onClick={() => onStatusChange(item.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedStatus === item.value
              ? "bg-purple-600 text-slate-900 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
