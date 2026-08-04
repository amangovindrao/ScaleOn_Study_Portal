"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, Textarea, FormField } from "@/app/components/ui/input";
import { AssignmentSubmission, AssignmentStatus, ReviewSubmissionInput } from "../types";
import { ExternalLink, User, Calendar } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (submissionId: string, data: ReviewSubmissionInput) => Promise<void>;
  submission: AssignmentSubmission | null;
  maxScore?: number;
}

export function ReviewModal({
  open,
  onClose,
  onSubmit,
  submission,
  maxScore = 100,
}: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<AssignmentStatus>("APPROVED");

  useEffect(() => {
    if (submission) {
      setScore(submission.score !== null && submission.score !== undefined ? submission.score.toString() : "");
      setFeedback(submission.feedback ?? "");
      setStatus(submission.status === "SUBMITTED" || submission.status === "PENDING" ? "APPROVED" : submission.status);
    }
    setError(null);
  }, [submission, open]);

  if (!submission) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      setError(`Score must be a number between 0 and ${maxScore}`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(submission.id, {
        score: numScore,
        feedback: feedback.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save submission review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Review Intern Submission" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Intern Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              <span className="font-semibold text-slate-900">{submission.intern?.fullName ?? "Intern"}</span>
              <span className="text-xs font-mono text-slate-500">({submission.intern?.scaleonId})</span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={12} />
              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "Not submitted"}
            </span>
          </div>

          {submission.submissionUrl && (
            <div className="pt-1">
              <a
                href={submission.submissionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                <ExternalLink size={13} />
                {submission.submissionUrl}
              </a>
            </div>
          )}

          {submission.submissionText && (
            <div className="mt-2 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {submission.submissionText}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={`Score (Max: ${maxScore}) *`} htmlFor="sub-score">
            <Input
              id="sub-score"
              type="number"
              min="0"
              max={maxScore}
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 95"
            />
          </FormField>

          <FormField label="Status Decision *" htmlFor="sub-status">
            <Select
              id="sub-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
            >
              <option value="APPROVED">APPROVED (Pass)</option>
              <option value="REVIEWED">REVIEWED (Graded)</option>
              <option value="REJECTED">REJECTED (Needs revision)</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Feedback & Comments" htmlFor="sub-feedback">
          <Textarea
            id="sub-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Constructive feedback for the intern regarding their submission..."
            rows={4}
          />
        </FormField>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 font-semibold rounded-xl py-2.5 text-sm transition"
          >
            {loading ? "Submitting..." : "Save Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
