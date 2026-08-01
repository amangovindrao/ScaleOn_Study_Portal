# CHANGELOG

Chronological project changes. Detailed state and decisions remain in `PROJECT_MEMORY.md`.

## 2026-08-01 — Backend Recovery and Learning Integrity
- Fixed backend startup by registering TypeScript aliases for development and rewriting them during builds with pinned `tsc-alias@1.8.16`.
- Added and validated `20260801013000_align_learning_schema`; reconciled Prisma migration history with `scaleon_db` without resetting data.
- Made module completion idempotent, awarded configured XP, limited streak increments to once per calendar day, and updated overall progress/level.
- Required explicit `DATABASE_URL` configuration.
- Verified backend build, health, admin login, authenticated learning endpoint, frontend typecheck, and frontend production build.
- Updated architecture, database, API, runbook, and permanent project memory documentation.

## 2026-07-10 — Learning and Engagement Expansion
- Added learning phases/modules, assignments/submissions, streaks/daily activity, live sessions/attendance, support tickets/messages, and analytics schema/API foundations.
- Added intern pages for learning, leaderboard, live sessions, assignments, and support.
- Applied the expanded schema using `prisma db push --force-reset`; existing development interns were erased and standard seed data was restored.

## 2026-07-10 — UI, Onboarding, and Identity Updates
- Rebuilt the portal around a professional light-mode UI with animated dock navigation and display cards.
- Added intern dashboard, profile, security, and session pages.
- Changed intern identity to an admin-assigned Intern ID used for login; removed separate generated usernames from the product flow.
- Allowed any non-empty password and changed first login to new password → profile → agreements without asking for the temporary password again.
- Added direct backend API calls with credentialed CORS for localhost ports 3000 and 3001.

## 2026-07-06 — Admin Dashboard
- Added admin dashboard, intern list/detail and bulk creation, batch management, role/permission editor, and session management.

## 2026-07-02 — Backend Foundation
- Added Express/TypeScript, Prisma/PostgreSQL, authentication, sessions, RBAC, intern CRUD, profiles, auditing, rate limiting, and seed data.

## 2026-06-30 — Permanent Memory
- Established `PROJECT_MEMORY.md` as the mandatory project source of truth.
