import { prisma } from '@/lib/prisma';
import { ClientInfo } from '@/utils/requestInfo';
import { generateRawToken, sha256 } from '@/utils/crypto';
import {
  durationToMs,
  signAccessToken,
  signRefreshToken,
} from '@/utils/jwt';
import { env } from '@/config/env';
import { UserType } from '@prisma/client';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  refreshExpiresAt: Date;
}

interface CreateSessionArgs {
  userAccountId: string;
  userType: UserType;
  roleSlug: string;
  client: ClientInfo;
  remember: boolean;
}

/**
 * Create a login session with an access token (short-lived JWT) and a refresh
 * token (rotating, stored hashed). The raw refresh token is returned once and
 * never persisted.
 */
export async function createSession(args: CreateSessionArgs): Promise<IssuedTokens> {
  const refreshTtl = args.remember
    ? env.jwt.refreshRememberExpiresIn
    : env.jwt.refreshExpiresIn;
  const refreshExpiresAt = new Date(Date.now() + durationToMs(refreshTtl));

  const session = await prisma.session.create({
    data: {
      userAccountId: args.userAccountId,
      ipAddress: args.client.ipAddress,
      userAgent: args.client.userAgent,
      browser: args.client.browser,
      os: args.client.os,
      device: args.client.device,
      country: args.client.country,
      city: args.client.city,
      expiresAt: refreshExpiresAt,
    },
  });

  const rawRefresh = generateRawToken();
  const refreshRecord = await prisma.refreshToken.create({
    data: {
      userAccountId: args.userAccountId,
      sessionId: session.id,
      tokenHash: sha256(rawRefresh),
      expiresAt: refreshExpiresAt,
      ipAddress: args.client.ipAddress,
      userAgent: args.client.userAgent,
    },
  });

  const accessToken = signAccessToken({
    sub: args.userAccountId,
    type: args.userType,
    roleSlug: args.roleSlug,
    sid: session.id,
  });

  // Refresh JWT is used for transport only; DB hash is the authority for revocation.
  // We sign it but only return the raw composite token to the client.
  signRefreshToken(
    { sub: args.userAccountId, sid: session.id, jti: refreshRecord.id },
    args.remember
  );

  // Bind the raw token via a composite the client returns; we keep hash of raw.
  await prisma.refreshToken.update({
    where: { id: refreshRecord.id },
    data: { tokenHash: sha256(`${refreshRecord.id}.${rawRefresh}`) },
  });

  return {
    accessToken,
    refreshToken: `${refreshRecord.id}.${rawRefresh}`,
    sessionId: session.id,
    refreshExpiresAt,
  };
}

/**
 * Rotate a refresh token: validates the presented raw token, revokes it, and
 * issues a fresh access + refresh pair on the same session. Detects reuse of
 * an already-rotated token and kills the session if so.
 */
export async function rotateRefreshToken(
  presentedToken: string,
  client: ClientInfo
): Promise<IssuedTokens | null> {
  const [recordId, raw] = presentedToken.split('.', 2);
  if (!recordId || !raw) return null;

  const record = await prisma.refreshToken.findUnique({
    where: { id: recordId },
    include: {
      userAccount: { select: { id: true, status: true, userType: true, role: { select: { slug: true } } } },
    },
  });
  if (!record) return null;

  // Reuse / theft detection: token already revoked -> nuke the session.
  if (record.revokedAt) {
    if (record.sessionId) await revokeSession(record.sessionId);
    return null;
  }

  if (record.expiresAt < new Date()) return null;
  if (record.tokenHash !== sha256(`${recordId}.${raw}`)) return null;
  if (!record.userAccount || record.userAccount.status !== 'ACTIVE') return null;
  if (!record.sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: record.sessionId },
    select: { isActive: true, expiresAt: true },
  });
  if (!session || !session.isActive || session.expiresAt < new Date()) return null;

  // Issue replacement
  const rawRefresh = generateRawToken();
  const newRecord = await prisma.refreshToken.create({
    data: {
      userAccountId: record.userAccountId,
      sessionId: record.sessionId,
      tokenHash: 'pending',
      expiresAt: record.expiresAt,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
    },
  });
  await prisma.refreshToken.update({
    where: { id: newRecord.id },
    data: { tokenHash: sha256(`${newRecord.id}.${rawRefresh}`) },
  });

  // Revoke the old one, recording the rotation chain.
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date(), replacedByTokenId: newRecord.id },
  });

  await prisma.session.update({
    where: { id: record.sessionId },
    data: { lastActivityAt: new Date() },
  });

  const accessToken = signAccessToken({
    sub: record.userAccountId,
    type: record.userAccount.userType,
    roleSlug: record.userAccount.role.slug,
    sid: record.sessionId,
  });

  // Refresh JWT is signed for transport but DB hash is the authority.
  signRefreshToken(
    { sub: record.userAccountId, sid: record.sessionId, jti: newRecord.id },
    record.expiresAt.getTime() - Date.now() > durationToMs(env.jwt.refreshExpiresIn)
  );

  return {
    accessToken,
    refreshToken: `${newRecord.id}.${rawRefresh}`,
    sessionId: record.sessionId,
    refreshExpiresAt: record.expiresAt,
  };
}

/** Revoke a single session and all its refresh tokens. */
export async function revokeSession(sessionId: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction([
    prisma.session.updateMany({
      where: { id: sessionId, isActive: true },
      data: { isActive: false, revokedAt: now },
    }),
    prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}

/** Revoke every active session for an account (e.g. after password reset). */
export async function revokeAllSessions(userAccountId: string, exceptSessionId?: string): Promise<number> {
  const now = new Date();
  const sessions = await prisma.session.findMany({
    where: { userAccountId, isActive: true, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    select: { id: true },
  });
  const ids = sessions.map((s) => s.id);
  if (ids.length === 0) return 0;

  await prisma.$transaction([
    prisma.session.updateMany({ where: { id: { in: ids } }, data: { isActive: false, revokedAt: now } }),
    prisma.refreshToken.updateMany({ where: { sessionId: { in: ids }, revokedAt: null }, data: { revokedAt: now } }),
  ]);
  return ids.length;
}
