import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';

/** Global limiter applied to all API routes. */
export const globalLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMinutes * 60_000,
  max: env.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } },
});

/** Stricter limiter for authentication endpoints (login, reset, refresh). */
export const authLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMinutes * 60_000,
  max: env.security.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts, try again later.' } },
});
