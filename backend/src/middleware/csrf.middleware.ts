import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '@/config/env';
import { ApiError } from '@/utils/apiError';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit cookie CSRF protection.
 * A random token is set in a readable cookie; state-changing requests must
 * echo it back in the X-CSRF-Token header. Because httpOnly auth cookies are
 * only sent automatically and the CSRF token must be read by JS and copied to
 * a header, a cross-site attacker cannot forge it.
 */
export function csrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure a token cookie exists for the client to read.
    let token = req.cookies?.[CSRF_COOKIE] as string | undefined;
    if (!token) {
      token = crypto.createHmac('sha256', env.csrfSecret).update(crypto.randomUUID()).digest('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: env.cookie.secure,
        sameSite: env.cookie.sameSite,
        path: '/',
        ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
      });
    }

    if (SAFE_METHODS.has(req.method)) return next();

    const headerToken = req.headers[CSRF_HEADER] as string | undefined;
    if (!headerToken || headerToken !== token) {
      return next(ApiError.forbidden('Invalid CSRF token', 'CSRF_INVALID'));
    }
    next();
  };
}
