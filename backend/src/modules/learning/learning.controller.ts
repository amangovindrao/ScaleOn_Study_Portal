import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, buildPagination } from '@/utils/apiResponse';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/apiError';

// ── Admin: CRUD Phases & Modules ──────────────────────────────────

export const listPhases = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, phases] = await Promise.all([
    prisma.learningPhase.count(),
    prisma.learningPhase.findMany({
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
      include: { modules: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true, points: true, duration: true, status: true } } },
    }),
  ]);

  sendSuccess(res, phases, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const createPhase = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, order } = req.body;
  const phase = await prisma.learningPhase.create({ data: { name, slug, description, order: order ?? 0, status: 'PUBLISHED' } });
  sendSuccess(res, phase, 201);
});

export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId, title, description, content, videoUrl, resourceUrl, order, duration, points } = req.body;
  const module = await prisma.learningModule.create({
    data: { phaseId, title, description, content, videoUrl, resourceUrl, order: order ?? 0, duration, points: points ?? 10, status: 'PUBLISHED' },
  });
  sendSuccess(res, module, 201);
});

export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.learningModule.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Learning module not found');

  const { phaseId, title, description, content, videoUrl, resourceUrl, order, duration, points, status } = req.body;

  const data: Prisma.LearningModuleUpdateInput = {};
  if (phaseId !== undefined) data.phase = { connect: { id: phaseId } };
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (content !== undefined) data.content = content;
  if (videoUrl !== undefined) data.videoUrl = videoUrl;
  if (resourceUrl !== undefined) data.resourceUrl = resourceUrl;
  if (order !== undefined) data.order = Number(order);
  if (duration !== undefined) data.duration = duration;
  if (points !== undefined) data.points = Number(points);
  if (status !== undefined) data.status = status;

  const updatedModule = await prisma.learningModule.update({
    where: { id },
    data,
  });
  sendSuccess(res, updatedModule);
});

// ── Intern: View Learning ──────────────────────────────────────────

