import { rotateRefreshToken } from '@/services/session.service';
import { ApiError } from '@/utils/apiError';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';
import { clearAuthCookies, getRefreshCookie, setAuthCookies } from '@/utils/cookies';
import { getClientInfo } from '@/utils/requestInfo';
import { Request, Response } from 'express';
import * as AuthService from './auth.service';

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, remember } = req.body;
  const client = getClientInfo(req);

  const { tokens, account } = await AuthService.adminLogin(email, password, remember, client);

  setAuthCookies(res, tokens, tokens.refreshExpiresAt);
  sendSuccess(res, {
    sessionId: tokens.sessionId,
    isFirstLogin: account.isFirstLogin,
    mustChangePassword: account.mustChangePassword,
  });
});

export const adminGoogleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken, remember } = req.body;
  const client = getClientInfo(req);

  const { tokens, account } = await AuthService.adminGoogleLogin(idToken, remember, client);

  setAuthCookies(res, tokens, tokens.refreshExpiresAt);
  sendSuccess(res, {
    sessionId: tokens.sessionId,
    isFirstLogin: account.isFirstLogin,
    mustChangePassword: account.mustChangePassword,
  });
});

export const internLogin = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password, remember } = req.body;
  const client = getClientInfo(req);

  const { tokens, account } = await AuthService.internLogin(identifier, password, remember, client);

  setAuthCookies(res, tokens, tokens.refreshExpiresAt);
  sendSuccess(res, {
    sessionId: tokens.sessionId,
    isFirstLogin: account.isFirstLogin,
    mustChangePassword: account.mustChangePassword,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const raw = getRefreshCookie(req.cookies);
  if (!raw) throw ApiError.unauthorized('No refresh token', 'NO_REFRESH_TOKEN');

  const client = getClientInfo(req);
  const tokens = await rotateRefreshToken(raw, client);
  if (!tokens) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Refresh token invalid or expired', 'REFRESH_TOKEN_INVALID');
  }

  setAuthCookies(res, tokens, tokens.refreshExpiresAt);
  sendSuccess(res, { sessionId: tokens.sessionId });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.authUser!;
  const client = getClientInfo(req);

  await AuthService.logout(user.sessionId, user.userAccountId, client);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.body;
  const client = getClientInfo(req);

  await AuthService.forgotPassword(identifier, client);
  // Always 200 — never reveal if the account exists
  sendSuccess(res, { message: 'If an account exists, password reset instructions have been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const client = getClientInfo(req);

  await AuthService.resetPassword(token, newPassword, client);
  sendSuccess(res, { message: 'Password reset successful. Please log in with your new password.' });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { userAccountId, sessionId } = req.authUser!;
  const client = getClientInfo(req);

  await AuthService.changePassword(userAccountId, currentPassword, newPassword, sessionId, client);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Password changed. Please log in again.' });
});

export const completeFirstLogin = asyncHandler(async (req: Request, res: Response) => {
  const client = getClientInfo(req);

  // Try to get user from auth cookie (may or may not be set depending on timing)
  let userAccountId: string | undefined;
  let sessionId = 'none';

  if (req.authUser) {
    userAccountId = req.authUser.userAccountId;
    sessionId = req.authUser.sessionId;
  } else {
    // Fallback: try to extract from access_token cookie directly
    const token = req.cookies?.access_token;
    if (token) {
      try {
        const { verifyAccessToken } = await import('@/utils/jwt');
        const payload = verifyAccessToken(token);
        userAccountId = payload.sub;
        sessionId = payload.sid;
      } catch { /* token invalid */ }
    }
  }

  if (!userAccountId) {
    const { ApiError } = await import('@/utils/apiError');
    throw ApiError.unauthorized('Authentication required');
  }

  await AuthService.completeFirstLogin(userAccountId, req.body, sessionId, client);
  sendSuccess(res, { message: 'Account setup complete. Welcome to ScaleOn!' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { userAccountId } = req.authUser!;

  const account = await import('@/lib/prisma').then(({ prisma }) =>
    prisma.userAccount.findUnique({
      where: { id: userAccountId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        isFirstLogin: true,
        mustChangePassword: true,
        termsAcceptedAt: true,
        lastLoginAt: true,
        role: { select: { id: true, name: true, slug: true } },
        admin: { select: { fullName: true, profileImage: true, designation: true } },
        intern: {
          select: {
            scaleonId: true,
            fullName: true,
            currentPhase: true,
            currentModule: true,
            overallProgress: true,
            attendancePercent: true,
            status: true,
            internshipRole: { select: { name: true, code: true } },
            batch: { select: { name: true } },
            profile: true,
          },
        },
      },
    })
  );

  sendSuccess(res, account);
});
