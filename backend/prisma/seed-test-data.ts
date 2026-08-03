/**
 * TEST DATA SEED — for development only
 * Creates sample interns with XP, streaks, phases, and modules
 * so the intern panel shows real data while the team is developing.
 *
 * Run once on the shared Neon database:
 *   npm run db:seed-test
 *
 * Safe to run multiple times — uses upsert everywhere.
 * DO NOT run this in production.
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const TEST_INTERNS = [
  { fullName: 'Arjun Sharma',   scaleonId: 'SOINT260001', email: 'arjun@test.scaleon.io',   roleCode: 'AI',  xp: 340, streak: 7 },
  { fullName: 'Priya Verma',    scaleonId: 'SOINT260002', email: 'priya@test.scaleon.io',   roleCode: 'WEB', xp: 280, streak: 5 },
  { fullName: 'Rahul Gupta',    scaleonId: 'SOINT260003', email: 'rahul@test.scaleon.io',   roleCode: 'SMM', xp: 210, streak: 3 },
  { fullName: 'Sneha Patel',    scaleonId: 'SOINT260004', email: 'sneha@test.scaleon.io',   roleCode: 'AI',  xp: 180, streak: 4 },
  { fullName: 'Amit Kumar',     scaleonId: 'SOINT260005', email: 'amit@test.scaleon.io',    roleCode: 'BD',  xp: 150, streak: 2 },
  { fullName: 'Neha Singh',     scaleonId: 'SOINT260006', email: 'neha@test.scaleon.io',    roleCode: 'GD',  xp: 120, streak: 1 },
  { fullName: 'Vikram Rao',     scaleonId: 'SOINT260007', email: 'vikram@test.scaleon.io',  roleCode: 'WEB', xp: 90,  streak: 2 },
];

async function main() {
  console.log('🧪 Seeding test data...');

  // ── Get required references ──────────────────────────────────────────────
  const internRole = await prisma.role.findUnique({ where: { slug: 'intern' } });
  if (!internRole) throw new Error('Intern role not found. Run npm run db:seed first.');

  const batch = await prisma.batch.findFirst({ where: { status: 'ACTIVE' } });
  if (!batch) throw new Error('No active batch found. Run npm run db:seed first.');

  // ── Learning Phases & Modules ────────────────────────────────────────────
  console.log('  Creating learning phases and modules...');

  const phase1 = await prisma.learningPhase.upsert({
    where: { slug: 'phase-1' },
    create: { name: 'Phase 1 — Foundations', slug: 'phase-1', description: 'Core concepts and onboarding', order: 1, status: 'PUBLISHED' },
    update: { status: 'PUBLISHED' },
  });

  const phase2 = await prisma.learningPhase.upsert({
    where: { slug: 'phase-2' },
    create: { name: 'Phase 2 — Advanced Skills', slug: 'phase-2', description: 'Deep-dive into your specialisation', order: 2, status: 'PUBLISHED' },
    update: { status: 'PUBLISHED' },
  });

  const moduleDefs = [
    { phaseId: phase1.id, title: 'Welcome to ScaleOn', description: 'Introduction to the internship program and your team.', order: 1, points: 20, duration: 15, status: 'PUBLISHED' as const },
    { phaseId: phase1.id, title: 'Tools & Setup',       description: 'Set up all required tools and accounts.',             order: 2, points: 20, duration: 30, status: 'PUBLISHED' as const },
    { phaseId: phase1.id, title: 'Communication Basics', description: 'How we communicate, report, and collaborate.',        order: 3, points: 20, duration: 20, status: 'PUBLISHED' as const },
    { phaseId: phase2.id, title: 'Deep Dive — Week 1',  description: 'Advanced topic introduction for your role.',          order: 1, points: 30, duration: 45, status: 'PUBLISHED' as const },
    { phaseId: phase2.id, title: 'Project Kickoff',     description: 'Start your first real project.',                      order: 2, points: 30, duration: 60, status: 'PUBLISHED' as const },
  ];

  const modules: { id: string; points: number }[] = [];
  for (const mod of moduleDefs) {
    const existing = await prisma.learningModule.findFirst({
      where: { phaseId: mod.phaseId, title: mod.title },
    });
    if (existing) {
      modules.push({ id: existing.id, points: mod.points });
    } else {
      const created = await prisma.learningModule.create({ data: mod });
      modules.push({ id: created.id, points: mod.points });
    }
  }

  // ── Test Interns ─────────────────────────────────────────────────────────
  console.log('  Creating test interns...');

  for (const intern of TEST_INTERNS) {
    const internshipRole = await prisma.internshipRole.findUnique({ where: { code: intern.roleCode } });
    if (!internshipRole) { console.warn(`  ⚠ Role ${intern.roleCode} not found, skipping ${intern.fullName}`); continue; }

    const passwordHash = await hashPassword('Test@1234');

    // UserAccount
    const account = await prisma.userAccount.upsert({
      where: { email: intern.email },
      create: {
        email: intern.email,
        username: intern.scaleonId,
        passwordHash,
        userType: 'INTERN',
        status: 'ACTIVE',
        roleId: internRole.id,
        isFirstLogin: false,
        mustChangePassword: false,
        termsAcceptedAt: new Date(),
      },
      update: {},
    });

    // Intern record
    const internRecord = await prisma.intern.upsert({
      where: { scaleonId: intern.scaleonId },
      create: {
        userAccountId: account.id,
        scaleonId: intern.scaleonId,
        fullName: intern.fullName,
        internshipRoleId: internshipRole.id,
        batchId: batch.id,
        status: 'ACTIVE',
        overallProgress: Math.round((intern.xp / 340) * 100),
        attendancePercent: Math.floor(Math.random() * 20) + 80,
        currentPhase: 'Phase 1',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-30'),
      },
      update: { overallProgress: Math.round((intern.xp / 340) * 100) },
    });

    // InternProfile
    await prisma.internProfile.upsert({
      where: { internId: internRecord.id },
      create: {
        internId: internRecord.id,
        bio: `${intern.fullName} is a passionate intern at ScaleOn.`,
        college: 'Delhi Technical University',
        branch: 'Computer Science',
        semester: '5th',
        skills: ['Communication', 'Teamwork', intern.roleCode],
      },
      update: {},
    });

    // Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.internStreak.upsert({
      where: { internId: internRecord.id },
      create: {
        internId: internRecord.id,
        currentStreak: intern.streak,
        longestStreak: intern.streak + 2,
        lastActiveDate: today,
        totalXp: intern.xp,
        level: Math.floor(intern.xp / 100) + 1,
      },
      update: {
        currentStreak: intern.streak,
        totalXp: intern.xp,
        level: Math.floor(intern.xp / 100) + 1,
      },
    });

    // Daily activity — last 7 days
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const xpToday = d < intern.streak ? Math.floor(Math.random() * 30) + 10 : 0;
      if (xpToday > 0) {
        await prisma.dailyActivity.upsert({
          where: { internId_date: { internId: internRecord.id, date } },
          create: { internId: internRecord.id, date, xpEarned: xpToday, modules: 1 },
          update: { xpEarned: xpToday },
        });
      }
    }

    // Module progress — mark some modules completed based on XP
    const completedCount = Math.floor((intern.xp / 340) * modules.length);
    for (let m = 0; m < completedCount && m < modules.length; m++) {
      await prisma.moduleProgress.upsert({
        where: { internId_moduleId: { internId: internRecord.id, moduleId: modules[m].id } },
        create: {
          internId: internRecord.id,
          moduleId: modules[m].id,
          status: 'COMPLETED',
          startedAt: new Date('2026-01-20'),
          completedAt: new Date('2026-01-20'),
        },
        update: { status: 'COMPLETED' },
      });
    }

    console.log(`  ✅ ${intern.fullName} (${intern.scaleonId}) — ${intern.xp} XP, streak ${intern.streak}`);
  }

  // ── Live Session ─────────────────────────────────────────────────────────
  console.log('  Creating sample live session...');
  const existingSession = await prisma.liveSession.findFirst({ where: { title: 'Welcome & Orientation — Live Q&A' } });
  if (!existingSession) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    await prisma.liveSession.create({
      data: {
        title: 'Welcome & Orientation — Live Q&A',
        description: 'Meet your mentors, ask questions, and get started with the program.',
        hostName: 'Admin Team',
        meetingUrl: 'https://meet.google.com/placeholder',
        scheduledAt: tomorrow,
        duration: 60,
        status: 'SCHEDULED',
      },
    });
  }

  // ── Assignment ───────────────────────────────────────────────────────────
  console.log('  Creating sample assignment...');
  const existingAssignment = await prisma.assignment.findFirst({ where: { title: 'Introduction Post' } });
  if (!existingAssignment) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await prisma.assignment.create({
      data: {
        title: 'Introduction Post',
        description: 'Write a short introduction about yourself and your goals for this internship.',
        instructions: 'Min 150 words. Share your background, skills, and what you hope to learn.',
        dueDate,
        maxScore: 100,
      },
    });
  }

  console.log('\n✅ Test data seeded successfully!');
  console.log('\n📋 Test intern login credentials:');
  console.log('   Intern ID: SOINT260001 to SOINT260007');
  console.log('   Password:  Test@1234');
  console.log('   Login at:  http://localhost:3000/login');
}

main()
  .catch((e) => {
    console.error('❌ Test seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
