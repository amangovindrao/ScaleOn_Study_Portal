import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/apiError';
import { verifyPassword, hashPassword, generateStrongPassword } from '@/utils/password';
import { createSession, revokeSession, revokeAllSessions } from '@/services/session.service';
import { sha256, generateRawToken } from '@/utils/crypto';
import { env } from '@/config/env';
import { logActivity } from '@/services/audit.service';
import { Emails } from '@/services/email.service';
import { ClientInfo } from '@/utils/requestInfo';
import { OAuth2Client } from 'google-auth-library';

const googleClient = env.google.enabled ? new OAuth2Client(env.google.clientId) : null;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function recordLoginHistory(opts: {
  userAccountId: string | null;
  identifierUsed: string;
  success: boolean;
  failureReason?: string;
  client: ClientInfo;
}) {
  await prisma.loginHistory.create({
    data: {
      userAccountId: opts.userAccountId,
      identifierUsed: opts.identifierUsed,
      success: opts.success,
      failureReason: opts.failureReason,
      ipAddress: opts.client.ipAddress,
      userAgent: opts.client.userAgent,
      browser: opts.client.browser,
      os: opts.client.os,
      device: opts.client.device,
      country: opts.client.country,
      city: opts.client.city,
    },
  });
}

async function guardAccountLogin(
  account: { id: string; status: string; failedLoginAttempts: number; lockedUntil: Date | null },
  identifierUsed: string,
  client: ClientInfo
) {
  if (account.status === 'DELETED') {
    throw ApiError.unauthorized('Account does not exist', 'ACCOUNT_NOT_FOUND');
  }
  if (account.status === 'SUSPENDED') {
    await recordLoginHistory({ userAccountId: account.id, identifierUsed, success: false, failureReason: 'ACCOUNT_SUSPENDED', client });
    throw ApiError.unauthorized('Account is suspended. Contact your administrator.', 'ACCOUNT_SUSPENDED');
  }
  if (account.lockedUntil && account.lockedUntil > new Date()) {
    const minutes = Math.ceil((account.lockedUntil.getTime() - Date.now()) / 60_000);
    await recordLoginHistory({ userAccountId: account.id, identifierUsed, success: false, failureReason: 'ACCOUNT_LOCKED', client });
    throw ApiError.unauthorized(`Account is locked. Try again in ${minutes} minute(s).`, 'ACCOUNT_LOCKED');
  }
}

async function handleFailedAttempt(accountId: string, identifierUsed: string, reason: string, client: ClientInfo) {
  const updated = await prisma.userAccount.update({
    where: { id: accountId },
    data: { failedLoginAttempts: { increment: 1 } },
    select: { failedLoginAttempts: true },
  });
  if (updated.failedLoginAttempts >= env.security.loginMaxAttempts) {
    await prisma.userAccount.update({
      where: { id: accountId },
      data: { lockedUntil: new Date(Date.now() + env.security.loginLockMinutes * 60_000), failedLoginAttempts: 0 },
    });
  }
  await recordLoginHistory({ userAccountId: accountId, identifierUsed, success: false, failureReason: reason, client });
}

// ---------------------------------------------------------------------------
// Admin login
// ---------------------------------------------------------------------------

export async function adminLogin(email: string, password: string, remember: boolean, client: ClientInfo) {
  const account = await prisma.userAccount.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, userType: 'ADMIN' },
    include: { role: true },
  });

  if (!account || !account.passwordHash) {
    await verifyPassword(password, '$2a$12$dummyhashfortimingnrO2q3Q3Q3Q3Q3Q3Q3Q3Q3Q');
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await guardAccountLogin(account, email, client);

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    await handleFailedAttempt(account.id, email, 'INVALID_PASSWORD', client);
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await createSession({
    userAccountId: account.id,
    userType: account.userType,
    roleSlug: account.role.slug,
    client,
    remember,
  });

  await recordLoginHistory({ userAccountId: account.id, identifierUsed: email, success: true, client });
  await logActivity({ userAccountId: account.id, action: 'auth.admin_login', ipAddress: client.ipAddress });

  return { tokens, account: { id: account.id, isFirstLogin: account.isFirstLogin, mustChangePassword: account.mustChangePassword } };
}

// ---------------------------------------------------------------------------
// Google OAuth (admin)
// ---------------------------------------------------------------------------

