import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/apiResponse';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/apiError';

// ── Admin: CRUD Phases & Modules ──────────────────────────────────

export const listPhases = asyncHandler(async (_req: Request, res: Response) => {
  const phases = await prisma.learningPhase.findMany({
    orderBy: { order: 'asc' },
    include: { modules: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true, points: true, duration: true, status: true } } },
  });
  sendSuccess(res, phases);
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
  const module = await prisma.learningModule.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, module);
});

// ── Intern: View Learning ──────────────────────────────────────────

export const getMyLearning = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const phases = await prisma.learningPhase.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { order: 'asc' },
    include: {
      modules: {
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
        include: { progress: { where: { internId: intern.id } } },
      },
    },
  });

  sendSuccess(res, phases);
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

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { submissions: { where: { internId: intern.id } }, module: { select: { title: true } } },
  });
  sendSuccess(res, assignments);
});

export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const intern = await prisma.intern.findFirst({ where: { userAccountId }, select: { id: true } });
  if (!intern) throw ApiError.notFound('Intern not found');

  const { submissionUrl, submissionText } = req.body;
  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_internId: { assignmentId: req.params.assignmentId, internId: intern.id } },
    create: { assignmentId: req.params.assignmentId, internId: intern.id, submissionUrl, submissionText, status: 'SUBMITTED', submittedAt: new Date() },
    update: { submissionUrl, submissionText, status: 'SUBMITTED', submittedAt: new Date() },
  });
  sendSuccess(res, submission);
});

// ── Live Sessions ──────────────────────────────────────────────────

export const listLiveSessions = asyncHandler(async (_req: Request, res: Response) => {
  const sessions = await prisma.liveSession.findMany({
    where: { status: { in: ['SCHEDULED', 'LIVE'] } },
    orderBy: { scheduledAt: 'asc' },
    include: { _count: { select: { attendees: true } } },
  });
  sendSuccess(res, sessions);
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

  const tickets = await prisma.supportTicket.findMany({
    where: { internId: intern.id },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  sendSuccess(res, tickets);
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

// Admin: create assignment
export const adminCreateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, instructions, moduleId, dueDate, maxScore } = req.body;
  const assignment = await prisma.assignment.create({
    data: { title, description, instructions, moduleId, dueDate: dueDate ? new Date(dueDate) : null, maxScore: maxScore ?? 100 },
  });
  sendSuccess(res, assignment, 201);
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
export const adminListTickets = asyncHandler(async (_req: Request, res: Response) => {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { intern: { select: { fullName: true, scaleonId: true } }, messages: true },
  });
  sendSuccess(res, tickets);
});
