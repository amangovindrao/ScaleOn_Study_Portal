"use client";

import React, { useState } from "react";
import { useAssignmentsData } from "./hooks/useAssignmentsData";
import { Assignment, CreateAssignmentInput } from "./types";
import { SearchBar } from "./components/SearchBar";
import { StatusFilter } from "./components/StatusFilter";
import { AssignmentTable } from "./components/AssignmentTable";
import { AssignmentFormModal } from "./components/AssignmentFormModal";
import { EmptyState } from "./components/EmptyState";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { Modal } from "@/app/components/ui/modal";
import { PlusCircle, FileText, CheckCircle2, Clock, Award } from "lucide-react";

export default function AdminAssignmentsPage() {
  const {
    assignments,
    modules,
    loading,
    error,
    filters,
    setFilters,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAssignmentsData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Compute analytics header metrics
  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a._count?.submissions ?? 0), 0);
  const totalPending = assignments.reduce((acc, a) => acc + (a.submissionStats?.pending ?? 0) + (a.submissionStats?.submitted ?? 0), 0);
  const avgScore = totalAssignments > 0
    ? Math.round(assignments.reduce((acc, a) => acc + a.maxScore, 0) / totalAssignments)
    : 100;

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (asgn: Assignment) => {
    setEditingAssignment(asgn);
    setCreateModalOpen(true);
  };

  const handleSaveForm = async (data: CreateAssignmentInput) => {
    if (editingAssignment) {
      await updateAssignment(editingAssignment.id, data);
    } else {
      await createAssignment(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAssignment(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assignment Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Create assignments, link learning modules, track submission counts, and review intern work.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition shadow-sm shrink-0"
        >
          <PlusCircle size={18} />
          New Assignment
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Total Tasks</p>
            <p className="text-slate-900 text-xl font-bold">{totalAssignments}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Total Submissions</p>
            <p className="text-slate-900 text-xl font-bold">{totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Pending Review</p>
            <p className="text-slate-900 text-xl font-bold">{totalPending}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Avg Max Score</p>
            <p className="text-slate-900 text-xl font-bold">{avgScore} XP</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={filters.search ?? ""}
          onChange={(val) => setFilters((f) => ({ ...f, search: val }))}
        />
        <StatusFilter
          moduleId={filters.moduleId ?? "all"}
          onModuleChange={(val) => setFilters((f) => ({ ...f, moduleId: val }))}
          dueDateRange={filters.dueDateRange ?? "all"}
          onDueDateChange={(val) => setFilters((f) => ({ ...f, dueDateRange: val as any }))}
          modules={modules}
        />
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments match your search"
          description="Try clearing your search query or module filters to see existing assignments."
          actionLabel="Create Assignment"
          onAction={handleOpenCreate}
        />
      ) : (
        <AssignmentTable
          assignments={assignments}
          onEdit={handleOpenEdit}
          onDelete={(id, title) => setDeleteTarget({ id, title })}
        />
      )}

      {/* Create / Edit Form Modal */}
      <AssignmentFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSaveForm}
        assignment={editingAssignment}
        modules={modules}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Assignment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.title}</strong>? This action cannot be undone and will delete all associated intern submissions.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 text-sm transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Assignment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
