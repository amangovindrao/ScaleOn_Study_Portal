import {
  Assignment,
  AssignmentSubmission,
  AssignmentFilters,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  ReviewSubmissionInput,
  LearningModuleOption
} from "../types";
import { MOCK_ASSIGNMENTS } from "./assignments";
import { MOCK_SUBMISSIONS } from "./submissions";
import { MOCK_MODULES } from "./modules";

// In-memory data store for live client-side interactivity
let assignmentsStore: Assignment[] = [...MOCK_ASSIGNMENTS];
let submissionsStore: AssignmentSubmission[] = [...MOCK_SUBMISSIONS];

function calculateSubmissionStats(assignmentId: string) {
  const subs = submissionsStore.filter((s) => s.assignmentId === assignmentId);
  return {
    total: subs.length,
    pending: subs.filter((s) => s.status === "PENDING").length,
    submitted: subs.filter((s) => s.status === "SUBMITTED").length,
    reviewed: subs.filter((s) => s.status === "REVIEWED").length,
    approved: subs.filter((s) => s.status === "APPROVED").length,
    rejected: subs.filter((s) => s.status === "REJECTED").length,
  };
}

/**
 * Future API: GET /admin/assignments
 */
export async function mockFetchAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
  await new Promise((res) => setTimeout(res, 200));

  let results = assignmentsStore.map((asgn) => ({
    ...asgn,
    _count: { submissions: submissionsStore.filter((s) => s.assignmentId === asgn.id).length },
    submissionStats: calculateSubmissionStats(asgn.id),
  }));

  if (!filters) return results;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.module && a.module.title.toLowerCase().includes(q))
    );
  }

  if (filters.moduleId && filters.moduleId !== "all") {
    results = results.filter((a) => a.moduleId === filters.moduleId);
  }

  if (filters.dueDateRange && filters.dueDateRange !== "all") {
    const now = new Date();
    if (filters.dueDateRange === "overdue") {
      results = results.filter((a) => a.dueDate && new Date(a.dueDate) < now);
    } else if (filters.dueDateRange === "upcoming") {
      results = results.filter((a) => a.dueDate && new Date(a.dueDate) >= now);
    } else if (filters.dueDateRange === "no_due_date") {
      results = results.filter((a) => !a.dueDate);
    }
  }

  return results;
}

/**
 * Future API: GET /admin/assignments/:id
 */
export async function mockFetchAssignmentById(id: string): Promise<Assignment | null> {
  await new Promise((res) => setTimeout(res, 150));
  const asgn = assignmentsStore.find((a) => a.id === id);
  if (!asgn) return null;
  return {
    ...asgn,
    _count: { submissions: submissionsStore.filter((s) => s.assignmentId === asgn.id).length },
    submissionStats: calculateSubmissionStats(asgn.id),
  };
}

/**
 * Future API: POST /admin/assignments
 */
export async function mockCreateAssignment(input: CreateAssignmentInput): Promise<Assignment> {
  await new Promise((res) => setTimeout(res, 300));
  const moduleObj = MOCK_MODULES.find((m) => m.id === input.moduleId) ?? null;
  const newAsgn: Assignment = {
    id: `asgn-${Date.now()}`,
    moduleId: input.moduleId ?? null,
    title: input.title,
    description: input.description ?? null,
    instructions: input.instructions ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : null,
    maxScore: input.maxScore ?? 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    module: moduleObj,
  };
  assignmentsStore = [newAsgn, ...assignmentsStore];
  return {
    ...newAsgn,
    _count: { submissions: 0 },
    submissionStats: { total: 0, pending: 0, submitted: 0, reviewed: 0, approved: 0, rejected: 0 },
  };
}

/**
 * Future API: PUT /admin/assignments/:id or PATCH /admin/assignments/:id
 */
export async function mockUpdateAssignment(id: string, input: UpdateAssignmentInput): Promise<Assignment> {
  await new Promise((res) => setTimeout(res, 300));
  const idx = assignmentsStore.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Assignment not found");

  const existing = assignmentsStore[idx];
  const moduleObj = input.moduleId !== undefined
    ? (MOCK_MODULES.find((m) => m.id === input.moduleId) ?? null)
    : existing.module;

  const updated: Assignment = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description !== undefined ? input.description : existing.description,
    instructions: input.instructions !== undefined ? input.instructions : existing.instructions,
    moduleId: input.moduleId !== undefined ? input.moduleId : existing.moduleId,
    dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate).toISOString() : null) : existing.dueDate,
    maxScore: input.maxScore ?? existing.maxScore,
    module: moduleObj,
    updatedAt: new Date().toISOString(),
  };

  assignmentsStore[idx] = updated;
  return {
    ...updated,
    _count: { submissions: submissionsStore.filter((s) => s.assignmentId === id).length },
    submissionStats: calculateSubmissionStats(id),
  };
}

/**
 * Future API: DELETE /admin/assignments/:id
 */
export async function mockDeleteAssignment(id: string): Promise<boolean> {
  await new Promise((res) => setTimeout(res, 300));
  assignmentsStore = assignmentsStore.filter((a) => a.id !== id);
  submissionsStore = submissionsStore.filter((s) => s.assignmentId !== id);
  return true;
}

/**
 * Future API: GET /admin/assignments/:id/submissions
 */
export async function mockFetchSubmissionsForAssignment(
  assignmentId: string,
  statusFilter?: string
): Promise<AssignmentSubmission[]> {
  await new Promise((res) => setTimeout(res, 200));
  let subs = submissionsStore.filter((s) => s.assignmentId === assignmentId);

  if (statusFilter && statusFilter !== "all") {
    subs = subs.filter((s) => s.status === statusFilter);
  }

  const asgn = assignmentsStore.find((a) => a.id === assignmentId);
  return subs.map((s) => ({
    ...s,
    assignment: asgn ? { id: asgn.id, title: asgn.title, maxScore: asgn.maxScore } : undefined,
  }));
}

/**
 * Future API: PATCH /admin/assignments/submissions/:id
 */
export async function mockReviewSubmission(
  submissionId: string,
  input: ReviewSubmissionInput,
  reviewerName: string = "Admin User"
): Promise<AssignmentSubmission> {
  await new Promise((res) => setTimeout(res, 300));
  const idx = submissionsStore.findIndex((s) => s.id === submissionId);
  if (idx === -1) throw new Error("Submission not found");

  const existing = submissionsStore[idx];
  const updated: AssignmentSubmission = {
    ...existing,
    score: input.score,
    feedback: input.feedback,
    status: input.status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerName,
    updatedAt: new Date().toISOString(),
  };

  submissionsStore[idx] = updated;
  return updated;
}

/**
 * Future API: GET /catalog/modules or /admin/learning/modules
 */
export async function mockFetchLearningModules(): Promise<LearningModuleOption[]> {
  await new Promise((res) => setTimeout(res, 100));
  return MOCK_MODULES;
}
