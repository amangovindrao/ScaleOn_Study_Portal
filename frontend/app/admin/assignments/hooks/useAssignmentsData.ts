"use client";

import { useState, useEffect, useCallback } from "react";
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
 * Custom hook to access and manage assignments list.
 * Swap implementation inside this hook when connecting to real GET /admin/assignments endpoint.
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
      // Future: replace with api.get<Assignment[]>('/admin/assignments', { params: filters })
      const data = await mockFetchAssignments(filters);
      setAssignments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    // Load module options for dropdowns
    mockFetchLearningModules().then(setModules);
  }, []);

  const createAssignment = async (input: CreateAssignmentInput) => {
    // Future: replace with api.post('/admin/assignments', input)
    const newAsgn = await mockCreateAssignment(input);
    await fetchAssignments();
    return newAsgn;
  };

  const updateAssignment = async (id: string, input: UpdateAssignmentInput) => {
    // Future: replace with api.patch(`/admin/assignments/${id}`, input)
    const updated = await mockUpdateAssignment(id, input);
    await fetchAssignments();
    return updated;
  };

  const deleteAssignment = async (id: string) => {
    // Future: replace with api.delete(`/admin/assignments/${id}`)
    const ok = await mockDeleteAssignment(id);
    if (ok) await fetchAssignments();
    return ok;
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
      // Future: replace with api.get(`/admin/assignments/${assignmentId}`)
      const asgn = await mockFetchAssignmentById(assignmentId);
      setAssignment(asgn);

      // Future: replace with api.get(`/admin/assignments/${assignmentId}/submissions`)
      const subs = await mockFetchSubmissionsForAssignment(assignmentId, statusFilter);
      setSubmissions(subs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load submission details");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reviewSubmission = async (submissionId: string, input: ReviewSubmissionInput) => {
    // Future: replace with api.patch(`/admin/assignments/submissions/${submissionId}`, input)
    const updated = await mockReviewSubmission(submissionId, input);
    await loadData();
    return updated;
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