export const getMyLearning = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const where: Prisma.LearningPhaseWhereInput = { status: 'PUBLISHED' };

  const [total, phases] = await Promise.all([
    prisma.learningPhase.count({ where }),
    prisma.learningPhase.findMany({
      where,
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
      include: {
        modules: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
          include: { progress: { where: { internId: intern.id } } },
        },
      },
    }),
  ]);

  sendSuccess(res, phases, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const completeModule = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const learningModule = await prisma.learningModule.findFirst({
    where: { id: req.params.moduleId, status: 'PUBLISHED' },
    select: { id: true, points: true },
  });
  if (!learningModule) throw ApiError.notFound('Published module not found');

  const result = await prisma.$transaction(async (tx) => {
    const existingProgress = await tx.moduleProgress.findUnique({
      where: { internId_moduleId: { internId: intern.id, moduleId: learningModule.id } },
      select: { status: true },
    });

    if (existingProgress?.status === 'COMPLETED') {
      return { alreadyCompleted: true, awardedXp: 0 };
    }

    const completedAt = new Date();
    await tx.moduleProgress.upsert({
      where: { internId_moduleId: { internId: intern.id, moduleId: learningModule.id } },
      create: {
        internId: intern.id,
        moduleId: learningModule.id,
        status: 'COMPLETED',
        startedAt: completedAt,
        completedAt,
      },
      update: { status: 'COMPLETED', completedAt },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await tx.dailyActivity.upsert({
      where: { internId_date: { internId: intern.id, date: today } },
      create: {
        internId: intern.id,
        date: today,
        xpEarned: learningModule.points,
        modules: 1,
      },
      update: {
        xpEarned: { increment: learningModule.points },
        modules: { increment: 1 },
      },
    });

    const previousStreak = await tx.internStreak.findUnique({
      where: { internId: intern.id },
      select: { currentStreak: true, longestStreak: true, lastActiveDate: true, totalXp: true },
    });

    let currentStreak = 1;
    if (previousStreak?.lastActiveDate) {
      const lastActiveDate = new Date(previousStreak.lastActiveDate);
      lastActiveDate.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActiveDate.getTime() === today.getTime()) {
        currentStreak = previousStreak.currentStreak;
      } else if (lastActiveDate.getTime() === yesterday.getTime()) {
        currentStreak = previousStreak.currentStreak + 1;
      }
    }

    const totalXp = (previousStreak?.totalXp ?? 0) + learningModule.points;
    const longestStreak = Math.max(previousStreak?.longestStreak ?? 0, currentStreak);
    await tx.internStreak.upsert({
      where: { internId: intern.id },
      create: {
        internId: intern.id,
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        totalXp,
        level: Math.floor(totalXp / 100) + 1,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        totalXp,
        level: Math.floor(totalXp / 100) + 1,
      },
    });

    const [publishedModules, completedModules] = await Promise.all([
      tx.learningModule.count({ where: { status: 'PUBLISHED' } }),
      tx.moduleProgress.count({ where: { internId: intern.id, status: 'COMPLETED' } }),
    ]);
    const overallProgress = publishedModules > 0
      ? Math.round((completedModules / publishedModules) * 10_000) / 100
      : 0;
    await tx.intern.update({ where: { id: intern.id }, data: { overallProgress } });

    // Check Phase Completion & Auto-issue Certificate
    const targetModule = await tx.learningModule.findUnique({
      where: { id: learningModule.id },
      select: { phaseId: true, phase: { select: { name: true } } },
    });

    if (targetModule) {
      const [phaseModulesCount, completedPhaseModulesCount] = await Promise.all([
        tx.learningModule.count({ where: { phaseId: targetModule.phaseId, status: 'PUBLISHED' } }),
        tx.moduleProgress.count({
          where: {
            internId: intern.id,
            status: 'COMPLETED',
            module: { phaseId: targetModule.phaseId, status: 'PUBLISHED' },
          },
        }),
      ]);

      if (phaseModulesCount > 0 && completedPhaseModulesCount >= phaseModulesCount) {
        const internRecord = await tx.intern.findUnique({ where: { id: intern.id }, select: { scaleonId: true } });
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const code = `CERT-${internRecord?.scaleonId || 'SOINT'}-PH${targetModule.phaseId.slice(0, 4).toUpperCase()}-${dateStr}`;

        await tx.certificate.upsert({
          where: { internId_phaseId: { internId: intern.id, phaseId: targetModule.phaseId } },
          create: {
            internId: intern.id,
            phaseId: targetModule.phaseId,
            phaseName: targetModule.phase.name,
            certificateCode: code,
          },
          update: {},
        });
      }
    }

    return { alreadyCompleted: false, awardedXp: learningModule.points };
  });

  sendSuccess(res, {
    ...result,
    message: result.alreadyCompleted
      ? 'Module was already completed; no additional XP was awarded.'
      : `Module completed! +${result.awardedXp} XP`,
  });
});

export const getMyCertificates = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({
    where: { userAccountId },
    select: { id: true, fullName: true, scaleonId: true },
  });
  if (!intern) throw ApiError.notFound('Intern not found');

  const certificates = await prisma.certificate.findMany({
    where: { internId: intern.id },
    orderBy: { issuedAt: 'desc' },
    include: {
      phase: { select: { name: true, description: true } },
    },
  });

  sendSuccess(res, certificates);
});


// ── Leaderboard ──────────────────────────────────────────────────

export const getLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const leaderboard = await prisma.internStreak.findMany({
    orderBy: { totalXp: 'desc' },
    take: 20,
    include: { intern: { select: { fullName: true, scaleonId: true, internshipRole: { select: { name: true, code: true } } } } },
  });
  sendSuccess(res, leaderboard);
});

// ── Streak ─────────────────────────────────────────────────────────

export const getMyStreak = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const streak = await prisma.internStreak.findUnique({ where: { internId: intern.id } });
  const recent = await prisma.dailyActivity.findMany({
    where: { internId: intern.id },
    orderBy: { date: 'desc' },
    take: 7,
  });

  sendSuccess(res, { streak: streak ?? { currentStreak: 0, longestStreak: 0, totalXp: 0, level: 1 }, recentDays: recent });
});

// ── Assignments ────────────────────────────────────────────────────

