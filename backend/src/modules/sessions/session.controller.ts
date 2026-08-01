import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, buildPagination } from '@/utils/apiResponse';
import { prisma } from '@/lib/prisma';
import { revokeSession, revokeAllSessions } from '@/services/session.service';
import { getClientInfo } from '@/utils/requestInfo';
import { logActivity } from '@/services/audit.service';
import { ApiError } from '@/utils/apiError';

/** Admin: list all active sessions (all users or a specific user). */
export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const userAccountId = req.query.userAccountId as string | undefined;
  const activeOnly = req.query.activeOnly !== 'false';

  const where = {
    ...(userAccountId ? { userAccountId } : {}),
    ...(activeOnly ? { isActive: true } : {}),
  };

  const [total, sessions] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        ipAddress: true,
        browser: true,
        os: true,
        device: true,
        country: true,
        city: true,
        isActive: true,
        lastActivityAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
        userAccount: { select: { id: true, username: true, email: true, userType: true } },
      },
    }),
  ]);

  sendSuccess(res, sessions, 200, { pagination: buildPagination(page, pageSize, total) });
});

/** Admin: terminate a specific session by ID. */
export const terminateSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const client = getClientInfo(req);

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw ApiError.notFound('Session not found');

  await revokeSession(sessionId);
  await logActivity({
    userAccountId: req.authUser!.userAccountId,
    action: 'session.terminated',
    entityType: 'Session',
    entityId: sessionId,
    ipAddress: client.ipAddress,
  });

  sendSuccess(res, { message: 'Session terminated' });
});

/** Admin: terminate all sessions for a user. */
export const terminateUserSessions = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId;
  const client = getClientInfo(req);

  const count = await revokeAllSessions(targetUserId);
  await logActivity({
    userAccountId: req.authUser!.userAccountId,
    action: 'session.terminate_all',
    entityType: 'UserAccount',
    entityId: targetUserId,
    metadata: { count },
    ipAddress: client.ipAddress,
  });

  sendSuccess(res, { message: `${count} session(s) terminated` });
});

/** Intern/Admin: view own sessions. */
export const mySession = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;

  const sessions = await prisma.session.findMany({
    where: { userAccountId },
    orderBy: { lastActivityAt: 'desc' },
    take: 20,
    select: {
      id: true,
      ipAddress: true,
      browser: true,
      os: true,
      device: true,
      country: true,
      city: true,
      isActive: true,
      lastActivityAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  sendSuccess(res, sessions);
});

/** Intern/Admin: view own login history. */
export const myLoginHistory = asyncHandler(async (req: Request, res: Response) => {
  const userAccountId = req.authUser!.userAccountId;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);

  const [total, history] = await Promise.all([
    prisma.loginHistory.count({ where: { userAccountId } }),
    prisma.loginHistory.findMany({
      where: { userAccountId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  sendSuccess(res, history, 200, { pagination: buildPagination(page, pageSize, total) });
});

/** Admin: view login history for any user. */
export const userLoginHistory = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);

  const [total, history] = await Promise.all([
    prisma.loginHistory.count({ where: { userAccountId: targetUserId } }),
    prisma.loginHistory.findMany({
      where: { userAccountId: targetUserId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  sendSuccess(res, history, 200, { pagination: buildPagination(page, pageSize, total) });
});
