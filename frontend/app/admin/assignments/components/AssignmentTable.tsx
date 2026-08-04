import React from "react";
import Link from "next/link";
import { Assignment } from "../types";
import { statusBadge } from "@/app/components/ui/badge";
import { Calendar, Award, Users, Edit, Trash2, ChevronRight, FileCheck } from "lucide-react";

interface AssignmentTableProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string, title: string) => void;
}

export function AssignmentTable({ assignments, onEdit, onDelete }: AssignmentTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((asgn) => {
        const stats = asgn.submissionStats ?? {
          total: 0,
          pending: 0,
          submitted: 0,
          reviewed: 0,
          approved: 0,
          rejected: 0,
        };
        const isOverdue = asgn.dueDate ? new Date(asgn.dueDate) < new Date() : false;

        return (
          <div
            key={asgn.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition group shadow-sm"
          >
            <div className="space-y-3">
              {/* Header: Title & Action Controls */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-slate-900 font-bold text-base leading-snug group-hover:text-blue-600 transition">
                    {asgn.title}
                  </h3>
                  {asgn.module ? (
                    <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      {asgn.module.title}
                    </span>
                  ) : (
                    <span className="inline-block bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      Standalone Task
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onEdit(asgn)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit assignment"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(asgn.id, asgn.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete assignment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {asgn.description && (
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {asgn.description}
                </p>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={14} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Due Date</span>
                    <span className={isOverdue ? "text-red-600 font-semibold" : "text-slate-700 font-medium"}>
                      {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString() : "No due date"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Award size={14} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Max Score</span>
                    <span className="text-slate-700 font-semibold">{asgn.maxScore} XP</span>
                  </div>
                </div>
              </div>

              {/* Submissions Breakdown Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" />
                    <span>Submissions Breakdown</span>
                  </span>
                  <span className="font-semibold text-slate-900">{stats.total} total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl py-1.5 px-2">
                    <span className="text-amber-700 font-bold block">{stats.submitted + stats.pending}</span>
                    <span className="text-amber-600/80 text-[10px]">Pending</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl py-1.5 px-2">
                    <span className="text-emerald-700 font-bold block">{stats.approved}</span>
                    <span className="text-emerald-600/80 text-[10px]">Approved</span>
                  </div>
                  <div className="bg-red-50/50 border border-red-200/60 rounded-xl py-1.5 px-2">
                    <span className="text-red-700 font-bold block">{stats.rejected}</span>
                    <span className="text-red-600/80 text-[10px]">Rejected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Submissions Footer CTA */}
            <div className="pt-2">
              <Link
                href={`/admin/assignments/${asgn.id}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 border border-blue-200 text-blue-700 hover:text-white font-semibold rounded-xl py-2.5 text-xs transition shadow-sm group-hover:bg-blue-600 group-hover:text-white"
              >
                <FileCheck size={15} />
                <span>View Submissions ({stats.total})</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
