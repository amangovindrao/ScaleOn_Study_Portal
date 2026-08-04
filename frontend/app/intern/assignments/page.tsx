"use client";

import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Send,
  Trash2,
  AlertCircle,
  Award,
  BookOpen,
  Loader2,
  ListTodo,
  CircleCheck,
  Search,
  SlidersHorizontal,
  Eye,
  ExternalLink,
  Upload,
  X,
  ChevronDown,
  FileText,
  RotateCcw,
} from "lucide-react";

interface Submission {
  id?: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  submissionText?: string;
  liveUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  module: { title: string } | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  submissions: Submission[];
}

type FilterType = "ALL" | "PENDING" | "SUBMITTED" | "OVERDUE" | "REVIEWED";
type SortType = "DUE_ASC" | "DUE_DESC" | "LATEST" | "OLDEST";

type FormState = {
  text: string;
  liveUrl: string;
  file: File | null;
};

const emptyForm: FormState = { text: "", liveUrl: "", file: null };

export default function AssignmentsPage() {
  const { data: assignments, refetch, loading } = useFetch<Assignment[]>("/learning/assignments");

  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, FormState>>({});
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
  const submittedCount = list.filter((a) => a.submissions.length > 0).length;
  const overdueCount = list.filter(
    (a) => a.submissions.length === 0 && isOverdue(a.dueDate)
  ).length;
  const pendingCount = list.filter(
    (a) => a.submissions.length === 0 && !isOverdue(a.dueDate)
  ).length;

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = list.filter((a) => {
      const sub = a.submissions[0];
      const submitted = !!sub;
      const overdue = !submitted && isOverdue(a.dueDate);
      const reviewed = isReviewed(sub);

      const matchesSearch =
        !query ||
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.module?.title.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (filter === "PENDING") return !submitted && !overdue;
      if (filter === "SUBMITTED") return submitted;
      if (filter === "OVERDUE") return overdue;
      if (filter === "REVIEWED") return reviewed;
      return true;
    });

    return [...result].sort((a, b) => {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

      if (sort === "DUE_ASC") return dueA - dueB;
      if (sort === "DUE_DESC") return dueB - dueA;
      if (sort === "LATEST") return b.id.localeCompare(a.id);
      return a.id.localeCompare(b.id);
    });
  }, [list, search, filter, sort]);

  function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "No deadline";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function dueLabel(dueDate: string | null, submitted: boolean) {
    if (!dueDate || submitted) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    const abs = Math.abs(diff);
    const hours = Math.ceil(abs / (1000 * 60 * 60));
    const days = Math.ceil(abs / (1000 * 60 * 60 * 24));

    if (diff < 0) return days <= 1 ? "Overdue" : `Overdue by ${days} days`;
    if (hours <= 24) return `Due in ${hours}h`;
    return `Due in ${days} days`;
  }

  async function handleSubmit(id: string) {
    const form = getForm(id);
    if (!form.text.trim() && !form.liveUrl.trim() && !form.file) {
      alert("Add a file, live URL, or submission note.");
      return;
    }

    setSubmitting(id);
    try {
      // FormData supports file + links + notes. Backend /submit endpoint should accept multipart/form-data.
      const body = new FormData();
      body.append("submissionText", form.text.trim());
      body.append("liveUrl", form.liveUrl.trim());
      if (form.file) body.append("file", form.file);

      await api.post(`/learning/assignments/${id}/submit`, body);
      setForms((prev) => ({ ...prev, [id]: { ...emptyForm } }));
      await refetch();
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDelete(assignmentId: string) {
    const confirmed = window.confirm(
      "Delete this submission? You can submit again if the deadline/rules allow it."
    );
    if (!confirmed) return;

    setDeleting(assignmentId);
    try {
      await api.delete(`/learning/assignments/${assignmentId}/submit`);
      await refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete submission. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleResubmit(a: Assignment) {
    const sub = a.submissions[0];
    setForms((prev) => ({
      ...prev,
      [a.id]: {
        text: sub?.submissionText ?? "",
        liveUrl: sub?.liveUrl ?? "",
        file: null,
      },
    }));
    await handleDelete(a.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList size={22} className="text-emerald-500" /> Assignments
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Submit your work and get reviewed by mentors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<ListTodo size={18} className="text-blue-500" />} value={total} label="Total" bg="bg-blue-50" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <StatCard icon={<CircleCheck size={18} className="text-emerald-500" />} value={submittedCount} label="Submitted" bg="bg-emerald-50" active={filter === "SUBMITTED"} onClick={() => setFilter("SUBMITTED")} />
        <StatCard icon={<Clock size={18} className="text-amber-500" />} value={pendingCount} label="Pending" bg="bg-amber-50" active={filter === "PENDING"} onClick={() => setFilter("PENDING")} />
        <StatCard icon={<AlertCircle size={18} className="text-red-500" />} value={overdueCount} label="Overdue" bg="bg-red-50" active={filter === "OVERDUE"} onClick={() => setFilter("OVERDUE")} />
      </div>

      {/* Search + filters */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", "REVIEWED"] as FilterType[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                filter === item ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}

          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="appearance-none border border-slate-200 rounded-lg pl-8 pr-8 py-2 text-xs text-slate-600 bg-white focus:outline-none"
            >
              <option value="DUE_ASC">Due date</option>
              <option value="DUE_DESC">Due date (latest)</option>
              <option value="LATEST">Latest</option>
              <option value="OLDEST">Oldest</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main list */}
      {loading ? (
        <EmptyState loading />
      ) : list.length === 0 ? (
        <EmptyState />
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-10 text-center shadow-sm">
          <Search size={30} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No matching assignments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => {
            const sub = a.submissions[0];
            const submitted = !!sub;
            const overdue = !submitted && isOverdue(a.dueDate);
            const reviewed = isReviewed(sub);
            const form = getForm(a.id);
            const deadlineText = dueLabel(a.dueDate, submitted);
            const canResubmit = submitted && sub.status !== "APPROVED" && !isOverdue(a.dueDate);

            return (
              <div key={a.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${overdue ? "border-red-200" : "border-slate-200/60"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                      <StatusBadge submitted={submitted} overdue={overdue} reviewed={reviewed} status={sub?.status} />
                      {deadlineText && (
                        <span className={`text-[10px] font-medium ${overdue ? "text-red-500" : "text-amber-600"}`}>
                          {deadlineText}
                        </span>
                      )}
                    </div>

                    {a.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{a.description}</p>}

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                      <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : ""}`}>
                        <Clock size={11} /> Due: {formatDateTime(a.dueDate)}
                      </span>
                      <span className="flex items-center gap-1"><Award size={11} /> Max: {a.maxScore} pts</span>
                      {a.module && <span className="flex items-center gap-1"><BookOpen size={11} /> {a.module.title}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAssignment(a)}
                    className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 transition"
                  >
                    <Eye size={14} /> View
                  </button>
                </div>

                {submitted ? (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span>Submitted {sub.submittedAt ? formatDateTime(sub.submittedAt) : ""}</span>
                      </div>

                      <div className="flex gap-2">
                        {canResubmit && (
                          <button onClick={() => handleResubmit(a)} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg">
                            <RotateCcw size={13} /> Edit / Resubmit
                          </button>
                        )}
                        {sub.status !== "APPROVED" && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting === a.id}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg disabled:opacity-50"
                          >
                            {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {(sub.submissionText || sub.liveUrl || sub.fileUrl) && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2">
                        {sub.submissionText && <p className="text-slate-600">{sub.submissionText}</p>}
                        {sub.liveUrl && <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><ExternalLink size={13} /> Live Project</a>}
                        {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><FileText size={13} /> {sub.fileName || "Submitted file"}</a>}
                      </div>
                    )}

                    {(sub.feedback || sub.score != null) && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        {sub.feedback && <p className="text-xs text-slate-600"><span className="font-semibold">Mentor feedback:</span> {sub.feedback}</p>}
                        {sub.score != null && <p className="text-xs text-blue-600 font-semibold mt-1">Score: {sub.score}/{a.maxScore}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="relative">
                      <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={form.liveUrl} onChange={(e) => updateForm(a.id, { liveUrl: e.target.value })} placeholder="Live project URL" className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>

                    <textarea value={form.text} onChange={(e) => updateForm(a.id, { text: e.target.value })} placeholder="Submission notes / comments..." rows={3} className="mt-3 w-full resize-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />

                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <label className="cursor-pointer flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 rounded-lg px-3 py-2 text-xs text-slate-500">
                        <Upload size={14} />
                        {form.file ? form.file.name : "Upload PDF, DOCX, ZIP or image"}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" onChange={(e) => updateForm(a.id, { file: e.target.files?.[0] ?? null })} />
                      </label>

                      <button
                        onClick={() => handleSubmit(a.id)}
                        disabled={submitting === a.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        {submitting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        Submit Assignment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment details modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedAssignment(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">{selectedAssignment.title}</h2>
                {selectedAssignment.module && <p className="text-xs text-slate-400 mt-1">{selectedAssignment.module.title}</p>}
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Description / Instructions</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedAssignment.description || "No description provided."}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600"><Clock size={14} className="mb-1 text-slate-400" />Due: {formatDateTime(selectedAssignment.dueDate)}</div>
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600"><Award size={14} className="mb-1 text-slate-400" />Maximum score: {selectedAssignment.maxScore}</div>
              </div>

              {selectedAssignment.attachmentUrl && (
                <a href={selectedAssignment.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <FileText size={15} /> {selectedAssignment.attachmentName || "Download assignment attachment"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  bg,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200/60"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-400">{label}</p>
      </div>
    </button>
  );
}

function StatusBadge({ submitted, overdue, reviewed, status }: { submitted: boolean; overdue: boolean; reviewed: boolean; status?: string }) {
  if (reviewed) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Reviewed</span>;
  if (overdue) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Overdue</span>;
  if (submitted) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{status || "Submitted"}</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>;
}

function EmptyState({ loading = false }: { loading?: boolean }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
      {loading ? <Loader2 size={28} className="text-slate-300 mx-auto mb-3 animate-spin" /> : <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />}
      <p className="text-slate-500 text-sm">{loading ? "Loading assignments..." : "No assignments yet"}</p>
      {!loading && <p className="text-slate-400 text-xs mt-1">Assignments will appear when created by your admin.</p>}
    </div>
  );
}