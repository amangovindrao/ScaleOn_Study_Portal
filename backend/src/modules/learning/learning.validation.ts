import { z } from 'zod';

// ── Intern Schemas ─────────────────────────────────────────

export const completeModuleSchema = z.object({
  params: z.object({
    moduleId: z.string().min(1, 'Module ID is required'),
  }),
});

export const submitAssignmentSchema = z.object({
  params: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
  }),
  body: z.object({
    submissionUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
    liveUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
    submissionText: z.string().optional(),
  }),
});

export const deleteSubmissionSchema = z.object({
  params: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  }),
});

export const deleteTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
  }),
});

export const replyTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
  }),
  body: z.object({
    message: z.string().min(1, 'Message content is required'),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'], {
      errorMap: () => ({ message: 'Invalid ticket status' }),
    }),
  }),
});

// ── Admin Schemas ──────────────────────────────────────────

export const listPhasesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).optional(),
  }),
});

export const createPhaseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Phase name is required'),
    slug: z.string().min(1, 'Phase slug is required'),
    description: z.string().optional(),
    order: z.coerce.number().optional(),
  }),
});

export const createModuleSchema = z.object({
  body: z.object({
    phaseId: z.string().min(1, 'Phase ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    resourceUrl: z.string().optional(),
    order: z.coerce.number().optional(),
    duration: z.string().optional(),
    points: z.coerce.number().optional(),
  }),
});

export const updateModuleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Module ID is required'),
  }),
  body: z.object({
    phaseId: z.string().optional(),
    title: z.string().min(1, 'Title cannot be empty').optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    resourceUrl: z.string().optional(),
    order: z.coerce.number().optional(),
    duration: z.string().optional(),
    points: z.coerce.number().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }),
});

export const adminListAssignmentsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    moduleId: z.string().optional(),
    dueDateRange: z.enum(['all', 'overdue', 'upcoming', 'no_due_date']).or(z.string()).optional(),
  }),
});

export const adminGetAssignmentByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Assignment ID is required'),
  }),
});

export const adminCreateAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    moduleId: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    maxScore: z.coerce.number().optional(),
  }),
});

export const adminUpdateAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Assignment ID is required'),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    moduleId: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    maxScore: z.coerce.number().optional(),
  }),
});

export const adminDeleteAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Assignment ID is required'),
  }),
});

export const adminReviewSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().min(1, 'Submission ID is required'),
  }),
  body: z.object({
    score: z.coerce.number().optional(),
    feedback: z.string().optional(),
    status: z.enum(['PENDING', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED']).optional(),
  }),
});

export const adminListLiveSessionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const adminCreateLiveSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    hostName: z.string().optional(),
    meetingUrl: z.string().min(1, 'Meeting URL is required'),
    scheduledAt: z.string().min(1, 'Scheduled time is required'),
    duration: z.string().or(z.coerce.number()).optional(),
  }),
});

export const adminReplyTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
  }),
  body: z.object({
    message: z.string().min(1, 'Message content is required'),
  }),
});

export const adminUpdateTicketStatusSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  }),
});

export const adminSetInternOfWeekSchema = z.object({
  body: z.object({
    internId: z.string().min(1, 'internId is required'),
    weekStart: z.string().min(1, 'weekStart is required'),
    weekXp: z.coerce.number().optional(),
    reason: z.string().optional(),
  }),
});

export const adminDeleteInternOfWeekSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});
