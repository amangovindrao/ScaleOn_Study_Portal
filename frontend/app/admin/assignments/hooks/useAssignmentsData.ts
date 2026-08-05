"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import {
  Assignment,
  AssignmentSubmission,
  AssignmentFilters,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  ReviewSubmissionInput,
  LearningModuleOption
} from "../types";
import {
  mockFetchAssignments,
  mockFetchAssignmentById,
  mockCreateAssignment,
  mockUpdateAssignment,
  mockDeleteAssignment,
  mockFetchSubmissionsForAssignment,
  mockReviewSubmission,
  mockFetchLearningModules
} from "../mock";

/**
 * Custom hook to access and manage admin assignments list synced to backend database.
 */
export function useAssignmentsData(initialFilters?: AssignmentFilters) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<LearningModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AssignmentFilters>(initialFilters ?? {});

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.moduleId) params.append("moduleId", filters.moduleId);
      if (filters.dueDateRange) params.append("dueDateRange", filters.dueDateRange);

      const res = await api.get<Assignment[]>(`/learning/admin/assignments?${params.toString()}`);
      if (res.success && res.data) {
        setAssignments(res.data);
      } else {
        const fallback = await mockFetchAssignments(filters);
        setAssignments(fallback);
      }
    } catch (err: unknown) {
      try {
        const fallback = await mockFetchAssignments(filters);
        setAssignments(fallback);
      } catch {
        setError(err instanceof Error ? err.message : "Failed to load assignments");
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    async function loadModules() {
      const res = await api.get<LearningModuleOption[]>("/learning/modules/options");
      if (res.success && res.data && res.data.length > 0) {
        setModules(res.data);
      } else {
        const fallback = await mockFetchLearningModules();
        setModules(fallback);
      }
    }
    loadModules();
  }, []);

  const createAssignment = async (input: CreateAssignmentInput) => {
    const res = await api.post<Assignment>("/learning/assignments/create", input);
    if (!res.success) {
      await mockCreateAssignment(input);
    }
    await fetchAssignments();
    return res.data;
  };

  const updateAssignment = async (id: string, input: UpdateAssignmentInput) => {
    const res = await api.patch<Assignment>(`/learning/assignments/${id}`, input);
    if (!res.success) {
      await mockUpdateAssignment(id, input);
    }
    await fetchAssignments();
    return res.data;
  };

  const deleteAssignment = async (id: string) => {
    const res = await api.delete(`/learning/assignments/${id}`);
    if (!res.success) {
      await mockDeleteAssignment(id);
    }
    await fetchAssignments();
    return true;
  };

  return {
    assignments,
    modules,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}

/**
 * Custom hook for a single assignment and its submissions.
 */
export function useAssignmentDetails(assignmentId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Assignment & { submissions?: AssignmentSubmission[] }>(`/learning/admin/assignments/${assignmentId}`);
      if (res.success && res.data) {
        setAssignment(res.data);
        let subs = res.data.submissions ?? [];
        if (statusFilter && statusFilter !== "all") {
          subs = subs.filter((s) => s.status === statusFilter);
        }
        setSubmissions(subs);
      } else {
        const asgn = await mockFetchAssignmentById(assignmentId);
        setAssignment(asgn);
        const subs = await mockFetchSubmissionsForAssignment(assignmentId, statusFilter);
        setSubmissions(subs);
      }
    } catch (err: unknown) {
      try {
        const asgn = await mockFetchAssignmentById(assignmentId);
        setAssignment(asgn);
        const subs = await mockFetchSubmissionsForAssignment(assignmentId, statusFilter);
        setSubmissions(subs);
      } catch {
        setError(err instanceof Error ? err.message : "Failed to load submission details");
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reviewSubmission = async (submissionId: string, input: ReviewSubmissionInput) => {
    const res = await api.patch(`/learning/assignments/submissions/${submissionId}/review`, input);
    if (!res.success) {
      await mockReviewSubmission(submissionId, input);
    }
    await loadData();
    return res.data;
  };

  return {
    assignment,
    submissions,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    refetch: loadData,
    reviewSubmission,
  };
}
