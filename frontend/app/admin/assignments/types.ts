export type AssignmentStatus = "PENDING" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED";

export interface LearningModuleOption {
  id: string;
  title: string;
  phaseName?: string;
}

export interface Assignment {
  id: string;
  moduleId: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: string | null;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
  module?: LearningModuleOption | null;
  _count?: {
    submissions: number;
  };
  submissionStats?: {
    total: number;
    pending: number;
    submitted: number;
    reviewed: number;
    approved: number;
    rejected: number;
  };
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  internId: string;
  submissionUrl: string | null;
  submissionText: string | null;
  score: number | null;
  feedback: string | null;
  status: AssignmentStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  intern?: {
    id: string;
    scaleonId: string;
    fullName: string;
    email?: string;
    roleName?: string;
  };
  assignment?: {
    id: string;
    title: string;
    maxScore: number;
  };
}

export interface AssignmentFilters {
  search?: string;
  moduleId?: string;
  dueDateRange?: "all" | "overdue" | "upcoming" | "no_due_date";
  status?: string;
}

export interface CreateAssignmentInput {
  title: string;
  description?: string;
  instructions?: string;
  moduleId?: string | null;
  dueDate?: string | null;
  maxScore?: number;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  instructions?: string;
  moduleId?: string | null;
  dueDate?: string | null;
  maxScore?: number;
}

export interface ReviewSubmissionInput {
  score: number;
  feedback: string;
  status: AssignmentStatus;
}
