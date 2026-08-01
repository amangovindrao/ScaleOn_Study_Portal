import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from '@/config/env';
import { globalLimiter } from '@/middleware/rateLimit.middleware';
import { csrfProtection } from '@/middleware/csrf.middleware';
import { notFoundHandler, errorHandler } from '@/middleware/error.middleware';

// Route modules
import authRoutes from '@/modules/auth/auth.routes';
import internRoutes from '@/modules/interns/intern.routes';
import sessionRoutes from '@/modules/sessions/session.routes';
import profileRoutes from '@/modules/profile/profile.routes';
import roleRoutes from '@/modules/roles/role.routes';
import catalogRoutes from '@/modules/catalog/catalog.routes';
import learningRoutes from '@/modules/learning/learning.routes';

const app = express();

// ── Security headers ────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: env.isProd,
    crossOriginEmbedderPolicy: env.isProd,
  })
);

// ── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// ── Body / cookies / HPP ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(hpp());

// Trust proxy (for rate limiter + IP detection behind Next.js proxy)
app.set('trust proxy', 1);

// ── Rate limiting ───────────────────────────────────────────
app.use(globalLimiter);

// ── CSRF ────────────────────────────────────────────────────
if (env.isProd) {
  app.use(csrfProtection());
}

// ── Health check (no auth) ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.nodeEnv });
});

// ── API Routes ──────────────────────────────────────────────
const base = env.apiPrefix; // /api/v1

app.use(`${base}/auth`, authRoutes);
app.use(`${base}/interns`, internRoutes);
app.use(`${base}/sessions`, sessionRoutes);
app.use(`${base}/profiles`, profileRoutes);
app.use(`${base}/roles`, roleRoutes);
app.use(`${base}/catalog`, catalogRoutes);
app.use(`${base}/learning`, learningRoutes);

// ── 404 & error handlers ────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 ScaleOn API running on port ${env.port} [${env.nodeEnv}]`);
});

// ── Graceful shutdown ────────────────────────────────────────
process.on('SIGTERM', () => {
  server.close(() => {
    import('@/lib/prisma').then(({ prisma }) => prisma.$disconnect());
  });
});

export default app;
