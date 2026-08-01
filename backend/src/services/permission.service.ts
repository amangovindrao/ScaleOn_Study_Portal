import { prisma } from '@/lib/prisma';

/**
 * Resolves the effective permission keys for a role from the database.
 * A short in-memory TTL cache avoids a DB round-trip on every request while
 * still picking up permission changes within `CACHE_TTL_MS`.
 */
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { permissions: string[]; expiresAt: number }>();

export async function getRolePermissions(roleId: string): Promise<string[]> {
  const cached = cache.get(roleId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

  const rows = await prisma.rolePermission.findMany({
    where: { roleId },
    select: { permission: { select: { key: true } } },
  });
  const permissions = rows.map((r) => r.permission.key);

  cache.set(roleId, { permissions, expiresAt: Date.now() + CACHE_TTL_MS });
  return permissions;
}

/** Invalidate cached permissions (call after changing a role's permissions). */
export function invalidateRolePermissions(roleId?: string): void {
  if (roleId) cache.delete(roleId);
  else cache.clear();
}
