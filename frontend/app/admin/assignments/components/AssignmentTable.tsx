import React from "react";
import Link from "next/link";
import { Edit2, Trash2, ArrowRight, Calendar, Award, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Assignment } from "../types";

interface AssignmentTableProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

export function AssignmentTable({ assignments, onEdit, onDelete }: AssignmentTableProps) {
  const isPastDue = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    return new Date(dueDateStr).getTime() < Date.now();
  };

  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/8 text-slate-400 text-xs uppercase tracking-wider bg-white/2">
              <th className="px-5 py-4">Assignment & Module</th>
              <th className="px-4 py-4 hidden md:table-cell">Due Date</th>
              <th className="px-4 py-4 hidden sm:table-cell">Max Score</th>
              <th className="px-4 py-4">Submissions Breakdown</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assignments.map((asgn) => {
              const overdue = isPastDue(asgn.dueDate);
              const stats = asgn.submissionStats ?? {
                total: 0,
                pending: 0,
                submitted: 0,
                reviewed: 0,
                approved: 0,
                rejected: 0,
              };

              return (
                <tr key={asgn.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/assignments/${asgn.id}`}
                          className="text-white font-semibold hover:text-purple-400 transition"
                        >
                          {asgn.title}
                        </Link>
                      </div>
                      {asgn.description && (
                        <p className="text-slate-400 text-xs line-clamp-1 max-w-md">
                          {asgn.description}
                        </p>
                      )}
                      <div className="pt-1">
                        {asgn.module ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {asgn.module.title}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Standalone
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 hidden md:table-cell whitespace-nowrap">
                    {asgn.dueDate ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={13} className={overdue ? "text-red-400" : "text-slate-400"} />
                        <span className={overdue ? "text-red-400 font-medium" : "text-slate-300"}>
                          {new Date(asgn.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {overdue && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 hidden sm:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
                      <Award size={14} />
                      <span>{asgn.maxScore} pts</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <Link
                        href={`/admin/assignments/${asgn.id}`}
                        className="font-medium text-white hover:underline"
                      >
                        {stats.total} total
                      </Link>
                      {stats.pending > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {stats.pending} pending
                        </span>
                      )}
                      {stats.submitted > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {stats.submitted} submitted
                        </span>
                      )}
                      {stats.approved > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {stats.approved} approved
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/assignments/${asgn.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
                      >
                        Submissions <ArrowRight size={13} />
                      </Link>
                      <button
                        onClick={() => onEdit(asgn)}
                        title="Edit assignment"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(asgn)}
                        title="Delete assignment"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
