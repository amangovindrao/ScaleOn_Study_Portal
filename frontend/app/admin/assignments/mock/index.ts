import { INITIAL_MOCK_ASSIGNMENTS, MOCK_LEARNING_MODULES } from "./assignments";
import { INITIAL_MOCK_SUBMISSIONS } from "./submissions";
import { Assignment, AssignmentSubmission, AssignmentSubmissionStats } from "../types";

export { MOCK_LEARNING_MODULES };

// Deep clone initial data so in-memory mutations persist per session
export function getInitialAssignments(): Assignment[] {
  return JSON.parse(JSON.stringify(INITIAL_MOCK_ASSIGNMENTS));
}

export function getInitialSubmissions(): AssignmentSubmission[] {
  return JSON.parse(JSON.stringify(INITIAL_MOCK_SUBMISSIONS));
}

export function calculateSubmissionStats(
  assignmentId: string,
  submissions: AssignmentSubmission[]
): AssignmentSubmissionStats {
  const list = submissions.filter((s) => s.assignmentId === assignmentId);
  return {
    total: list.length,
    pending: list.filter((s) => s.status === "PENDING").length,
    submitted: list.filter((s) => s.status === "SUBMITTED").length,
    reviewed: list.filter((s) => s.status === "REVIEWED").length,
    approved: list.filter((s) => s.status === "APPROVED").length,
    rejected: list.filter((s) => s.status === "REJECTED").length,
  };
}
