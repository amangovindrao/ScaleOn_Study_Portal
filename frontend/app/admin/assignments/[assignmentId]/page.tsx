"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAssignmentsData } from "../hooks/useAssignmentsData";
import { AssignmentSubmission, AssignmentStatus, ReviewFormData } from "../types";
import { SubmissionRow } from "../components/SubmissionRow";
import { ReviewModal } from "../components/ReviewModal";
import { SearchBar } from "../components/SearchBar";
import { SubmissionStatusFilter } from "../components/StatusFilter";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default function AssignmentSubmissionsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { assignmentId } = resolvedParams;

  const {
    getAssignmentById,
    getSubmissionsForAssignment,
    reviewSubmission,
    loading,
  } = useAssignmentsData();

  const assignment = getAssignmentById(assignmentId);
  const submissions = getSubmissionsForAssignment(assignmentId);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | AssignmentStatus>("ALL");
  const [reviewingSubmission, setReviewingSubmission] = useState<AssignmentSubmission | null>(null);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Search match (intern name, scaleonId, email)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = sub.intern.fullName.toLowerCase().includes(query);
        const matchId = sub.intern.scaleonId.toLowerCase().includes(query);
        const matchEmail = sub.intern.email?.toLowerCase().includes(query) ?? false;
        if (!matchName && !matchId && !matchEmail) return false;
      }

      // Status match
      if (selectedStatus !== "ALL" && sub.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [submissions, search, selectedStatus]);

  // Submission statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === "PENDING").length;
    const submitted = submissions.filter((s) => s.status === "SUBMITTED").length;
    const reviewed = submissions.filter((s) => s.status === "REVIEWED").length;
    const approved = submissions.filter((s) => s.status === "APPROVED").length;
    const rejected = submissions.filter((s) => s.status === "REJECTED").length;

    const scoredSubmissions = submissions.filter((s) => s.score !== null);
    const avgScore =
      scoredSubmissions.length > 0
        ? Math.round(
            scoredSubmissions.reduce((acc, curr) => acc + (curr.score ?? 0), 0) /
              scoredSubmissions.length
          )
        : 0;

    return { total, pending, submitted, reviewed, approved, rejected, avgScore };
  }, [submissions]);

  async function handleSaveReview(submissionId: string, data: ReviewFormData) {
    await reviewSubmission(submissionId, data);
  }

  if (loading && !assignment) {
    return <LoadingSkeleton message="Loading assignment submissions..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/assignments"
          className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Back to Assignments
        </Link>
        <EmptyState
          title="Assignment Not Found"
          description="The assignment record you requested does not exist or may have been deleted."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Link */}
      <Link
        href="/admin/assignments"
        className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Back to Assignments List
      </Link>

      {/* Assignment Overview Card */}
      <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
              {assignment.module ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {assignment.module.title}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Standalone
                </span>
              )}
            </div>
            {assignment.description && (
              <p className="text-slate-400 text-sm mt-1.5 max-w-3xl">{assignment.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
              <p className="text-slate-400">Max Score</p>
              <p className="text-amber-400 font-bold text-base">{assignment.maxScore} pts</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
              <p className="text-slate-400">Due Date</p>
              <p className="text-white font-semibold text-sm">
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No deadline"}
              </p>
            </div>
          </div>
        </div>

        {assignment.instructions && (
          <div className="pt-3 border-t border-white/5 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Instructions provided to interns:</p>
            <p className="whitespace-pre-line bg-white/2 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300">
              {assignment.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Submissions Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-amber-400 text-xs font-medium uppercase tracking-wider">Pending</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-medium uppercase tracking-wider">Submitted</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{stats.submitted}</p>
        </div>
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Approved</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-red-400 text-xs font-medium uppercase tracking-wider">Rejected</p>
          <p className="text-xl font-bold text-red-400 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
          <p className="text-purple-400 text-xs font-medium uppercase tracking-wider">Avg Score</p>
          <p className="text-xl font-bold text-purple-400 mt-1">
            {stats.avgScore} <span className="text-xs text-slate-500 font-normal">/ {assignment.maxScore}</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by intern name, Intern ID, or email..."
        />
        <SubmissionStatusFilter selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
      </div>

      {/* Submissions List Table */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title="No Submissions Found"
          description={
            search || selectedStatus !== "ALL"
              ? "No submission records match your search query or selected status filter."
              : "No interns have submitted work for this assignment yet."
          }
        />
      ) : (
        <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/8 text-slate-400 text-xs uppercase tracking-wider bg-white/2">
                  <th className="px-5 py-4">Intern</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Score</th>
                  <th className="px-4 py-4 hidden md:table-cell">Submitted At</th>
                  <th className="px-4 py-4">Submission Content</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => (
                  <SubmissionRow
                    key={sub.id}
                    submission={sub}
                    maxScore={assignment.maxScore}
                    onReview={(s) => setReviewingSubmission(s)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        open={!!reviewingSubmission}
        onClose={() => setReviewingSubmission(null)}
        submission={reviewingSubmission}
        maxScore={assignment.maxScore}
        onSave={handleSaveReview}
      />
    </div>
  );
}