export async function adminGoogleLogin(idToken: string, remember: boolean, client: ClientInfo) {
  if (!googleClient) throw ApiError.badRequest('Google authentication is not configured');

  let googleEmail: string;
  let googleId: string;
  let googleName: string | undefined;

  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.google.clientId! });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Empty payload');
    googleEmail = payload.email!;
    googleId = payload.sub;
    googleName = payload.name;
  } catch {
    throw ApiError.unauthorized('Invalid Google token', 'INVALID_GOOGLE_TOKEN');
  }

  let account = await prisma.userAccount.findFirst({
    where: { googleId, userType: 'ADMIN' },
    include: { role: true, admin: { select: { fullName: true } } },
  });

  if (!account) {
    account = await prisma.userAccount.findFirst({
      where: { email: { equals: googleEmail, mode: 'insensitive' }, userType: 'ADMIN' },
      include: { role: true, admin: { select: { fullName: true } } },
    });
    if (!account) {
      throw ApiError.unauthorized('No admin account found for this Google account', 'GOOGLE_NO_ACCOUNT');
    }
    await prisma.userAccount.update({ where: { id: account.id }, data: { googleId } });
    if (googleName && !account.admin?.fullName) {
      await prisma.admin.updateMany({ where: { userAccountId: account.id }, data: { fullName: googleName } });
    }
  }

  await guardAccountLogin(account, googleEmail, client);

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await createSession({
    userAccountId: account.id,
    userType: account.userType,
    roleSlug: account.role.slug,
    client,
    remember,
  });

  await recordLoginHistory({ userAccountId: account.id, identifierUsed: googleEmail, success: true, client });
  await logActivity({ userAccountId: account.id, action: 'auth.google_login', ipAddress: client.ipAddress });

  return { tokens, account: { id: account.id, isFirstLogin: account.isFirstLogin, mustChangePassword: account.mustChangePassword } };
}

// ---------------------------------------------------------------------------
// Intern login
// ---------------------------------------------------------------------------

