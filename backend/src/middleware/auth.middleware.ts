import { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { ApiError } from '@/utils/apiError';
import { verifyAccessToken } from '@/utils/jwt';
import { prisma } from '@/lib/prisma';
import { getRolePermissions } from '@/services/permission.service';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  // Fallback to httpOnly access cookie for browser clients
  const cookieToken = (req.cookies?.access_token as string) || null;
  return cookieToken;
}

/** Require a valid access token + active session. Populates req.authUser. */
export function authenticate() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) throw ApiError.unauthorized('Authentication required', 'NO_TOKEN');

      let payload;
      try {
        payload = verifyAccessToken(token);
      } catch {
        throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
      }

      const session = await prisma.session.findUnique({
        where: { id: payload.sid },
        select: { isActive: true, revokedAt: true, expiresAt: true, userAccountId: true },
      });
      if (!session || !session.isActive || session.revokedAt || session.expiresAt < new Date()) {
        throw ApiError.unauthorized('Session expired or terminated', 'SESSION_INVALID');
      }

      const account = await prisma.userAccount.findUnique({
        where: { id: payload.sub },
        select: { id: true, status: true, userType: true, roleId: true, role: { select: { slug: true } } },
      });
      if (!account || account.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is not active', 'ACCOUNT_INACTIVE');
      }

      const permissions = await getRolePermissions(account.roleId);

      req.authUser = {
        userAccountId: account.id,
        userType: account.userType,
        roleSlug: account.role.slug,
        sessionId: payload.sid,
        permissions,
      };

      // Touch session activity (fire and forget)
      void prisma.session.update({
        where: { id: payload.sid },
        data: { lastActivityAt: new Date() },
      }).catch(() => undefined);

      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Restrict a route to specific user types (ADMIN / INTERN / MENTOR). */
export function requireUserType(...types: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) return next(ApiError.unauthorized());
    if (!types.includes(req.authUser.userType)) {
      return next(ApiError.forbidden('Not allowed for this account type'));
    }
    next();
  };
}
