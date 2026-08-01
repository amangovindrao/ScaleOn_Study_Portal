import { z } from 'zod';

export const createInternSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    internId: z.string().min(3, 'Intern ID is required (e.g. SOINT260001)'),
    phone: z.string().optional(),
    internshipRoleId: z.string().uuid('Valid internship role ID required'),
    batchId: z.string().uuid().optional(),
    mentorId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const updateInternSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    internshipRoleId: z.string().uuid().optional(),
    batchId: z.string().uuid().nullable().optional(),
    mentorId: z.string().uuid().nullable().optional(),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
    status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'DROPPED', 'SUSPENDED']).optional(),
    currentPhase: z.string().optional(),
    currentModule: z.string().optional(),
    overallProgress: z.number().min(0).max(100).optional(),
    attendancePercent: z.number().min(0).max(100).optional(),
  }),
});

export const listInternsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    internshipRoleId: z.string().uuid().optional(),
    batchId: z.string().uuid().optional(),
    status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'DROPPED', 'SUSPENDED']).optional(),
    mentorId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'fullName', 'scaleonId', 'overallProgress', 'attendancePercent']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const suspendInternSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const transferInternSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    internshipRoleId: z.string().uuid().optional(),
    batchId: z.string().uuid().nullable().optional(),
  }),
});

export const extendInternshipSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    newEndDate: z.string().datetime(),
    reason: z.string().optional(),
  }),
});