export const listAssignments = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, assignments] = await Promise.all([
    prisma.assignment.count(),
    prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { submissions: { where: { internId: intern.id } }, module: { select: { title: true } } },
    }),
  ]);

  sendSuccess(res, assignments, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { assignmentId } = req.params;
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw ApiError.notFound('Assignment not found');

  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    throw ApiError.badRequest('Deadline has passed. Submissions can no longer be created or modified.');
  }

  const submissionUrl = req.body.submissionUrl || req.body.liveUrl || '';
  const submissionText = req.body.submissionText || '';

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_internId: { assignmentId, internId: intern.id } },
    create: { assignmentId, internId: intern.id, submissionUrl, submissionText, status: 'SUBMITTED', submittedAt: new Date() },
    update: { submissionUrl, submissionText, status: 'SUBMITTED', submittedAt: new Date() },
  });
  sendSuccess(res, submission);
});

export const deleteSubmission = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { assignmentId } = req.params;
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw ApiError.notFound('Assignment not found');

  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    throw ApiError.badRequest('Deadline has passed. Submissions can no longer be deleted.');
  }

  await prisma.assignmentSubmission.delete({
    where: { assignmentId_internId: { assignmentId, internId: intern.id } },
  });

  sendSuccess(res, { message: 'Submission deleted successfully' });
});

// ── Live Sessions ──────────────────────────────────────────────────

export const listLiveSessions = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const where: Prisma.LiveSessionWhereInput = { status: { in: ['SCHEDULED', 'LIVE'] } };

  const [total, sessions] = await Promise.all([
    prisma.liveSession.count({ where }),
    prisma.liveSession.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      skip,
      take: pageSize,
      include: { _count: { select: { attendees: true } } },
    }),
  ]);

  sendSuccess(res, sessions, 200, { pagination: buildPagination(page, pageSize, total) });
});

// ── Support Tickets ────────────────────────────────────────────────

export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { subject, description, category, priority } = req.body;
  const ticket = await prisma.supportTicket.create({
    data: { internId: intern.id, subject, description, category: category ?? 'general', priority: priority ?? 'MEDIUM' },
  });
  sendSuccess(res, ticket, 201);
});

export const listMyTickets = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const where = { internId: intern.id };

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    }),
  ]);

  sendSuccess(res, tickets, 200, { pagination: buildPagination(page, pageSize, total) });
});

export const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { ticketId } = req.params;
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, internId: intern.id },
  });

  if (!ticket) throw ApiError.notFound('Ticket not found or unauthorized');

  await prisma.supportTicket.delete({
    where: { id: ticketId },
  });

  sendSuccess(res, { message: 'Ticket deleted successfully' });
});

export const replyTicket = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { ticketId } = req.params;
  const { message } = req.body;
  if (!message || !message.trim()) throw ApiError.badRequest('Message content is required');

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, internId: intern.id },
  });
  if (!ticket) throw ApiError.notFound('Ticket not found or unauthorized');

  const newMessage = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: userAccountId,
      senderType: 'INTERN',
      message: message.trim(),
    },
  });

  if (ticket.status === 'RESOLVED') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'OPEN', resolvedAt: null },
    });
  }

  sendSuccess(res, newMessage, 201);
});

export const updateTicketStatus = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { ticketId } = req.params;
  const { status } = req.body;
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    throw ApiError.badRequest('Invalid ticket status');
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, internId: intern.id },
  });
  if (!ticket) throw ApiError.notFound('Ticket not found or unauthorized');

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
    },
  });

  sendSuccess(res, updated);
});
// ── Admin Support ────────────────────────────────────────────────
export const adminReplyTicket = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const { ticketId } = req.params;
  const { message } = req.body;
  if (!message || !message.trim()) throw ApiError.badRequest('Message content is required');

  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId } });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const newMessage = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: userAccountId,
      senderType: 'ADMIN',
      message: message.trim(),
    },
  });

  if (ticket.status === 'RESOLVED') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'OPEN', resolvedAt: null },
    });
  }

  sendSuccess(res, newMessage, 201);
});

export const adminUpdateTicketStatus = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    throw ApiError.badRequest('Invalid ticket status');
  }

  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId } });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
    },
  });
  sendSuccess(res, updated);
});

