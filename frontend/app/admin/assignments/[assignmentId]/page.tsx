"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAssignmentDetails } from "../hooks/useAssignmentsData";
import { AssignmentSubmission, ReviewSubmissionInput } from "../types";
import { SubmissionRow } from "../components/SubmissionRow";
import { ReviewModal } from "../components/ReviewModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ArrowLeft, Calendar, Award, BookOpen, Users, FileCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = typeof params?.assignmentId === "string" ? params.assignmentId : "";

  const {
    assignment,
    submissions,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    reviewSubmission,
  } = useAssignmentDetails(assignmentId);

  const [reviewingSubmission, setReviewingSubmission] = useState<AssignmentSubmission | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-36 animate-pulse shadow-sm" />
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/assignments"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft size={16} />
          Back to Assignments
        </Link>
        <EmptyState
          title="Assignment not found"
          description={error ?? "The requested assignment could not be loaded."}
          actionLabel="Return to Assignments"
          onAction={() => router.push("/admin/assignments")}
        />
      </div>
    );
  }

  const stats = assignment.submissionStats ?? {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    submitted: submissions.filter((s) => s.status === "SUBMITTED").length,
    reviewed: submissions.filter((s) => s.status === "REVIEWED").length,
    approved: submissions.filter((s) => s.status === "APPROVED").length,
    rejected: submissions.filter((s) => s.status === "REJECTED").length,
  };

  const handleOpenReview = (sub: AssignmentSubmission) => {
    setReviewingSubmission(sub);
  };

  const handleSaveReview = async (submissionId: string, input: ReviewSubmissionInput) => {
    await reviewSubmission(submissionId, input);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/admin/assignments"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft size={16} />
          Back to Assignments List
        </Link>
      </div>

      {/* Assignment Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{assignment.title}</h1>
              {assignment.module ? (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                  {assignment.module.title}
                </span>
              ) : (
                <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                  Standalone Task
                </span>
              )}
            </div>
            {assignment.description && (
              <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">{assignment.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Due Date</span>
                <span className="font-medium">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No due date"}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Max Score</span>
                <span className="font-semibold text-slate-900">{assignment.maxScore} XP</span>
              </div>
            </div>
          </div>
        </div>

        {assignment.instructions && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-blue-700 flex items-center gap-1.5">
              <BookOpen size={14} />
              Submission Instructions:
            </span>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{assignment.instructions}</p>
          </div>
        )}
      </div>

      {/* Submissions Filter Tabs & Status Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Intern Submissions ({submissions.length})
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Submissions", count: stats.total, icon: FileCheck },
            { id: "SUBMITTED", label: "Pending Review", count: stats.submitted + stats.pending, icon: Clock },
            { id: "APPROVED", label: "Approved", count: stats.approved, icon: CheckCircle2 },
            { id: "REJECTED", label: "Rejected", count: stats.rejected, icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submissions Content */}
        {submissions.length === 0 ? (
          <EmptyState
            title="No submissions match this filter"
            description="There are currently no intern submissions matching the selected status filter."
            actionLabel="View All Submissions"
            onAction={() => setStatusFilter("all")}
          />
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <SubmissionRow
                key={sub.id}
                submission={sub}
                maxScore={assignment.maxScore}
                onReview={handleOpenReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        open={Boolean(reviewingSubmission)}
        onClose={() => setReviewingSubmission(null)}
        onSubmit={handleSaveReview}
        submission={reviewingSubmission}
        maxScore={assignment.maxScore}
      />
    </div>
  );
}
