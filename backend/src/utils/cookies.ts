import { Response } from 'express';
import { env } from '@/config/env';
import { durationToMs } from '@/utils/jwt';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const baseOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  domain?: string;
} = {
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  path: '/',
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
};

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  refreshExpiresAt: Date
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions,
    maxAge: durationToMs(env.jwt.accessExpiresIn),
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    expires: refreshExpiresAt,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, baseOptions);
  res.clearCookie(REFRESH_COOKIE, baseOptions);
}

export function getRefreshCookie(cookies: Record<string, string> | undefined): string | null {
  return cookies?.[REFRESH_COOKIE] ?? null;
}
