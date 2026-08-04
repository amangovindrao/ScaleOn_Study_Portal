import React from "react";
import { ExternalLink, CheckCircle2, Clock, XCircle, Edit3 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { AssignmentSubmission, AssignmentStatus } from "../types";

interface SubmissionRowProps {
  submission: AssignmentSubmission;
  maxScore: number;
  onReview: (submission: AssignmentSubmission) => void;
}

export function SubmissionRow({ submission, maxScore, onReview }: SubmissionRowProps) {
  const statusBadgeVariant = (status: AssignmentStatus): "green" | "red" | "yellow" | "blue" | "purple" | "gray" => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      case "SUBMITTED":
        return "blue";
      case "REVIEWED":
        return "purple";
      case "PENDING":
      default:
        return "yellow";
    }
  };

  return (
    <tr className="hover:bg-white/2 transition-colors">
      {/* Intern Details */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
            {submission.intern.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{submission.intern.fullName}</p>
            <p className="text-slate-400 text-xs font-mono">{submission.intern.scaleonId}</p>
          </div>
        </div>
      </td>

      {/* Submission Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <Badge variant={statusBadgeVariant(submission.status)}>{submission.status}</Badge>
      </td>

      {/* Score */}
      <td className="px-4 py-4 whitespace-nowrap">
        {submission.score !== null ? (
          <span className="text-amber-400 font-bold text-sm">
            {submission.score} <span className="text-slate-500 text-xs font-normal">/ {maxScore}</span>
          </span>
        ) : (
          <span className="text-slate-500 text-xs">—</span>
        )}
      </td>

      {/* Submitted Date */}
      <td className="px-4 py-4 whitespace-nowrap text-slate-300 text-xs hidden md:table-cell">
        {submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </td>

      {/* Submission Link / Content Preview */}
      <td className="px-4 py-4 max-w-xs">
        <div className="space-y-1">
          {submission.submissionUrl && (
            <a
              href={submission.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs font-medium truncate max-w-full"
            >
              <ExternalLink size={12} />
              <span className="truncate">{submission.submissionUrl}</span>
            </a>
          )}
          {submission.submissionText && (
            <p className="text-slate-400 text-xs line-clamp-1 italic">
              &quot;{submission.submissionText}&quot;
            </p>
          )}
          {!submission.submissionUrl && !submission.submissionText && (
            <span className="text-slate-500 text-xs">No link or notes submitted</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right whitespace-nowrap">
        <button
          onClick={() => onReview(submission)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 font-semibold text-xs transition"
        >
          <Edit3 size={13} />
          {submission.status === "PENDING" || submission.status === "SUBMITTED" ? "Grade & Review" : "Edit Grade"}
        </button>
      </td>
    </tr>
  );
}
