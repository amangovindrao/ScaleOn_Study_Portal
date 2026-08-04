"use client";

import React, { useState, useMemo } from "react";
import { Plus, ClipboardList, BookOpen, Clock, AlertTriangle } from "lucide-react";
import { useAssignmentsData } from "./hooks/useAssignmentsData";
import { Assignment, AssignmentFormData } from "./types";
import { AssignmentTable } from "./components/AssignmentTable";
import { AssignmentFormModal } from "./components/AssignmentFormModal";
import { SearchBar } from "./components/SearchBar";
import { AssignmentStatusFilter } from "./components/StatusFilter";
import { EmptyState } from "./components/EmptyState";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { Modal } from "@/app/components/ui/modal";

export default function AdminAssignmentsPage() {
  const {
    assignments,
    loading,
    modulesList,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAssignmentsData();

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<
    "ALL" | "UPCOMING" | "OVERDUE" | "NEXT_7_DAYS"
  >("ALL");

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Delete confirm modal state
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    return assignments.filter((asgn) => {
      // Search text match
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = asgn.title.toLowerCase().includes(query);
        const matchDesc = asgn.description?.toLowerCase().includes(query) ?? false;
        if (!matchTitle && !matchDesc) return false;
      }

      // Module filter match
      if (selectedModule) {
        if (selectedModule === "UNLINKED") {
          if (asgn.moduleId !== null) return false;
        } else {
          if (asgn.moduleId !== selectedModule) return false;
        }
      }

      // Date range filter match
      if (selectedDateRange !== "ALL") {
        if (!asgn.dueDate) return false;
        const dueTime = new Date(asgn.dueDate).getTime();

        if (selectedDateRange === "OVERDUE") {
          if (dueTime >= now) return false;
        } else if (selectedDateRange === "UPCOMING") {
          if (dueTime < now) return false;
        } else if (selectedDateRange === "NEXT_7_DAYS") {
          if (dueTime < now || dueTime > sevenDaysFromNow) return false;
        }
      }

      return true;
    });
  }, [assignments, search, selectedModule, selectedDateRange]);

  function handleOpenCreate() {
    setEditingAssignment(null);
    setFormOpen(true);
  }

  function handleOpenEdit(assignment: Assignment) {
    setEditingAssignment(assignment);
    setFormOpen(true);
  }

  async function handleSaveForm(formData: AssignmentFormData) {
    if (editingAssignment) {
      await updateAssignment(editingAssignment.id, formData);
    } else {
      await createAssignment(formData);
    }
  }

  async function ConfirmDelete() {
    if (!deletingAssignment) return;
    setDeleteLoading(true);
    await deleteAssignment(deletingAssignment.id);
    setDeleteLoading(false);
    setDeletingAssignment(null);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ClipboardList className="text-purple-400" size={26} />
            Assignments Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and track intern assignments across learning modules ({assignments.length} total)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-semibold rounded-xl px-4 py-2.5 text-sm transition shadow-lg shadow-purple-600/20"
        >
          <Plus size={18} />
          Create Assignment
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <AssignmentStatusFilter
          modules={modulesList}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton message="Fetching assignments list..." />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title={search || selectedModule || selectedDateRange !== "ALL" ? "No matching assignments" : "No assignments created yet"}
          description={
            search || selectedModule || selectedDateRange !== "ALL"
              ? "Try adjusting your search keywords or filter dropdowns to find assignments."
              : "Get started by creating your first assignment for interns."
          }
          actionLabel="Create Assignment"
          onAction={handleOpenCreate}
        />
      ) : (
        <AssignmentTable
          assignments={filteredAssignments}
          onEdit={handleOpenEdit}
          onDelete={(asgn) => setDeletingAssignment(asgn)}
        />
      )}

      {/* Create / Edit Form Modal */}
      <AssignmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveForm}
        editingAssignment={editingAssignment}
        modules={modulesList}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingAssignment}
        onClose={() => setDeletingAssignment(null)}
        title="Confirm Delete Assignment"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-300 text-sm">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Are you sure you want to delete this assignment?</p>
              <p className="text-xs text-red-300/80 mt-1">
                This action will permanently delete &quot;{deletingAssignment?.title}&quot; and remove all associated intern submission records. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingAssignment(null)}
              className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={ConfirmDelete}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition"
            >
              {deleteLoading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
