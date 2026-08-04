"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, Textarea, FormField } from "@/app/components/ui/input";
import { Assignment, CreateAssignmentInput, LearningModuleOption } from "../types";

interface AssignmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssignmentInput) => Promise<void>;
  assignment?: Assignment | null;
  modules: LearningModuleOption[];
}

export function AssignmentFormModal({
  open,
  onClose,
  onSubmit,
  assignment,
  modules,
}: AssignmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    moduleId: "",
    dueDate: "",
    maxScore: "100",
  });

  useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title ?? "",
        description: assignment.description ?? "",
        instructions: assignment.instructions ?? "",
        moduleId: assignment.moduleId ?? "",
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : "",
        maxScore: assignment.maxScore ? assignment.maxScore.toString() : "100",
      });
    } else {
      setForm({
        title: "",
        description: "",
        instructions: "",
        moduleId: "",
        dueDate: "",
        maxScore: "100",
      });
    }
    setError(null);
  }, [assignment, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
        moduleId: form.moduleId || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        maxScore: form.maxScore ? parseInt(form.maxScore, 10) : 100,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  }

  const titleText = assignment ? "Edit Assignment" : "Create New Assignment";

  return (
    <Modal open={open} onClose={onClose} title={titleText} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <FormField label="Assignment Title *" htmlFor="asgn-title">
          <Input
            id="asgn-title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Fine-tune Llama 3 8B using LoRA"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Linked Learning Module" htmlFor="asgn-module">
            <Select
              id="asgn-module"
              value={form.moduleId}
              onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
            >
              <option value="">No linked module (Standalone)</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Max Score / XP Points" htmlFor="asgn-score">
            <Input
              id="asgn-score"
              type="number"
              min="1"
              max="1000"
              value={form.maxScore}
              onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label="Due Date & Time" htmlFor="asgn-duedate">
          <Input
            id="asgn-duedate"
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </FormField>

        <FormField label="Description" htmlFor="asgn-desc">
          <Textarea
            id="asgn-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short summary of what this assignment evaluates..."
            rows={2}
          />
        </FormField>

        <FormField label="Detailed Instructions" htmlFor="asgn-instructions">
          <Textarea
            id="asgn-instructions"
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            placeholder="Step-by-step requirements, submission format, links to datasets..."
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
            {loading ? "Saving..." : assignment ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
