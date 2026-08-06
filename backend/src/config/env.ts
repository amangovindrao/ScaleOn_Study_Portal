import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

function num(key: string, fallback: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(key: string, fallback = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: optional('NODE_ENV', 'development') === 'production',
  port: num('PORT', 4000),
  apiPrefix: optional('API_PREFIX', '/api/v1'),
  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
    refreshRememberExpiresIn: optional('JWT_REFRESH_REMEMBER_EXPIRES_IN', '30d'),
  },

  cookie: {
    domain: optional('COOKIE_DOMAIN', 'localhost'),
    secure: bool('COOKIE_SECURE', false),
    sameSite: (optional('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none'),
  },

  csrfSecret: required('CSRF_SECRET'),

  google: {
    clientId: optional('GOOGLE_CLIENT_ID'),
    clientSecret: optional('GOOGLE_CLIENT_SECRET'),
    redirectUri: optional('GOOGLE_REDIRECT_URI'),
    enabled: optional('GOOGLE_CLIENT_ID') !== '',
  },

  adminRouteKey: optional('ADMIN_ROUTE_KEY', 'Y'),

  security: {
    loginMaxAttempts: num('LOGIN_MAX_ATTEMPTS', 5),
    loginLockMinutes: num('LOGIN_LOCK_MINUTES', 15),
    rateLimitWindowMinutes: num('RATE_LIMIT_WINDOW_MINUTES', 15),
    rateLimitMax: num('RATE_LIMIT_MAX', 300),
    authRateLimitMax: num('AUTH_RATE_LIMIT_MAX', 20),
  },

  identity: {
    internIdPrefix: optional('INTERN_ID_PREFIX', 'SOINT'),
    usernamePrefix: optional('USERNAME_PREFIX', 'SO'),
  },

  email: {
    provider: optional('EMAIL_PROVIDER', 'console'),
    from: optional('EMAIL_FROM', 'ScaleOn Portal <no-reply@scaleon.io>'),
    smtpHost: optional('SMTP_HOST'),
    smtpPort: num('SMTP_PORT', 587),
    smtpUser: optional('SMTP_USER'),
    smtpPass: optional('SMTP_PASS'),
  },

  frontend: {
    url: optional('FRONTEND_URL', 'http://localhost:3000'),
    passwordResetUrl: optional('PASSWORD_RESET_URL', 'http://localhost:3000/reset-password'),
  },
};

export type Env = typeof env;
