"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, Textarea, FormField } from "@/app/components/ui/input";
import { ExternalLink, Award, User } from "lucide-react";
import { AssignmentSubmission, AssignmentStatus, ReviewFormData } from "../types";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  submission: AssignmentSubmission | null;
  maxScore: number;
  onSave: (submissionId: string, data: ReviewFormData) => Promise<void>;
}

export function ReviewModal({ open, onClose, submission, maxScore, onSave }: ReviewModalProps) {
  const [form, setForm] = useState<ReviewFormData>({
    status: "APPROVED",
    score: maxScore,
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submission) {
      setForm({
        status: submission.status === "PENDING" ? "APPROVED" : submission.status,
        score: submission.score !== null ? submission.score : maxScore,
        feedback: submission.feedback ?? "",
      });
    } else {
      setForm({
        status: "APPROVED",
        score: maxScore,
        feedback: "",
      });
    }
    setError(null);
  }, [submission, maxScore, open]);

  if (!submission) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submission) return;
    setError(null);

    if (form.score !== null && (form.score < 0 || form.score > maxScore)) {
      setError(`Score must be between 0 and ${maxScore} points.`);
      return;
    }

    setLoading(true);
    try {
      await onSave(submission.id, form);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update review";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Grade & Review — ${submission.intern.fullName}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Intern details card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <User size={14} />
              {submission.intern.fullName} ({submission.intern.scaleonId})
            </span>
            <span>
              Submitted:{" "}
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleDateString()
                : "—"}
            </span>
          </div>

          {submission.submissionUrl && (
            <div className="pt-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Submission URL:</p>
              <a
                href={submission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs font-mono break-all"
              >
                <ExternalLink size={13} />
                {submission.submissionUrl}
              </a>
            </div>
          )}

          {submission.submissionText && (
            <div className="pt-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Intern Notes:</p>
              <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 whitespace-pre-wrap">
                {submission.submissionText}
              </p>
            </div>
          )}
        </div>

        {/* Review form controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Review Decision Status *" htmlFor="rev-status">
            <Select
              id="rev-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AssignmentStatus }))}
            >
              <option value="APPROVED">APPROVED (Pass)</option>
              <option value="REVIEWED">REVIEWED (Graded)</option>
              <option value="REJECTED">REJECTED (Needs Revision)</option>
              <option value="SUBMITTED">SUBMITTED (Unreviewed)</option>
              <option value="PENDING">PENDING</option>
            </Select>
          </FormField>

          <FormField label={`Score Points (0 - ${maxScore})`} htmlFor="rev-score">
            <Input
              id="rev-score"
              type="number"
              min="0"
              max={maxScore}
              value={form.score !== null ? form.score : ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  score: e.target.value !== "" ? Number(e.target.value) : null,
                }))
              }
              placeholder={`Max ${maxScore}`}
            />
          </FormField>
        </div>

        <FormField label="Feedback & Review Comments" htmlFor="rev-feedback">
          <Textarea
            id="rev-feedback"
            rows={4}
            value={form.feedback}
            onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
            placeholder="Provide constructive feedback for the intern regarding their submission..."
          />
        </FormField>

        <div className="flex gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-slate-900 font-semibold rounded-xl py-2.5 text-sm transition"
          >
            {loading ? "Saving Grade..." : "Submit Grade & Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