// ── Admin Analytics ────────────────────────────────────────────────

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalInterns, activeInterns, completedInterns, totalModules, avgProgress, topPerformers] = await Promise.all([
    prisma.intern.count(),
    prisma.intern.count({ where: { status: 'ACTIVE' } }),
    prisma.intern.count({ where: { status: 'COMPLETED' } }),
    prisma.learningModule.count({ where: { status: 'PUBLISHED' } }),
    prisma.intern.aggregate({ _avg: { overallProgress: true } }),
    prisma.internStreak.findMany({ orderBy: { totalXp: 'desc' }, take: 5, include: { intern: { select: { fullName: true, scaleonId: true, overallProgress: true } } } }),
  ]);

  sendSuccess(res, {
    totalInterns, activeInterns, completedInterns, totalModules,
    avgProgress: Math.round(avgProgress._avg.overallProgress ?? 0),
    topPerformers,
  });
});

// Admin: list all assignments with submission stats
export const adminListAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { search, moduleId, dueDateRange } = req.query;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  if (moduleId && moduleId !== 'all') {
    where.moduleId = String(moduleId);
  }
  if (dueDateRange && dueDateRange !== 'all') {
    const now = new Date();
    if (dueDateRange === 'overdue') {
      where.dueDate = { lt: now };
    } else if (dueDateRange === 'upcoming') {
      where.dueDate = { gte: now };
    } else if (dueDateRange === 'no_due_date') {
      where.dueDate = null;
    }
  }

  const assignments = await prisma.assignment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      module: { select: { id: true, title: true } },
      submissions: { select: { id: true, status: true, score: true, internId: true } },
      _count: { select: { submissions: true } }
    }
  });

  const formatted = assignments.map(asgn => {
    const subs = asgn.submissions || [];
    return {
      ...asgn,
      submissionStats: {
        total: subs.length,
        pending: subs.filter(s => s.status === 'PENDING').length,
        submitted: subs.filter(s => s.status === 'SUBMITTED').length,
        reviewed: subs.filter(s => s.status === 'REVIEWED').length,
        approved: subs.filter(s => s.status === 'APPROVED').length,
        rejected: subs.filter(s => s.status === 'REJECTED').length,
      }
    };
  });

  sendSuccess(res, formatted);
});

// Admin: get single assignment details & submissions
export const adminGetAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, title: true } },
      submissions: {
        include: {
          intern: { select: { id: true, fullName: true, scaleonId: true, userAccount: { select: { email: true } } } }
        },
        orderBy: { submittedAt: 'desc' }
      },
      _count: { select: { submissions: true } }
    }
  });
  if (!assignment) throw ApiError.notFound('Assignment not found');

  const subs = assignment.submissions || [];
  const formattedSubmissions = subs.map(s => ({
    id: s.id,
    assignmentId: s.assignmentId,
    internId: s.internId,
    intern: {
      id: s.intern?.id || s.internId,
      scaleonId: s.intern?.scaleonId || s.internId,
      fullName: s.intern?.fullName || 'Intern',
      email: s.intern?.userAccount?.email || '',
    },
    internName: s.intern?.fullName || 'Intern',
    internEmail: s.intern?.userAccount?.email || '',
    internScaleonId: s.intern?.scaleonId || s.internId,
    submissionUrl: s.submissionUrl,
    submissionText: s.submissionText,
    submittedAt: s.submittedAt ? s.submittedAt.toISOString() : s.createdAt.toISOString(),
    status: s.status,
    score: s.score,
    feedback: s.feedback,
    reviewedAt: s.reviewedAt ? s.reviewedAt.toISOString() : null,
    reviewedBy: s.reviewedBy
  }));

  sendSuccess(res, {
    ...assignment,
    submissions: formattedSubmissions,
    submissionStats: {
      total: subs.length,
      pending: subs.filter(s => s.status === 'PENDING').length,
      submitted: subs.filter(s => s.status === 'SUBMITTED').length,
      reviewed: subs.filter(s => s.status === 'REVIEWED').length,
      approved: subs.filter(s => s.status === 'APPROVED').length,
      rejected: subs.filter(s => s.status === 'REJECTED').length,
    }
  });
});

