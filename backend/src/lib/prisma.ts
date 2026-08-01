import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

/**
 * Single shared PrismaClient instance. In development we attach it to the
 * global object to avoid exhausting DB connections on hot-reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProd ? ['error'] : ['error', 'warn'],
  });

if (!env.isProd) {
  globalForPrisma.prisma = prisma;
}
