"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, Textarea, FormField } from "@/app/components/ui/input";
import { Assignment, AssignmentFormData, LearningModuleOption } from "../types";

interface AssignmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AssignmentFormData) => Promise<void>;
  editingAssignment?: Assignment | null;
  modules: LearningModuleOption[];
}

export function AssignmentFormModal({
  open,
  onClose,
  onSave,
  editingAssignment,
  modules,
}: AssignmentFormModalProps) {
  const [form, setForm] = useState<AssignmentFormData>({
    title: "",
    moduleId: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxScore: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAssignment) {
      // Format ISO date string for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDate = "";
      if (editingAssignment.dueDate) {
        const d = new Date(editingAssignment.dueDate);
        const iso = d.toISOString();
        formattedDate = iso.slice(0, 16);
      }

      setForm({
        title: editingAssignment.title,
        moduleId: editingAssignment.moduleId ?? "",
        description: editingAssignment.description ?? "",
        instructions: editingAssignment.instructions ?? "",
        dueDate: formattedDate,
        maxScore: editingAssignment.maxScore ?? 100,
      });
    } else {
      setForm({
        title: "",
        moduleId: "",
        description: "",
        instructions: "",
        dueDate: "",
        maxScore: 100,
      });
    }
    setError(null);
  }, [editingAssignment, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save assignment";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingAssignment ? "Edit Assignment" : "Create New Assignment"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <FormField label="Assignment Title *" htmlFor="asgn-title">
          <Input
            id="asgn-title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Build a Dynamic Interactive Dashboard"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Linked Learning Module" htmlFor="asgn-module">
            <Select
              id="asgn-module"
              value={form.moduleId}
              onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
            >
              <option value="">None (Standalone Assignment)</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Max Score Points" htmlFor="asgn-score">
            <Input
              id="asgn-score"
              type="number"
              min="1"
              max="1000"
              required
              value={form.maxScore}
              onChange={(e) => setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
              placeholder="100"
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
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Overview of what this assignment evaluates..."
          />
        </FormField>

        <FormField label="Detailed Instructions & Submission Criteria" htmlFor="asgn-inst">
          <Textarea
            id="asgn-inst"
            rows={4}
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            placeholder="1. Step one instructions...&#10;2. Expected link or repository format..."
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
            {loading ? "Saving..." : editingAssignment ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