// Admin: create assignment
export const adminCreateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, instructions, moduleId, dueDate, maxScore } = req.body;
  const assignment = await prisma.assignment.create({
    data: { title, description, instructions, moduleId, dueDate: dueDate ? new Date(dueDate) : null, maxScore: maxScore ?? 100 },
  });
  sendSuccess(res, assignment, 201);
});

// Admin: update assignment
export const adminUpdateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, instructions, moduleId, dueDate, maxScore } = req.body;

  const assignment = await prisma.assignment.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(instructions !== undefined && { instructions }),
      ...(moduleId !== undefined && { moduleId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(maxScore !== undefined && { maxScore: Number(maxScore) }),
    },
    include: { module: { select: { id: true, title: true } } }
  });

  sendSuccess(res, assignment);
});

// Admin: delete assignment
export const adminDeleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.assignment.delete({ where: { id } });
  sendSuccess(res, { message: 'Assignment deleted successfully' });
});

// Admin: review intern submission
export const adminReviewSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { score, feedback, status } = req.body;

  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score: score !== undefined ? Number(score) : undefined,
      feedback: feedback !== undefined ? feedback : undefined,
      status: status || 'REVIEWED',
      reviewedAt: new Date(),
      reviewedBy: req.authUser?.userAccountId || 'Admin'
    }
  });

  sendSuccess(res, submission);
});

// Admin/Intern: list modules for assignment dropdowns
export const listLearningModules = asyncHandler(async (_req: Request, res: Response) => {
  const modules = await prisma.learningModule.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true }
  });
  sendSuccess(res, modules);
});

// Admin: list all live sessions
export const adminListLiveSessions = asyncHandler(async (_req: Request, res: Response) => {
  const sessions = await prisma.liveSession.findMany({
    orderBy: { scheduledAt: 'desc' },
    include: { _count: { select: { attendees: true } } },
  });
  sendSuccess(res, sessions);
});

// Admin: create live session
export const adminCreateLiveSession = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, hostName, meetingUrl, scheduledAt, duration } = req.body;
  const session = await prisma.liveSession.create({
    data: { title, description, hostName, meetingUrl, scheduledAt: new Date(scheduledAt), duration, status: 'SCHEDULED' },
  });
  sendSuccess(res, session, 201);
});

// Admin: list all tickets
export const adminListTickets = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count(),
    prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { intern: { select: { fullName: true, scaleonId: true } }, messages: true },
    }),
  ]);

  sendSuccess(res, tickets, 200, { pagination: buildPagination(page, pageSize, total) });
});

// ── Intern of the Week Handlers ─────────────────────────────────────

export const getInternOfWeek = asyncHandler(async (_req: Request, res: Response) => {
  const record = await prisma.internOfWeek.findFirst({
    orderBy: { weekStart: 'desc' },
    include: {
      intern: {
        select: {
          id: true,
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });
  sendSuccess(res, record ?? null);
});

export const getInternOfWeekHistory = asyncHandler(async (_req: Request, res: Response) => {
  const history = await prisma.internOfWeek.findMany({
    orderBy: { weekStart: 'desc' },
    take: 50,
    include: {
      intern: {
        select: {
          id: true,
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });
  sendSuccess(res, history);
});

export const adminSetInternOfWeek = asyncHandler(async (req: Request, res: Response) => {
  const { internId, weekStart, weekXp, reason } = req.body;

  if (!internId || !weekStart) {
    throw ApiError.badRequest('internId and weekStart are required');
  }

  const date = new Date(weekStart);
  date.setHours(0, 0, 0, 0);

  const weekLabel = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const record = await prisma.internOfWeek.upsert({
    where: { weekStart: date },
    create: {
      internId,
      weekStart: date,
      weekLabel,
      weekXp: Number(weekXp ?? 0),
      reason: reason ?? '',
    },
    update: {
      internId,
      weekLabel,
      weekXp: Number(weekXp ?? 0),
      reason: reason ?? '',
    },
    include: {
      intern: {
        select: {
          id: true,
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });

  sendSuccess(res, record, 201);
});

export const adminDeleteInternOfWeek = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.internOfWeek.delete({ where: { id } });
  sendSuccess(res, { message: 'Intern of Week entry removed successfully' });
});

