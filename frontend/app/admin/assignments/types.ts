export type AssignmentStatus = "PENDING" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED";

export interface LearningModuleOption {
  id: string;
  title: string;
  phaseName?: string;
}

export interface AssignmentSubmissionStats {
  total: number;
  pending: number;
  submitted: number;
  reviewed: number;
  approved: number;
  rejected: number;
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
  submissionStats?: AssignmentSubmissionStats;
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
  intern: {
    id: string;
    fullName: string;
    scaleonId: string;
    email?: string;
    userAccount?: {
      email: string;
    };
  };
  assignment?: {
    id: string;
    title: string;
    maxScore: number;
  };
}

export interface AssignmentFormData {
  title: string;
  moduleId: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
}

export interface ReviewFormData {
  status: AssignmentStatus;
  score: number | null;
  feedback: string;
}

export interface AssignmentFilterState {
  search: string;
  moduleId: string;
  dateRange: "ALL" | "UPCOMING" | "OVERDUE" | "NEXT_7_DAYS";
}

export interface SubmissionFilterState {
  search: string;
  status: "ALL" | AssignmentStatus;
}