export async function internLogin(identifier: string, password: string, remember: boolean, client: ClientInfo) {
  const account = await prisma.userAccount.findFirst({
    where: {
      userType: 'INTERN',
      OR: [
        { username: { equals: identifier, mode: 'insensitive' } },
        { email: { equals: identifier, mode: 'insensitive' } },
      ],
    },
    include: { role: true },
  });

  if (!account || !account.passwordHash) {
    await verifyPassword(password, '$2a$12$dummyhashfortimingnrO2q3Q3Q3Q3Q3Q3Q3Q3Q3Q');
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await guardAccountLogin(account, identifier, client);

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    await handleFailedAttempt(account.id, identifier, 'INVALID_PASSWORD', client);
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await createSession({
    userAccountId: account.id,
    userType: account.userType,
    roleSlug: account.role.slug,
    client,
    remember,
  });

  await recordLoginHistory({ userAccountId: account.id, identifierUsed: identifier, success: true, client });
  await logActivity({ userAccountId: account.id, action: 'auth.intern_login', ipAddress: client.ipAddress });

  return { tokens, account: { id: account.id, isFirstLogin: account.isFirstLogin, mustChangePassword: account.mustChangePassword } };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(sessionId: string, userAccountId: string, client: ClientInfo) {
  await revokeSession(sessionId);
  await logActivity({ userAccountId, action: 'auth.logout', ipAddress: client.ipAddress });
}

// ---------------------------------------------------------------------------
// Forgot / Reset password
// ---------------------------------------------------------------------------

export async function forgotPassword(identifier: string, client: ClientInfo) {
  const account = await prisma.userAccount.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: 'insensitive' } },
        { username: { equals: identifier, mode: 'insensitive' } },
      ],
    },
    include: { intern: { select: { fullName: true } }, admin: { select: { fullName: true } } },
  });

  if (!account || account.status === 'DELETED') return;

  await prisma.passwordResetToken.updateMany({
    where: { userAccountId: account.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateRawToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60_000);

  await prisma.passwordResetToken.create({
    data: { userAccountId: account.id, tokenHash, expiresAt, ipAddress: client.ipAddress },
  });

  const resetUrl = `${env.frontend.passwordResetUrl}?token=${rawToken}`;
  const fullName = account.intern?.fullName ?? account.admin?.fullName ?? 'User';
  await Emails.passwordReset(account.email, { fullName, resetUrl, expiresInMinutes: 15 });

  await logActivity({ userAccountId: account.id, action: 'auth.forgot_password', ipAddress: client.ipAddress });
}

export async function resetPassword(token: string, newPassword: string, client: ClientInfo) {

  const tokenHash = sha256(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { userAccount: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.userAccount.update({
      where: { id: resetToken.userAccountId },
      data: { passwordHash, mustChangePassword: false, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  await revokeAllSessions(resetToken.userAccountId);
  await logActivity({ userAccountId: resetToken.userAccountId, action: 'auth.reset_password', ipAddress: client.ipAddress });
}

// ---------------------------------------------------------------------------
// Change password (authenticated)
// ---------------------------------------------------------------------------

export async function changePassword(
  userAccountId: string,
  currentPassword: string,
  newPassword: string,
  currentSessionId: string,
  client: ClientInfo
) {
  const account = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: { passwordHash: true },
  });
  if (!account || !account.passwordHash) throw ApiError.badRequest('Password change not available for this account type');

  const valid = await verifyPassword(currentPassword, account.passwordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');

  const passwordHash = await hashPassword(newPassword);
  await prisma.userAccount.update({
    where: { id: userAccountId },
    data: { passwordHash, mustChangePassword: false, failedLoginAttempts: 0, lockedUntil: null },
  });

  await revokeAllSessions(userAccountId, currentSessionId);
  await logActivity({ userAccountId, action: 'auth.change_password', ipAddress: client.ipAddress });
}

// ---------------------------------------------------------------------------
// First login completion (intern onboarding)
// ---------------------------------------------------------------------------

export interface FirstLoginData {
  newPassword: string;
  acceptTerms: true;
  profile?: {
    phone?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    college?: string;
    university?: string;
    branch?: string;
    semester?: string;
  };
}

export async function completeFirstLogin(
  userAccountId: string,
  data: FirstLoginData,
  _currentSessionId: string,
  client: ClientInfo
) {
  const account = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    include: { intern: { select: { id: true } } },
  });
  if (!account) throw ApiError.notFound('Account not found');
  if (!account.isFirstLogin && !account.mustChangePassword) {
    throw ApiError.badRequest('Account has already completed first login');
  }

  const passwordHash = await hashPassword(data.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.userAccount.update({
      where: { id: userAccountId },
      data: {
        passwordHash,
        mustChangePassword: false,
        isFirstLogin: false,
        termsAcceptedAt: new Date(),
        status: 'ACTIVE',
        ...(data.profile?.phone ? { phone: data.profile.phone } : {}),
      },
    });

    if (data.profile && account.intern) {
      const { phone, ...profileData } = data.profile;
      const cleanProfile = Object.fromEntries(
        Object.entries(profileData).filter(([, v]) => v !== undefined && v !== '')
      );
      if (Object.keys(cleanProfile).length > 0) {
        await tx.internProfile.upsert({
          where: { internId: account.intern.id },
          create: { internId: account.intern.id, ...cleanProfile },
          update: cleanProfile,
        });
      }
    }
  });

  // Don't revoke current session — intern stays logged in
  await logActivity({ userAccountId, action: 'auth.first_login_complete', ipAddress: client.ipAddress });
}

// ---------------------------------------------------------------------------
// Admin: regenerate / force-reset intern password
// ---------------------------------------------------------------------------

export async function adminResetInternPassword(
  targetUserAccountId: string,
  actorId: string,
  forceChange: boolean,
  client: ClientInfo
): Promise<string> {
  const account = await prisma.userAccount.findUnique({
    where: { id: targetUserAccountId },
    include: { intern: { select: { fullName: true, scaleonId: true } } },
  });
  if (!account || account.userType !== 'INTERN') throw ApiError.notFound('Intern account not found');

  const newPassword = generateStrongPassword();
  const passwordHash = await hashPassword(newPassword);

  await prisma.userAccount.update({
    where: { id: targetUserAccountId },
    data: { passwordHash, mustChangePassword: forceChange, failedLoginAttempts: 0, lockedUntil: null },
  });

  await revokeAllSessions(targetUserAccountId);

  if (account.intern) {
    await Emails.credentials(account.email, {
      fullName: account.intern.fullName,
      username: account.username ?? account.email,
      password: newPassword,
      scaleonId: account.intern.scaleonId,
      loginUrl: `${env.frontend.url}/login`,
    });
  }

  await logActivity({
    userAccountId: actorId,
    action: 'auth.admin_reset_intern_password',
    entityType: 'UserAccount',
    entityId: targetUserAccountId,
    ipAddress: client.ipAddress,
  });

  return newPassword;
}
