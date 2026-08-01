import { Prisma } from '@prisma/client';
import { env } from '@/config/env';

/**
 * Identity generators for ScaleOn Intern ID and login usernames.
 *
 * Both use atomic, transaction-safe counters so concurrent creation at high
 * volume (100k+ interns) never produces duplicates:
 *  - Intern ID: a per-year JSONB counter in the Setting table, incremented in
 *    a single atomic UPDATE ... RETURNING statement (statement-level atomic).
 *  - Username: the integer InternshipRole.usernameSeq column, incremented with
 *    Prisma's atomic { increment: 1 }.
 */

/** Two-digit year used in the ScaleOn intern id (e.g. 2026 -> "26"). */
export function yearCode(date = new Date()): string {
  return String(date.getFullYear()).slice(-2);
}

interface SeqRow {
  seq: number;
}

/**
 * Generate the next ScaleOn Intern ID, e.g. SOINT260001.
 * Must run inside a transaction (tx) so the id is consumed atomically with the
 * intern row it belongs to.
 */
export async function nextScaleonId(
  tx: Prisma.TransactionClient,
  date = new Date()
): Promise<string> {
  const yy = yearCode(date);
  const key = `internIdSeq:${yy}`;

  // Atomic upsert + increment in one statement. jsonb_set on the {seq} path.
  const rows = await tx.$queryRaw<SeqRow[]>`
    INSERT INTO "Setting" ("id", "key", "group", "value", "description", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${key}, 'identity', '{"seq":1}'::jsonb,
            ${'Intern ID sequence for 20' + yy}, now(), now())
    ON CONFLICT ("key") DO UPDATE
      SET "value" = jsonb_set(
            "Setting"."value",
            '{seq}',
            to_jsonb(COALESCE(("Setting"."value"->>'seq')::int, 0) + 1)
          ),
          "updatedAt" = now()
    RETURNING (("Setting"."value"->>'seq')::int) AS "seq";
  `;

  const seq = rows[0]?.seq ?? 1;
  const padded = String(seq).padStart(4, '0');
  return `${env.identity.internIdPrefix}${yy}${padded}`;
}

/**
 * Generate the next username for an internship role, e.g. SO-AI-0001.
 * Atomically increments InternshipRole.usernameSeq inside the transaction.
 */
export async function nextUsername(
  tx: Prisma.TransactionClient,
  internshipRoleId: string
): Promise<string> {
  const role = await tx.internshipRole.update({
    where: { id: internshipRoleId },
    data: { usernameSeq: { increment: 1 } },
    select: { code: true, usernameSeq: true },
  });
  const padded = String(role.usernameSeq).padStart(4, '0');
  return `${env.identity.usernamePrefix}-${role.code}-${padded}`;
}

/** Compute the stored username prefix for an internship role code. */
export function usernamePrefixFor(code: string): string {
  return `${env.identity.usernamePrefix}-${code.toUpperCase()}`;
}
