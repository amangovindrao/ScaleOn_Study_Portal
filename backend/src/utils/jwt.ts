import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';
import { UserType } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string; // userAccountId
  type: UserType;
  roleSlug: string;
  sid: string; // sessionId
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  jti: string; // refresh token id
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload, remember: boolean): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: remember ? env.jwt.refreshRememberExpiresIn : env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
}

/** Convert a duration string like "15m", "7d", "30d" into milliseconds. */
export function durationToMs(duration: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(duration.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 0;
  return value * factor;
}
