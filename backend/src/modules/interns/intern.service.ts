import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/apiError';
import { buildPagination } from '@/utils/apiResponse';
import { hashPassword, generateStrongPassword } from '@/utils/password';
import { logActivity, logAudit } from '@/services/audit.service';
import { Emails } from '@/services/email.service';
import { env } from '@/config/env';
import { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Create intern (admin only)
// ---------------------------------------------------------------------------

export async function createIntern(
  body: {
    fullName: string;
    email: string;
    internId: string;
    phone?: string;
    internshipRoleId: string;
    batchId?: string;
    mentorId?: string;
    startDate?: string;
    endDate?: string;
  },
  actorId: string,
  ipAddress?: string
) {
  // Check email not taken
  const existing = await prisma.userAccount.findFirst({
    where: { email: { equals: body.email, mode: 'insensitive' } },
  });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  // Check intern ID not taken
  const existingId = await prisma.intern.findFirst({
    where: { scaleonId: { equals: body.internId, mode: 'insensitive' } },
  });
  if (existingId) throw ApiError.conflict('This Intern ID is already in use');

  // Check role exists and is active
  const role = await prisma.internshipRole.findUnique({
    where: { id: body.internshipRoleId },
    select: { id: true, status: true, name: true },
  });
  if (!role || role.status !== 'ACTIVE') throw ApiError.badRequest('Internship role not found or inactive');

  // Get intern role for user account
  const internRole = await prisma.role.findUnique({
    where: { slug: 'intern' },
    select: { id: true },
  });
  if (!internRole) throw ApiError.internal('Intern system role not found. Run the seed.');

  const plainPassword = generateStrongPassword();

  const result = await prisma.$transaction(async (tx) => {
    const passwordHash = await hashPassword(plainPassword);
    const internId = body.internId.trim().toUpperCase();

    const userAccount = await tx.userAccount.create({
      data: {
        username: internId,
        email: body.email.toLowerCase().trim(),
        phone: body.phone,
        passwordHash,
        userType: 'INTERN',
        status: 'ACTIVE',
        roleId: internRole.id,
        isFirstLogin: true,
        mustChangePassword: true,
      },
    });

    const intern = await tx.intern.create({
      data: {
        userAccountId: userAccount.id,
        scaleonId: internId,
        fullName: body.fullName,
        internshipRoleId: body.internshipRoleId,
        batchId: body.batchId ?? null,
        mentorId: body.mentorId ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: 'ACTIVE',
      },
    });

    await tx.internProfile.create({ data: { internId: intern.id } });

    await tx.internshipEnrollment.create({
      data: {
        internId: intern.id,
        internshipRoleId: body.internshipRoleId,
        batchId: body.batchId ?? null,
        status: 'ENROLLED',
        startDate: body.startDate ? new Date(body.startDate) : null,
      },
    });

    return { userAccount, intern, internId };
  });

  // Send welcome + credential email
  await Emails.credentials(body.email, {
    fullName: body.fullName,
    username: result.internId,
    password: plainPassword,
    scaleonId: result.internId,
    loginUrl: `${env.frontend.url}/login`,
  });

  await logActivity({
    userAccountId: actorId,
    action: 'intern.created',
    entityType: 'Intern',
    entityId: result.intern.id,
    metadata: { scaleonId: result.internId, email: body.email },
    ipAddress,
  });

  await logAudit({
    actorId,
    actorType: 'ADMIN',
    action: 'intern.created',
    entityType: 'Intern',
    entityId: result.intern.id,
    after: { scaleonId: result.intern.scaleonId, email: body.email, internshipRoleId: body.internshipRoleId },
    ipAddress,
  });

  return {
    intern: result.intern,
    internId: result.internId,
    temporaryPassword: plainPassword,
  };
}

// ---------------------------------------------------------------------------
// List interns (paginated, searchable, filterable)
// ---------------------------------------------------------------------------

export async function listInterns(query: {
  page: number;
  pageSize: number;
  search?: string;
  internshipRoleId?: string;
  batchId?: string;
  status?: string;
  mentorId?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  const where: Prisma.InternWhereInput = {};

  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { fullName: { contains: s, mode: 'insensitive' } },
      { scaleonId: { contains: s, mode: 'insensitive' } },
      { userAccount: { email: { contains: s, mode: 'insensitive' } } },
      { userAccount: { username: { contains: s, mode: 'insensitive' } } },
      { userAccount: { phone: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (query.internshipRoleId) where.internshipRoleId = query.internshipRoleId;
  if (query.batchId) where.batchId = query.batchId;
  if (query.status) where.status = query.status as never;
  if (query.mentorId) where.mentorId = query.mentorId;

  const orderBy: Prisma.InternOrderByWithRelationInput =
    query.sortBy === 'overallProgress' || query.sortBy === 'attendancePercent'
      ? { [query.sortBy]: query.sortOrder }
      : query.sortBy === 'scaleonId' || query.sortBy === 'fullName'
      ? { [query.sortBy]: query.sortOrder }
      : { createdAt: query.sortOrder };

  const skip = (query.page - 1) * query.pageSize;

  const [total, interns] = await Promise.all([
    prisma.intern.count({ where }),
    prisma.intern.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
      select: {
        id: true,
        scaleonId: true,
        fullName: true,
        status: true,
        currentPhase: true,
        currentModule: true,
        overallProgress: true,
        attendancePercent: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        internshipRole: { select: { name: true, code: true } },
        batch: { select: { name: true, code: true } },
        mentor: { select: { fullName: true } },
        userAccount: { select: { email: true, username: true, phone: true, status: true, lastLoginAt: true } },
      },
    }),
  ]);

  return { interns, pagination: buildPagination(query.page, query.pageSize, total) };
}

// ---------------------------------------------------------------------------
// Get single intern
// ---------------------------------------------------------------------------

export async function getIntern(internId: string) {
  const intern = await prisma.intern.findUnique({
    where: { id: internId },
    include: {
      userAccount: {
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          status: true,
          isFirstLogin: true,
          mustChangePassword: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      internshipRole: true,
      batch: true,
      mentor: { select: { fullName: true, userAccount: { select: { email: true } } } },
      profile: true,
      enrollments: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!intern) throw ApiError.notFound('Intern not found');
  return intern;
}

// ---------------------------------------------------------------------------
// Update intern
// ---------------------------------------------------------------------------

export async function updateIntern(
  internId: string,
  body: {
    fullName?: string;
    email?: string;
    phone?: string;
    internshipRoleId?: string;
    batchId?: string | null;
    mentorId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    status?: string;
    currentPhase?: string;
    currentModule?: string;
    overallProgress?: number;
    attendancePercent?: number;
  },
  actorId: string,
  ipAddress?: string
) {
  const intern = await prisma.intern.findUnique({
    where: { id: internId },
    include: { userAccount: { select: { id: true } } },
  });
  if (!intern) throw ApiError.notFound('Intern not found');

  const before = { ...intern };

  // Email uniqueness check
  if (body.email) {
    const conflict = await prisma.userAccount.findFirst({
      where: { email: { equals: body.email, mode: 'insensitive' }, NOT: { id: intern.userAccount.id } },
    });
    if (conflict) throw ApiError.conflict('Email already in use');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedIntern = await tx.intern.update({
      where: { id: internId },
      data: {
        fullName: body.fullName,
        internshipRoleId: body.internshipRoleId,
        batchId: body.batchId,
        mentorId: body.mentorId,
        startDate: body.startDate ? new Date(body.startDate) : body.startDate === null ? null : undefined,
        endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
        status: body.status as never,
        currentPhase: body.currentPhase,
        currentModule: body.currentModule,
        overallProgress: body.overallProgress,
        attendancePercent: body.attendancePercent,
      },
    });

    if (body.email || body.phone) {
      await tx.userAccount.update({
        where: { id: intern.userAccount.id },
        data: {
          email: body.email ? body.email.toLowerCase().trim() : undefined,
          phone: body.phone,
        },
      });
    }

    return updatedIntern;
  });

  await logAudit({
    actorId,
    actorType: 'ADMIN',
    action: 'intern.updated',
    entityType: 'Intern',
    entityId: internId,
    before: before as never,
    after: updated as never,
    ipAddress,
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Suspend / activate
// ---------------------------------------------------------------------------

export async function suspendIntern(internId: string, reason: string | undefined, actorId: string, ipAddress?: string) {
  const intern = await prisma.intern.findUnique({ where: { id: internId }, include: { userAccount: true } });
  if (!intern) throw ApiError.notFound('Intern not found');
  if (intern.status === 'SUSPENDED') throw ApiError.conflict('Intern is already suspended');

  await prisma.$transaction([
    prisma.intern.update({ where: { id: internId }, data: { status: 'SUSPENDED' } }),
    prisma.userAccount.update({ where: { id: intern.userAccount.id }, data: { status: 'SUSPENDED' } }),
  ]);

  await logAudit({ actorId, actorType: 'ADMIN', action: 'intern.suspended', entityType: 'Intern', entityId: internId, after: { reason }, ipAddress });
}

export async function activateIntern(internId: string, actorId: string, ipAddress?: string) {
  const intern = await prisma.intern.findUnique({ where: { id: internId }, include: { userAccount: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  await prisma.$transaction([
    prisma.intern.update({ where: { id: internId }, data: { status: 'ACTIVE' } }),
    prisma.userAccount.update({ where: { id: intern.userAccount.id }, data: { status: 'ACTIVE' } }),
  ]);

  await logAudit({ actorId, actorType: 'ADMIN', action: 'intern.activated', entityType: 'Intern', entityId: internId, ipAddress });
}

// ---------------------------------------------------------------------------
// Soft delete
// ---------------------------------------------------------------------------

export async function deleteIntern(internId: string, actorId: string, ipAddress?: string) {
  const intern = await prisma.intern.findUnique({ where: { id: internId }, include: { userAccount: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  await prisma.userAccount.update({
    where: { id: intern.userAccount.id },
    data: { status: 'DELETED', email: `deleted_${Date.now()}_${intern.userAccount.email}` },
  });

  await logAudit({ actorId, actorType: 'ADMIN', action: 'intern.deleted', entityType: 'Intern', entityId: internId, ipAddress });
}

// ---------------------------------------------------------------------------
// Transfer role / batch
// ---------------------------------------------------------------------------

export async function transferIntern(
  internId: string,
  body: { internshipRoleId?: string; batchId?: string | null },
  actorId: string,
  ipAddress?: string
) {
  const intern = await prisma.intern.findUnique({ where: { id: internId } });
  if (!intern) throw ApiError.notFound('Intern not found');

  if (body.internshipRoleId && body.internshipRoleId !== intern.internshipRoleId) {
    // Close old enrollment
    await prisma.internshipEnrollment.updateMany({
      where: { internId, status: { in: ['ENROLLED', 'ACTIVE'] } },
      data: { status: 'TRANSFERRED', endDate: new Date() },
    });
    // Create new enrollment
    await prisma.internshipEnrollment.create({
      data: {
        internId,
        internshipRoleId: body.internshipRoleId,
        batchId: body.batchId ?? intern.batchId,
        status: 'ENROLLED',
        startDate: new Date(),
      },
    });
  }

  const updated = await prisma.intern.update({
    where: { id: internId },
    data: {
      internshipRoleId: body.internshipRoleId ?? intern.internshipRoleId,
      batchId: body.batchId !== undefined ? body.batchId : intern.batchId,
    },
  });

  await logAudit({ actorId, actorType: 'ADMIN', action: 'intern.transferred', entityType: 'Intern', entityId: internId, before: intern as never, after: updated as never, ipAddress });
  return updated;
}

// ---------------------------------------------------------------------------
// Extend internship
// ---------------------------------------------------------------------------

export async function extendInternship(
  internId: string,
  newEndDate: string,
  reason: string | undefined,
  actorId: string,
  ipAddress?: string
) {
  const intern = await prisma.intern.findUnique({ where: { id: internId } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const updated = await prisma.intern.update({
    where: { id: internId },
    data: { endDate: new Date(newEndDate) },
  });

  await logAudit({ actorId, actorType: 'ADMIN', action: 'intern.extended', entityType: 'Intern', entityId: internId, before: { endDate: intern.endDate } as never, after: { endDate: newEndDate, reason } as never, ipAddress });
  return updated;
}

// ---------------------------------------------------------------------------
// Analytics Summary
// ---------------------------------------------------------------------------

export async function getAnalyticsSummary() {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const [newInternsThisWeek, activeInternsCount, progressSumResult] = await Promise.all([
    prisma.intern.count({
      where: {
        createdAt: { gte: lastWeek }
      }
    }),
    prisma.intern.count({
      where: { status: 'ACTIVE' }
    }),
    prisma.intern.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { overallProgress: true }
    })
  ]);

  const totalProgress = progressSumResult._sum.overallProgress || 0;
  const averageCompletion = activeInternsCount > 0 ? Math.round(totalProgress / activeInternsCount) : 0;

  return {
    newInternsThisWeek,
    averageCompletion
  };
}
