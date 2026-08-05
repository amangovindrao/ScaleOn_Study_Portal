"use client";

import { useState, useMemo } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import {
  ClipboardList,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Upload,
  RotateCcw,
  ExternalLink,
  FileText,
  Search,
  BookOpen,
  Check,
  X,
  Trash2,
  Loader2,
} from "lucide-react";

interface Submission {
  id: string;
  submissionUrl?: string | null;
  liveUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  submissionText?: string | null;
  submittedAt?: string | null;
  status: "PENDING" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED";
  score?: number | null;
  feedback?: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: string | null;
  maxScore: number;
  module?: { title: string } | null;
  submissions: Submission[];
}

type FilterType = "ALL" | "PENDING" | "SUBMITTED" | "OVERDUE";
type SortType = "DUE_ASC" | "DUE_DESC" | "SCORE_DESC";

interface FormState {
  text: string;
  liveUrl: string;
  file: File | null;
}

const emptyForm: FormState = { text: "", liveUrl: "", file: null };

export default function AssignmentsPage() {
  const { data: assignments, refetch, loading } = useFetch<Assignment[]>("/learning/assignments");

  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, FormState>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("DUE_ASC");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const list = assignments ?? [];

  function getForm(id: string): FormState {
    return forms[id] ?? emptyForm;
  }

  function updateForm(id: string, patch: Partial<FormState>) {
    setForms((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyForm), ...patch },
    }));
  }

  function isOverdue(dueDate: string | null) {
    return !!dueDate && new Date(dueDate).getTime() < Date.now();
  }

  function isReviewed(sub?: Submission) {
    return !!sub && (sub.status === "APPROVED" || sub.status === "REJECTED" || sub.score != null || !!sub.feedback);
  }

  const total = list.length;
  const submittedCount = list.filter((a: Assignment) => a.submissions.length > 0).length;
  const overdueCount = list.filter(
    (a: Assignment) => a.submissions.length === 0 && isOverdue(a.dueDate)
  ).length;
  const pendingCount = list.filter(
    (a: Assignment) => a.submissions.length === 0 && !isOverdue(a.dueDate)
  ).length;

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = list.filter((a: Assignment) => {
      const sub = a.submissions[0];
      const submitted = !!sub;
      const overdue = !submitted && isOverdue(a.dueDate);

      const matchesSearch =
        !query ||
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.module?.title.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filter === "SUBMITTED") return submitted;
      if (filter === "PENDING") return !submitted && !overdue;
      if (filter === "OVERDUE") return overdue;
      return true;
    });

    result.sort((a: Assignment, b: Assignment) => {
      if (sort === "DUE_DESC") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sort === "SCORE_DESC") {
        return b.maxScore - a.maxScore;
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return result;
  }, [list, search, filter, sort]);

  function formatDate(d: string | null) {
    if (!d) return "No due date";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateTime(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSubmit(id: string) {
    const asgn = list.find((a) => a.id === id);
    if (asgn && isOverdue(asgn.dueDate)) {
      alert("Deadline has passed. Submissions can no longer be created or modified.");
      return;
    }

    const form = getForm(id);
    if (!form.text.trim() && !form.liveUrl.trim()) {
      alert("Please enter submission text or a live project URL.");
      return;
    }

    setSubmitting(id);
    try {
      const res = await api.post(`/learning/assignments/${id}/submit`, {
        submissionText: form.text.trim(),
        submissionUrl: form.liveUrl.trim(),
        liveUrl: form.liveUrl.trim(),
      });

      if (!res.success) {
        alert(res.error?.message || "Submission failed. Please try again.");
        return;
      }

      setForms((prev) => ({ ...prev, [id]: { ...emptyForm } }));
      setEditing((prev) => ({ ...prev, [id]: false }));
      await refetch();
    } catch (err: any) {
      console.error("Submit failed:", err);
      alert(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDelete(a: Assignment) {
    if (isOverdue(a.dueDate)) {
      return;
    }

    setDeleting(a.id);
    try {
      const res = await api.delete(`/learning/assignments/${a.id}/submit`);
      if (!res.success) {
        alert(res.error?.message || "Could not delete submission. Please try again.");
        return;
      }
      setEditing((prev) => ({ ...prev, [a.id]: false }));
      setForms((prev) => ({ ...prev, [a.id]: { ...emptyForm } }));
      await refetch();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err?.message || "Could not delete submission. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function handleResubmit(a: Assignment) {
    if (isOverdue(a.dueDate)) {
      alert("Deadline has passed. Submissions can no longer be edited.");
      return;
    }
    const sub = a.submissions[0];
    setForms((prev) => ({
      ...prev,
      [a.id]: {
        text: sub?.submissionText ?? "",
        liveUrl: sub?.submissionUrl ?? sub?.liveUrl ?? "",
        file: null,
      },
    }));
    setEditing((prev) => ({ ...prev, [a.id]: true }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList size={22} className="text-emerald-500" /> Assignments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Complete and submit module assignments to earn score and track progress
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">Total Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{submittedCount}</p>
              <p className="text-xs text-slate-500">Submitted</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{overdueCount}</p>
              <p className="text-xs text-slate-500">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 bg-white focus:outline-none"
            >
              <option value="DUE_ASC">Sort: Due Soonest</option>
              <option value="DUE_DESC">Sort: Due Latest</option>
              <option value="SCORE_DESC">Sort: Highest XP</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {(["ALL", "PENDING", "SUBMITTED", "OVERDUE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No matching assignments found</p>
          <p className="text-slate-400 text-xs mt-1">Assignments will appear here when created by admins.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => {
            const sub = a.submissions[0];
            const submitted = !!sub;
            const overdue = !submitted && isOverdue(a.dueDate);
            const isEditing = editing[a.id];
            const form = getForm(a.id);

            return (
              <div
                key={a.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                      {a.module && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                          {a.module.title}
                        </span>
                      )}
                    </div>
                    {a.description && <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                      <Award size={14} className="text-amber-500" />
                      <span className="font-semibold text-slate-700">{a.maxScore} XP</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${
                        submitted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : overdue
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      <Calendar size={14} />
                      <span>{formatDate(a.dueDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Submissions Section */}
                {submitted && !isEditing ? (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span>Submitted {sub.submittedAt ? formatDateTime(sub.submittedAt) : ""}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isOverdue(a.dueDate) && sub.status !== "APPROVED" && (
                          <>
                            <button
                              onClick={() => handleResubmit(a)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                            >
                              <RotateCcw size={13} /> Edit / Resubmit
                            </button>

                            <button
                              onClick={() => handleDelete(a)}
                              disabled={deleting === a.id}
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition disabled:opacity-50"
                            >
                              {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              Delete Submission
                            </button>
                          </>
                        )}

                        {isOverdue(a.dueDate) && sub.status !== "APPROVED" && (
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Deadline Passed (Locked)
                          </span>
                        )}
                      </div>
                    </div>

                    {(sub.submissionText || sub.submissionUrl || sub.liveUrl) && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                        {sub.submissionText && <p className="text-slate-700 whitespace-pre-wrap">{sub.submissionText}</p>}
                        {(sub.submissionUrl || sub.liveUrl) && (
                          <a
                            href={sub.submissionUrl || sub.liveUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                          >
                            <ExternalLink size={13} /> {sub.submissionUrl || sub.liveUrl}
                          </a>
                        )}
                      </div>
                    )}

                    {(sub.feedback || sub.score != null) && (
                      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-1">
                        {sub.feedback && (
                          <p className="text-slate-700">
                            <strong className="text-blue-800">Mentor Feedback:</strong> {sub.feedback}
                          </p>
                        )}
                        {sub.score != null && (
                          <p className="text-blue-800 font-bold">
                            Score: {sub.score} / {a.maxScore} XP
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                    {isEditing && (
                      <div className="flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-xs text-blue-800 font-medium">
                        <span>Editing your existing submission</span>
                        <button
                          onClick={() => setEditing((prev) => ({ ...prev, [a.id]: false }))}
                          className="text-slate-500 hover:text-slate-800 text-xs font-normal underline"
                        >
                          Cancel Edit
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={form.liveUrl}
                        onChange={(e) => updateForm(a.id, { liveUrl: e.target.value })}
                        placeholder="Live project URL or GitHub link (e.g. https://github.com/...)"
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <textarea
                      value={form.text}
                      onChange={(e) => updateForm(a.id, { text: e.target.value })}
                      placeholder="Submission notes, explanation, or comments..."
                      rows={3}
                      className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                      >
                        <BookOpen size={14} /> View Instructions
                      </button>

                      <button
                        onClick={() => handleSubmit(a.id)}
                        disabled={submitting === a.id || isOverdue(a.dueDate)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                      >
                        {submitting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>{isEditing ? "Update Submission" : "Submit Assignment"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAssignment(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{selectedAssignment.title}</h2>
                {selectedAssignment.module && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedAssignment.module.title}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div>
                <p className="font-semibold text-slate-900 mb-1">Description / Instructions</p>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                  {selectedAssignment.instructions || selectedAssignment.description || "No specific instructions provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Due Date</span>
                  <span className="font-medium text-slate-800">{formatDate(selectedAssignment.dueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Maximum XP</span>
                  <span className="font-bold text-slate-900">{selectedAssignment.maxScore} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}