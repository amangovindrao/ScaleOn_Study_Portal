/**
 * Prisma Database Seed
 * Populates:
 *   - System roles (Super Admin, Admin, Mentor, Intern)
 *   - All permissions from the canonical catalog
 *   - Default role → permission mappings
 *   - A Super Admin account (credentials from env or defaults)
 *   - Default internship roles (AI, SMM, BD, SALES)
 *   - A default batch
 */

import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLE_DEFS, DEFAULT_ROLE_PERMISSIONS } from '../src/config/permissions';
import { hashPassword } from '../src/utils/password';
import { usernamePrefixFor } from '../src/utils/identity';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Permissions ──────────────────────────────────────────────────────────
  console.log('  Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      create: perm,
      update: { name: perm.name, group: perm.group, description: perm.description },
    });
  }
  const allPermissions = await prisma.permission.findMany({ select: { id: true, key: true } });
  const permMap = Object.fromEntries(allPermissions.map((p) => [p.key, p.id]));

  // ── System roles ─────────────────────────────────────────────────────────
  console.log('  Creating system roles...');
  const roleIds: Record<string, string> = {};
  for (const roleDef of ROLE_DEFS) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      create: { ...roleDef, status: 'ACTIVE' },
      update: { name: roleDef.name, description: roleDef.description, level: roleDef.level },
    });
    roleIds[roleDef.slug] = role.id;
  }

  // ── Role → Permission assignments ─────────────────────────────────────────
  console.log('  Assigning permissions to roles...');
  for (const [slug, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const roleId = roleIds[slug];
    if (!roleId) continue;

    const assignKeys = perms === '*' ? Object.keys(permMap) : perms;
    for (const key of assignKeys) {
      const permissionId = permMap[key];
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        create: { roleId, permissionId },
        update: {},
      });
    }
  }

  // ── Default Super Admin account ───────────────────────────────────────────
  console.log('  Creating Super Admin account...');
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@scaleon.io';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@ScaleOn2026!';
  const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const existingAdmin = await prisma.userAccount.findFirst({
    where: { email: { equals: adminEmail, mode: 'insensitive' } },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    const adminRoleId = roleIds['super_admin'];

    const adminAccount = await prisma.userAccount.create({
      data: {
        email: adminEmail,
        passwordHash,
        userType: 'ADMIN',
        status: 'ACTIVE',
        roleId: adminRoleId,
        isFirstLogin: false,
        mustChangePassword: false,
        termsAcceptedAt: new Date(),
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.admin.create({
      data: {
        userAccountId: adminAccount.id,
        fullName: adminName,
        designation: 'Platform Administrator',
      },
    });

    console.log(`  ✅ Super Admin created: ${adminEmail}`);
    console.log(`     Password: ${adminPassword} (CHANGE THIS IN PRODUCTION!)`);
  } else {
    console.log(`  ⏭  Super Admin already exists: ${adminEmail}`);
  }

  // ── Default internship roles ──────────────────────────────────────────────
  console.log('  Creating default internship roles...');
  const defaultInternshipRoles = [
    { name: 'Artificial Intelligence', code: 'AI', description: 'AI/ML internship' },
    { name: 'Social Media Marketing', code: 'SMM', description: 'Social media and marketing internship' },
    { name: 'Business Development', code: 'BD', description: 'Business development and sales internship' },
    { name: 'Sales', code: 'SALES', description: 'Sales internship' },
    { name: 'Web Development', code: 'WEB', description: 'Web development internship' },
    { name: 'Graphic Design', code: 'GD', description: 'Graphic design internship' },
    { name: 'Content Writing', code: 'CW', description: 'Content writing internship' },
    { name: 'Human Resources', code: 'HR', description: 'Human resources internship' },
  ];

  for (const role of defaultInternshipRoles) {
    await prisma.internshipRole.upsert({
      where: { code: role.code },
      create: {
        ...role,
        usernamePrefix: usernamePrefixFor(role.code),
        status: 'ACTIVE',
        usernameSeq: 0,
      },
      update: { name: role.name, description: role.description },
    });
  }

  // ── Default batch ─────────────────────────────────────────────────────────
  console.log('  Creating default batch...');
  await prisma.batch.upsert({
    where: { code: 'B2601' },
    create: {
      name: 'Batch 2026 - Jan',
      code: 'B2601',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30'),
      status: 'ACTIVE',
    },
    update: {},
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
