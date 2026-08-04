import { AssignmentSubmission } from "../types";

export const MOCK_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: "sub-101",
    assignmentId: "asgn-001",
    internId: "int-001",
    submissionUrl: "https://github.com/interns/alex-numpy-pipeline",
    submissionText: "Completed vector normalization and added unit tests in test_pipeline.py.",
    score: 95,
    feedback: "Excellent work! Clean vectorization and efficient memory footprint.",
    status: "APPROVED",
    submittedAt: "2026-08-05T14:20:00.000Z",
    reviewedAt: "2026-08-06T09:10:00.000Z",
    reviewedBy: "Admin Sarah",
    createdAt: "2026-08-05T14:20:00.000Z",
    updatedAt: "2026-08-06T09:10:00.000Z",
    intern: {
      id: "int-001",
      scaleonId: "SOINT260001",
      fullName: "Alex Johnson",
      email: "alex.johnson@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  },
  {
    id: "sub-102",
    assignmentId: "asgn-001",
    internId: "int-002",
    submissionUrl: "https://github.com/interns/priya-numpy-task",
    submissionText: "Included custom script with batch processing option.",
    score: 88,
    feedback: "Good implementation. Consider using np.ascontiguousarray for faster memory access.",
    status: "REVIEWED",
    submittedAt: "2026-08-05T18:45:00.000Z",
    reviewedAt: "2026-08-06T11:30:00.000Z",
    reviewedBy: "Admin Sarah",
    createdAt: "2026-08-05T18:45:00.000Z",
    updatedAt: "2026-08-06T11:30:00.000Z",
    intern: {
      id: "int-002",
      scaleonId: "SOINT260002",
      fullName: "Priya Sharma",
      email: "priya.sharma@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  },
  {
    id: "sub-103",
    assignmentId: "asgn-001",
    internId: "int-003",
    submissionUrl: "https://github.com/interns/rahul-numpy-hw",
    submissionText: "Submitted numpy array task code.",
    score: null,
    feedback: null,
    status: "SUBMITTED",
    submittedAt: "2026-08-06T08:15:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
    createdAt: "2026-08-06T08:15:00.000Z",
    updatedAt: "2026-08-06T08:15:00.000Z",
    intern: {
      id: "int-003",
      scaleonId: "SOINT260003",
      fullName: "Rahul Verma",
      email: "rahul.verma@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  },
  {
    id: "sub-104",
    assignmentId: "asgn-001",
    internId: "int-004",
    submissionUrl: "https://github.com/interns/sneha-pipeline-draft",
    submissionText: "Code crashes on line 42 due to dimension mismatch. Requesting re-submission.",
    score: 40,
    feedback: "The script throws a ValueError during matrix multiplication. Please fix dimensions and resubmit.",
    status: "REJECTED",
    submittedAt: "2026-08-04T12:00:00.000Z",
    reviewedAt: "2026-08-05T10:00:00.000Z",
    reviewedBy: "Admin Dave",
    createdAt: "2026-08-04T12:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    intern: {
      id: "int-004",
      scaleonId: "SOINT260004",
      fullName: "Sneha Patel",
      email: "sneha.patel@scaleon.io",
      roleName: "Data Science"
    }
  },
  {
    id: "sub-201",
    assignmentId: "asgn-002",
    internId: "int-001",
    submissionUrl: "https://github.com/interns/alex-mnist-pytorch",
    submissionText: "Achieved 97.4% test accuracy using Adam optimizer and CrossEntropyLoss.",
    score: 98,
    feedback: "Outstanding accuracy and well-structured PyTorch modules.",
    status: "APPROVED",
    submittedAt: "2026-08-07T16:00:00.000Z",
    reviewedAt: "2026-08-08T09:00:00.000Z",
    reviewedBy: "Admin Sarah",
    createdAt: "2026-08-07T16:00:00.000Z",
    updatedAt: "2026-08-08T09:00:00.000Z",
    intern: {
      id: "int-001",
      scaleonId: "SOINT260001",
      fullName: "Alex Johnson",
      email: "alex.johnson@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  },
  {
    id: "sub-202",
    assignmentId: "asgn-002",
    internId: "int-002",
    submissionUrl: "https://github.com/interns/priya-mnist-pytorch",
    submissionText: "Model trained for 10 epochs.",
    score: null,
    feedback: null,
    status: "SUBMITTED",
    submittedAt: "2026-08-08T11:20:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
    createdAt: "2026-08-08T11:20:00.000Z",
    updatedAt: "2026-08-08T11:20:00.000Z",
    intern: {
      id: "int-002",
      scaleonId: "SOINT260002",
      fullName: "Priya Sharma",
      email: "priya.sharma@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  },
  {
    id: "sub-401",
    assignmentId: "asgn-004",
    internId: "int-005",
    submissionUrl: "https://github.com/interns/david-rag-pinecone",
    submissionText: "Built RAG flow with LangChain QA chain.",
    score: 90,
    feedback: "Good retrieval accuracy.",
    status: "APPROVED",
    submittedAt: "2026-08-03T10:00:00.000Z",
    reviewedAt: "2026-08-04T15:00:00.000Z",
    reviewedBy: "Admin Dave",
    createdAt: "2026-08-03T10:00:00.000Z",
    updatedAt: "2026-08-04T15:00:00.000Z",
    intern: {
      id: "int-005",
      scaleonId: "SOINT260005",
      fullName: "David Miller",
      email: "david.miller@scaleon.io",
      roleName: "Artificial Intelligence"
    }
  }
];
