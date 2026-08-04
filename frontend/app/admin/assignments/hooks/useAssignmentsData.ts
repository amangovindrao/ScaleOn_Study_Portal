"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Assignment,
  AssignmentSubmission,
  AssignmentFormData,
  ReviewFormData,
  LearningModuleOption,
} from "../types";
import {
  getInitialAssignments,
  getInitialSubmissions,
  calculateSubmissionStats,
  MOCK_LEARNING_MODULES,
} from "../mock";

// Single shared in-memory data store across component instances in current browser tab
let memoryAssignments: Assignment[] = getInitialAssignments();
let memorySubmissions: AssignmentSubmission[] = getInitialSubmissions();

export function useAssignmentsData() {
  const [assignments, setAssignments] = useState<Assignment[]>(memoryAssignments);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(memorySubmissions);
  const [loading, setLoading] = useState<boolean>(false);

  // Synchronize memory store updates to local state
  const syncState = useCallback(() => {
    setAssignments([...memoryAssignments]);
    setSubmissions([...memorySubmissions]);
  }, []);

  // Future: GET /admin/assignments
  const getAssignments = useCallback((): Assignment[] => {
    return memoryAssignments.map((asgn) => ({
      ...asgn,
      submissionStats: calculateSubmissionStats(asgn.id, memorySubmissions),
      _count: {
        submissions: memorySubmissions.filter((s) => s.assignmentId === asgn.id).length,
      },
    }));
  }, []);

  // Future: GET /admin/assignments/:id
  const getAssignmentById = useCallback(
    (id: string): Assignment | null => {
      const found = memoryAssignments.find((a) => a.id === id);
      if (!found) return null;
      return {
        ...found,
        submissionStats: calculateSubmissionStats(found.id, memorySubmissions),
        _count: {
          submissions: memorySubmissions.filter((s) => s.assignmentId === found.id).length,
        },
      };
    },
    []
  );

  // Future: POST /admin/assignments
  const createAssignment = useCallback(
    async (formData: AssignmentFormData): Promise<{ success: boolean; data?: Assignment; error?: string }> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate async network hop

      const selectedModule = MOCK_LEARNING_MODULES.find((m) => m.id === formData.moduleId) ?? null;

      const newAssignment: Assignment = {
        id: `asgn-${Date.now()}`,
        moduleId: formData.moduleId || null,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        instructions: formData.instructions.trim() || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        maxScore: Number(formData.maxScore) || 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        module: selectedModule,
      };

      memoryAssignments = [newAssignment, ...memoryAssignments];
      syncState();
      setLoading(false);
      return { success: true, data: newAssignment };
    },
    [syncState]
  );

  // Future: PATCH /admin/assignments/:id
  const updateAssignment = useCallback(
    async (
      id: string,
      formData: Partial<AssignmentFormData>
    ): Promise<{ success: boolean; data?: Assignment; error?: string }> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = memoryAssignments.findIndex((a) => a.id === id);
      if (index === -1) {
        setLoading(false);
        return { success: false, error: "Assignment not found" };
      }

      const existing = memoryAssignments[index];
      const selectedModule =
        formData.moduleId !== undefined
          ? MOCK_LEARNING_MODULES.find((m) => m.id === formData.moduleId) ?? null
          : existing.module;

      const updated: Assignment = {
        ...existing,
        title: formData.title !== undefined ? formData.title.trim() : existing.title,
        moduleId: formData.moduleId !== undefined ? formData.moduleId || null : existing.moduleId,
        module: selectedModule,
        description:
          formData.description !== undefined ? formData.description.trim() || null : existing.description,
        instructions:
          formData.instructions !== undefined ? formData.instructions.trim() || null : existing.instructions,
        dueDate:
          formData.dueDate !== undefined
            ? formData.dueDate
              ? new Date(formData.dueDate).toISOString()
              : null
            : existing.dueDate,
        maxScore: formData.maxScore !== undefined ? Number(formData.maxScore) : existing.maxScore,
        updatedAt: new Date().toISOString(),
      };

      memoryAssignments[index] = updated;
      syncState();
      setLoading(false);
      return { success: true, data: updated };
    },
    [syncState]
  );

  // Future: DELETE /admin/assignments/:id
  const deleteAssignment = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      memoryAssignments = memoryAssignments.filter((a) => a.id !== id);
      memorySubmissions = memorySubmissions.filter((s) => s.assignmentId !== id);

      syncState();
      setLoading(false);
      return { success: true };
    },
    [syncState]
  );

  // Future: GET /admin/assignments/:id/submissions
  const getSubmissionsForAssignment = useCallback(
    (assignmentId: string): AssignmentSubmission[] => {
      return memorySubmissions.filter((s) => s.assignmentId === assignmentId);
    },
    []
  );

  // Future: PATCH /admin/assignments/submissions/:id (review/score)
  const reviewSubmission = useCallback(
    async (
      submissionId: string,
      reviewData: ReviewFormData,
      reviewerName: string = "Admin Lead"
    ): Promise<{ success: boolean; data?: AssignmentSubmission; error?: string }> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      const index = memorySubmissions.findIndex((s) => s.id === submissionId);
      if (index === -1) {
        setLoading(false);
        return { success: false, error: "Submission record not found" };
      }

      const existing = memorySubmissions[index];
      const updated: AssignmentSubmission = {
        ...existing,
        status: reviewData.status,
        score: reviewData.score !== null ? Number(reviewData.score) : null,
        feedback: reviewData.feedback.trim() || null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewerName,
        updatedAt: new Date().toISOString(),
      };

      memorySubmissions[index] = updated;
      syncState();
      setLoading(false);
      return { success: true, data: updated };
    },
    [syncState]
  );

  const modulesList: LearningModuleOption[] = useMemo(() => MOCK_LEARNING_MODULES, []);

  return {
    assignments,
    submissions,
    loading,
    modulesList,
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissionsForAssignment,
    reviewSubmission,
  };
}
