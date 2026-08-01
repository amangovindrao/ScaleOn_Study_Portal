import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface ActivityInput {
  userAccountId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

interface AuditInput {
  actorId?: string | null;
  actorType?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string;
}

/** Lightweight, fire-and-forget activity logging. Never throws to caller. */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userAccountId: input.userAccountId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
      },
    });
  } catch {
    /* swallow logging errors */
  }
}

/** Records a before/after audit entry for sensitive mutations. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorType: input.actorType,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before,
        after: input.after,
        ipAddress: input.ipAddress,
      },
    });
  } catch {
    /* swallow logging errors */
  }
}
