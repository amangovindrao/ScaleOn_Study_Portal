import React from "react";
import { AssignmentSubmission } from "../types";
import { statusBadge } from "@/app/components/ui/badge";
import { ExternalLink, Clock, User, Award } from "lucide-react";

interface SubmissionRowProps {
  submission: AssignmentSubmission;
  maxScore: number;
  onReview: (submission: AssignmentSubmission) => void;
}

export function SubmissionRow({ submission, maxScore, onReview }: SubmissionRowProps) {
  const isEvaluated = submission.status === "APPROVED" || submission.status === "REVIEWED" || submission.status === "REJECTED";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
            {submission.intern?.fullName ? submission.intern.fullName.slice(0, 2).toUpperCase() : "INT"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-slate-900 font-semibold text-sm">{submission.intern?.fullName ?? "Unknown Intern"}</h4>
              <span className="text-xs font-mono text-slate-500">({submission.intern?.scaleonId ?? "N/A"})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{submission.intern?.email ?? submission.intern?.roleName ?? "Intern"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusBadge(submission.status)}
          <button
            onClick={() => onReview(submission)}
            className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-xl px-3 py-1.5 transition"
          >
            {isEvaluated ? "Edit Grade" : "Grade / Review"}
          </button>
        </div>
      </div>

      {/* Submission Payload */}
      <div className="space-y-2 text-xs">
        {submission.submissionUrl && (
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-slate-500 font-medium">Link:</span>
            <a
              href={submission.submissionUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-md"
            >
              <ExternalLink size={12} />
              {submission.submissionUrl}
            </a>
          </div>
        )}

        {submission.submissionText && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 whitespace-pre-wrap">
            {submission.submissionText}
          </div>
        )}
      </div>

      {/* Evaluation Results Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} className="text-slate-400" />
          <span>
            Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-500" />
          <span className="text-slate-500">Score:</span>
          <span className="text-slate-900 font-bold">
            {submission.score !== null && submission.score !== undefined ? `${submission.score} / ${maxScore}` : "Ungraded"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <User size={14} className="text-slate-400" />
          <span>
            {submission.reviewedBy ? `Reviewed by ${submission.reviewedBy}` : "Awaiting review"}
          </span>
        </div>
      </div>

      {submission.feedback && (
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs text-slate-800 space-y-1">
          <p className="font-semibold text-blue-700">Review Feedback:</p>
          <p className="text-slate-700">{submission.feedback}</p>
        </div>
      )}
    </div>
  );
}
