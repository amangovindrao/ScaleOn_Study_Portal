# PROJECT MEMORY

> Single source of truth for the ScaleOn Internship Study Portal.
> Every AI agent MUST read this file completely before making changes, and MUST update it after completing work.
> Never remove existing information. Only update. Keep it chronological. Never lose project history.

---

# Project Overview

ScaleOn Internship Study Portal — a web application for managing internships at scale. Admins manage intern accounts, roles, batches, learning content, and certificates. Interns learn, track progress, complete assessments, and earn verifiable certificates.

**No public registration. Only admins can create intern accounts.**

---

# Current Development Stage

- Foundation: ✅ COMPLETE
- Authentication: ✅ COMPLETE
- User Management: ✅ COMPLETE
- Session Management: ✅ COMPLETE
- RBAC / Permissions: ✅ COMPLETE
- Intern CRUD: ✅ COMPLETE
- Profile Management: ✅ COMPLETE
- Admin Panel UI: ✅ COMPLETE (learning-management pages pending)
- Intern Dashboard UI: ✅ COMPLETE
- Learning System: 🟡 IN PROGRESS (intern APIs/pages complete; admin UI, validation, and granular permissions pending)
- Certificates: ⏳ NOT STARTED
- Notifications: ⏳ NOT STARTED
- Analytics: 🟡 IN PROGRESS (admin summary API complete; advanced/individual views pending)

Completed Percentage: ~75%

---

# Folder Structure

```
ScaleOn_Study_Portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                    # 16-table PostgreSQL schema
│   │   └── seed.ts                          # DB seeder (roles, permissions, admin, internship roles)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                       # Environment config
│   │   │   └── permissions.ts              # Permission catalog (seed source)
│   │   ├── lib/
│   │   │   └── prisma.ts                   # Prisma singleton client
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts           # authenticate(), requireUserType()
│   │   │   ├── csrf.middleware.ts           # Double-submit CSRF protection
│   │   │   ├── error.middleware.ts          # Global error handler
│   │   │   ├── permission.middleware.ts     # requirePermission(), requireAnyPermission()
│   │   │   ├── rateLimit.middleware.ts      # globalLimiter, authLimiter
│   │   │   └── validate.middleware.ts       # Zod schema validation
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts          # All auth business logic
│   │   │   │   ├── auth.controller.ts       # Auth HTTP handlers
│   │   │   │   ├── auth.routes.ts           # /auth/* routes
│   │   │   │   └── auth.validation.ts       # Zod schemas for auth
│   │   │   ├── interns/
│   │   │   │   ├── intern.service.ts        # Intern CRUD & management
│   │   │   │   ├── intern.controller.ts     # Intern HTTP handlers
│   │   │   │   ├── intern.routes.ts         # /interns/* routes
│   │   │   │   └── intern.validation.ts     # Zod schemas for interns
│   │   │   ├── sessions/
│   │   │   │   ├── session.controller.ts    # Session management handlers
│   │   │   │   └── session.routes.ts        # /sessions/* routes
│   │   │   ├── profile/
│   │   │   │   ├── profile.controller.ts    # Profile CRUD handlers
│   │   │   │   └── profile.routes.ts        # /profiles/* routes
│   │   │   ├── roles/
│   │   │   │   ├── role.controller.ts       # Roles, permissions, internship roles, batches
│   │   │   │   └── role.routes.ts           # /roles/* routes
│   │   │   └── catalog/
│   │   │       └── catalog.routes.ts        # /catalog/* (internship roles + batches)
│   │   ├── services/
│   │   │   ├── audit.service.ts             # logActivity(), logAudit()
│   │   │   ├── email.service.ts             # Email abstraction layer
│   │   │   ├── permission.service.ts        # getRolePermissions() with TTL cache
│   │   │   └── session.service.ts           # createSession(), rotateRefreshToken(), revokeSession()
│   │   ├── types/
│   │   │   └── express.d.ts                 # req.authUser declaration
│   │   ├── utils/
│   │   │   ├── apiError.ts                  # ApiError class
│   │   │   ├── apiResponse.ts               # sendSuccess(), buildPagination()
│   │   │   ├── asyncHandler.ts              # Async route wrapper
│   │   │   ├── cookies.ts                   # setAuthCookies(), clearAuthCookies()
│   │   │   ├── crypto.ts                    # generateRawToken(), sha256(), safeEqual()
│   │   │   ├── identity.ts                  # nextScaleonId(), nextUsername()
│   │   │   ├── jwt.ts                       # signAccessToken(), verifyAccessToken(), etc.
│   │   │   ├── password.ts                  # generateStrongPassword(), hashPassword(), verifyPassword()
│   │   │   └── requestInfo.ts               # getClientInfo() (IP, UA, browser, OS, device)
│   │   └── server.ts                        # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── lib/
│   │   │   └── api.ts                       # Typed API client (fetch + CSRF + cookies)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Intern login page
│   │   │   ├── forgot-password/page.tsx    # Forgot password page
│   │   │   └── reset-password/page.tsx     # Reset password page
│   │   ├── admin/
│   │   │   └── page.tsx                    # Admin login (hidden, /admin)
│   │   ├── onboarding/
│   │   │   └── page.tsx                    # First-login onboarding (3 steps)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
├── PROJECT_MEMORY.md         # ← YOU ARE HERE
├── ARCHITECTURE.md           # System architecture
├── DATABASE.md               # Database schema documentation
├── API_DOCUMENTATION.md      # REST API reference
└── CHANGELOG.md              # All changes, chronological
```

---

# Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Backend**: Node.js 22, Express.js, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (access 15min + refresh 7d/30d), bcrypt
- **Security**: Helmet, HPP, CORS, rate limiting, brute force protection
- **Storage**: TBD (future: S3/Cloudinary for files)
- **Email**: Architecture ready (console provider in dev, SMTP/API later)
- **State Management**: React Context + hooks
- **UI Libraries**: Framer Motion (animations), Lucide React (icons), clsx + tailwind-merge (cn utility)
- **Deployment**: TBD

---

# Features Completed

### Authentication
- Admin login: email/password
- Intern login: Intern ID or email + password
- JWT access tokens (15 min, httpOnly cookie)
- Rotating refresh tokens (7d / 30d remember-me, httpOnly cookie)
- CSRF disabled in development (enabled in production)
- First-login onboarding flow (set new password → fill profile → accept agreement)
- No current password required on first login (only new password)
- No password complexity requirements (any password accepted)
- Forgot password / password reset (email link, 15 min expiry)
- Change password (authenticated, revokes other sessions)
- Admin can reset any intern's password
- Brute force protection (5 failures → 15 min lock)
- Rate limiting (auth: 20/15min, global: 300/15min)

### Session Management
- Full session tracking (IP, browser, OS, device, country, city)
- Admin can terminate any session
- Admin can terminate all sessions for a user
- Complete login history (success + failure with reason and device info)
- Self-view sessions and own login history

### User Management
- Intern creation with admin-assigned Intern ID; the compatibility `username` field stores the same Intern ID
- Credential email sent on account creation
- Full intern CRUD (create, list, get, update, delete)
- Intern search: name, email, scaleonId, username, phone
- Intern filters: role, batch, status, mentor, date
- Suspend / activate intern accounts
- Transfer intern to different role / batch
- Extend internship end date
- Soft delete (preserves audit trail)
- Profile management (intern self-edit + admin edit)

### RBAC
- Database-driven permissions (no hardcoded checks)
- System roles: Super Admin (level 100), Admin (level 80), Mentor (level 50), Intern (level 10)
- Permission groups: intern.*, admin.*, role.*, batch.*, profile.*, session.*, settings.*, system.*
- Role hierarchy for display/guard purposes
- Admin can update role permissions dynamically
- 60-second TTL cache for permission lookups

### Catalog
- Internship roles (AI, SMM, BD, SALES, WEB, GD, CW, HR — extensible)
- Batch management (UPCOMING → ACTIVE → COMPLETED → ARCHIVED)
- Username prefix per internship role (SO-AI-XXXX, SO-SMM-XXXX, etc.)

### Logging
- Activity log (every user action)
- Audit log (admin mutations, before/after state)
- Login history (every attempt, device + location info)

---

# Features In Progress

- Admin learning management UI (phases/modules, assignments, live sessions, support, analytics)
- Request validation and granular permission enforcement for learning admin routes
- Advanced platform and individual-intern analytics
- Final deliberate light-mode contrast cleanup on legacy admin/intern pages

---

# Pending Features

- Certificate generation + QR verification
- Notifications (in-app delivery + email templates)
- File uploads (profile photos, resumes, submissions)
- Real email provider integration (SMTP / Resend / SendGrid)
- Automated tests for learning XP, streaks, submissions, tickets, and analytics

---

# Internship Roles

| Name | Code |
|------|------|
| Artificial Intelligence | AI |
| Social Media Marketing | SMM |
| Business Development | BD |
| Sales | SALES |
| Web Development | WEB |
| Graphic Design | GD |
| Content Writing | CW |
| Human Resources | HR |

**Intern ID format**: Admin enters manually (e.g. SOINT260001, SO1411, etc.)
**Login**: Intern ID or email + password

All managed in `InternshipRole` table. New roles can be added via `/catalog/internship-roles`.

---

# Database

29 tables. Schema: `backend/prisma/schema.prisma`. Full docs: `DATABASE.md`.

**Tables:**
- `Role` — system roles with hierarchy
- `Permission` — granular permission keys
- `RolePermission` — junction: role ↔ permission
- `UserAccount` — central authentication identity (all users)
- `Admin` — admin domain data (1:1 UserAccount)
- `Intern` — intern domain data (1:1 UserAccount)
- `InternProfile` — extended profile (1:1 Intern)
- `InternshipRole` — roles available (AI, SMM, etc.)
- `Batch` — intern cohorts
- `InternshipEnrollment` — enrollment history (role transfers tracked)
- `Session` — login sessions
- `RefreshToken` — rotating refresh tokens (hashed)
- `PasswordResetToken` — short-lived reset tokens (hashed)
- `LoginHistory` — every auth attempt
- `ActivityLog` — user action log
- `AuditLog` — admin mutations (before/after)
- `Notification` — in-app notifications
- `Setting` — key-value config store
- `LearningPhase` — ordered, publishable learning phases
- `LearningModule` — phase content with configured XP rewards
- `ModuleProgress` — per-intern completion, score, and time
- `Assignment` / `AssignmentSubmission` — assignment delivery and intern work
- `InternStreak` / `DailyActivity` — streak, XP, level, and daily aggregates
- `LiveSession` / `LiveSessionAttendee` — scheduled sessions and attendance
- `SupportTicket` / `TicketMessage` — intern help requests and conversations

**Indexes:** All FK columns + status fields + frequently-queried columns.
**Soft deletes:** UserAccount.status = DELETED

---

# API Routes

See `API_DOCUMENTATION.md` for full reference.

**Base:** `http://localhost:4000/api/v1`

| Module | Prefix |
|--------|--------|
| Auth | `/auth` |
| Interns | `/interns` |
| Sessions | `/sessions` |
| Profiles | `/profiles` |
| Roles | `/roles` |
| Catalog | `/catalog` |
| Learning | `/learning` |
| Health | `/health` |

**Total endpoints:** 50+

---

# Components

- `frontend/app/lib/api.ts` — Typed API client (fetch + cookies)
- `frontend/app/lib/auth-context.tsx` — AuthProvider + useAuth hook
- `frontend/app/lib/hooks.ts` — useFetch generic hook
- `frontend/app/lib/utils.ts` — cn() utility (clsx + tailwind-merge)
- `frontend/app/components/ui/navbar.tsx` — Animated dock navigation (Framer Motion + Lucide icons)
- `frontend/app/components/ui/display-cards.tsx` — 5 stacked animated feature cards
- `frontend/app/components/ui/badge.tsx` — Status badges
- `frontend/app/components/ui/modal.tsx` — Dialog modal
- `frontend/app/components/ui/input.tsx` — Form input, select, textarea, FormField
- `frontend/app/components/ui/spinner.tsx` — Loading spinner
- Frontend API behavior: `frontend/app/lib/api.ts` calls `http://localhost:4000/api/v1` directly with credentials; no Next.js catch-all proxy is present

---

# Pages

**Completed:**
- `/login` — Intern login with display cards, animations, decorative blobs
- `/admin` — Admin login (clean, minimal)
- `/forgot-password` — Forgot password form
- `/reset-password` — Reset password form
- `/onboarding` — 3-step first-login wizard (new password → profile → agreement)
- `/admin/dashboard` — Stats, recent interns, quick actions
- `/admin/interns` — Paginated table, search, filters, create (single + bulk), suspend/activate
- `/admin/interns/[id]` — Intern detail with tabs (overview, profile, enrollments), reset password
- `/admin/batches` — Batch management (create, list)
- `/admin/roles` — Roles list + permission editor
- `/admin/sessions` — Session management with terminate
- `/intern/dashboard` — Welcome, progress, stats, quick actions, tips
- `/intern/profile` — Edit profile form + change password
- `/intern/sessions` — Login activity & active sessions
- `/intern/learning` — Published Phase 1/Phase 2 modules and completion
- `/intern/leaderboard` — XP leaderboard
- `/intern/live` — Scheduled and live sessions
- `/intern/assignments` — Assignment list and submissions
- `/intern/support` — Support ticket creation and history

**Pending:**
- `/admin/settings`
- Admin pages for learning content, assignments, live sessions, support, and analytics
- `/intern/certificates`

---

# UI Design System

- **Mode**: Light mode (white/slate backgrounds)
- **Background**: `bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30`
- **Cards**: White bg, `border-slate-200/80`, `rounded-2xl/3xl`, `shadow-sm` to `shadow-xl`
- **Text**: `slate-900` headings, `slate-800` labels, `slate-500` body, `slate-400` muted
- **Accent**: Blue-600 (`#2563eb`) — buttons, links, active states
- **Inputs**: `bg-slate-50/80 border-slate-200 rounded-xl`, blue focus ring
- **Buttons**: `bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/25`
- **Navigation**: Animated dock nav (Framer Motion) — floating pill with blue lamp indicator
- **Animations**: Framer Motion — stagger fade/slide on cards, hover scale on buttons
- **Icons**: Lucide React (LayoutDashboard, Users, Shield, etc.)
- **Display Cards**: 5 stacked skewed cards with hover lift, stagger animation
- **Decorative**: Gradient blobs (blue/indigo) for depth on auth pages
- **Font**: System font stack (-apple-system, Inter, Segoe UI, Roboto)
- **SEO**: Title, description, keywords, OpenGraph, robots meta tags

---

# Authentication

**Admin flow:**
1. Navigate to `/admin`
2. Login with email + password
3. JWT + refresh token set as httpOnly cookies
4. Redirected to `/admin/dashboard`

**Intern flow:**
1. Navigate to `/login`
2. Login with Intern ID (e.g. SOINT260001) or email + password
3. JWT + refresh token set as httpOnly cookies
4. On `isFirstLogin=true` → redirect to `/onboarding` (3-step wizard)
5. After completion → `/intern/dashboard`

**First Login Onboarding (3 steps):**
1. Set new password (no current password required, no complexity rules)
2. Fill profile (phone, college, branch, semester, LinkedIn, GitHub — all optional)
3. Accept Internship Agreement & Privacy Policy

**Tokens:**
- Access: 15 min, httpOnly cookie
- Refresh: 7d (30d with remember-me), httpOnly cookie, SHA-256 hashed in DB
- CSRF: Disabled in development, enabled in production
- API transport: Browser calls backend port 4000 directly with `credentials: include`; backend CORS allows localhost ports 3000 and 3001

---

# Admin Features

**Completed:**
- Create intern accounts with auto-generated credentials
- View, search, filter interns
- Update intern details
- Suspend / activate intern accounts
- Transfer intern roles/batches
- Extend internship periods
- Reset intern passwords
- Terminate any session
- View login history for any user
- Manage internship roles (catalog)
- Manage batches
- View and assign role permissions

**Pending:**
- Analytics dashboard
- Content management
- Certificate issuance
- Announcement/notifications

---

# Intern Features

**Completed:**
- Login with Intern ID or email + password
- First-login onboarding wizard (3 steps: password → profile → agreement)
- Intern dashboard (progress, stats, quick actions, tips)
- View/edit own profile (phone, college, branch, links, skills, bio)
- View own sessions & login history
- Change password (from profile page, requires current password)

**Pending:**
- Learning modules
- Progress tracking (auto-update by mentors)
- Certificate download

---

# Certificates

Not implemented. Planned for a future prompt.

---

# Notifications

Architecture ready (`Notification` table, `email.service.ts` abstraction). Templates and delivery not yet implemented.

---

# Known Issues

- Google OAuth removed (not needed for current scope)
- Email provider uses console log (no real delivery) — SMTP/API integration pending
- No file upload system yet (profile photos stored as URL strings only)
- Password has no complexity requirements (intentional per client request)
- CSRF disabled in development mode; production keeps CSRF middleware enabled
- Frontend uses direct cross-origin API calls to backend port 4000; CORS permits localhost 3000/3001
- **Security debt**: `/auth/first-login/complete` can fall back to a body `userAccountId` without authenticated middleware. Replace this with a signed, short-lived onboarding token or restore authenticated-session enforcement before production.
- Learning admin routes currently check only `ADMIN` user type; granular permissions and Zod validation remain pending
- A local empty PostgreSQL database named `scaleon_migration_shadow` was created on 2026-08-01 for migration-chain validation and intentionally not deleted without approval

---

# Decisions Made

- **2026-06-30**: Established PROJECT_MEMORY.md as permanent project memory. WHY: enforce mandatory memory protocol.
- **2026-07-02**: Chose Next.js (App Router) for frontend. WHY: server components, built-in routing, API routes for proxy.
- **2026-07-02**: Chose Express.js for backend. WHY: mature ecosystem, stable.
- **2026-07-02**: Credentials stored in `UserAccount`, domain data in `Admin`/`Intern` separate tables. WHY: clean separation.
- **2026-07-02**: Refresh tokens stored as SHA-256 hash only. WHY: if DB is compromised, tokens can't be used.
- **2026-07-02**: No public registration. WHY: Requirement — only admins create intern accounts.
- **2026-07-02**: Permissions fully database-driven with 60s TTL cache. WHY: live permission changes without deploys.
- **2026-07-10**: Admin enters Intern ID manually (no auto-generation). WHY: Client requirement — admin controls ID format.
- **2026-07-10**: Removed all password complexity requirements. WHY: Client request — any password accepted.
- **2026-07-10**: First login does NOT ask current password. WHY: Simpler UX — intern just sets new password.
- **2026-07-10**: Next.js API proxy (`/app/api/[...path]`). WHY: Same-origin cookies avoid cross-origin cookie issues in browsers.
- **2026-07-10**: Switched to light mode. WHY: Better visibility, more professional, client feedback.
- **2026-07-10**: Added Framer Motion + dock nav. WHY: Polish, consistent animation, modern feel.
- **2026-08-01**: Superseded the Next.js catch-all proxy with direct credentialed backend calls. WHY: Catch-all proxy routes returned 404 under the active Next.js/Turbopack setup; backend CORS now permits localhost 3000/3001.
- **2026-08-01**: Added pinned `tsc-alias@1.8.16` and runtime `tsconfig-paths` registration. WHY: TypeScript path aliases otherwise crashed Node at startup and remained unresolved in compiled output.
- **2026-08-01**: Reconciled migration history using a corrective third migration and `migrate resolve`. WHY: The live schema came from `db push` and matched Prisma, while committed migrations were unrecorded and the old learning prototype differed from the current schema.

---

# Changelog

## 2026-07-10 — Prompt 5: UI Overhaul + Intern Panel + Bug Fixes
- Summary: Complete UI rebuild to light mode, added dock navigation (Framer Motion), display cards, intern panel (dashboard, profile, sessions), fixed auth cookie issues, removed password complexity, admin enters Intern ID manually, bulk intern creation, SEO meta tags.
- Files Created/Modified: All frontend files rebuilt, API proxy added, auth.service.ts updated, intern.service.ts updated (manual ID), auth.validation.ts (no password rules), server.ts (CSRF disabled in dev, trust proxy)
- New Features: Dock navigation, animated display cards, intern dashboard with progress/stats, intern profile editor + password change, intern sessions page, bulk intern creation with ID field, SEO metadata
- Breaking Changes: Intern ID now entered by admin (no auto-generation), password has no min length
- Database Changes: none
- API Changes: `/auth/first-login/complete` no longer requires auth middleware or currentPassword field; accepts `userAccountId` in body as fallback; `POST /interns` now requires `internId` field

## 2026-07-06 — Prompt 4: Admin Dashboard UI + Frontend Running
- Summary: Built complete Admin Dashboard UI (layout, sidebar, dashboard, interns, batches, roles, sessions), auth context, shared UI components. Frontend running on http://localhost:3000.
- Files Created: AdminShell, dashboard, interns list/detail, batches, roles, sessions pages + badge/spinner/modal/input components + auth-context + hooks + next.config fix
- New Features: Admin sidebar nav, stats cards, intern table with search/filter/pagination, create intern modal with credential display, intern detail page with tabs, batch management, role/permission editor, session management with terminate
- Breaking Changes: none
- Database Changes: none
- API Changes: none

## 2026-07-02 — Prompt 2
- Summary: Scaffolded full backend foundation (Prisma schema, middleware, utilities, services, validation) and Next.js frontend.
- Files Modified: All files listed in backend foundation section
- New Features: Project structure, DB schema design, all utility layers
- Breaking Changes: none

## 2026-06-30 — Prompt 1
- Summary: Initialized PROJECT_MEMORY.md with full required structure.
- Files Modified: PROJECT_MEMORY.md (new)

---

## 2026-08-01 — Backend Recovery, Migration Repair, and Learning Integrity
- Summary: Fixed the backend startup crash by registering TypeScript path aliases in development and rewriting aliases in compiled output with pinned `tsc-alias@1.8.16`.
- Runtime validation: Backend build passed; `/health`, admin login, and authenticated `/api/v1/learning/phases` all passed (2 phases returned).
- Migration repair: Added `20260801013000_align_learning_schema`, validated the full three-migration chain against an isolated empty shadow database, verified zero live-schema drift, and non-destructively marked all migrations applied in `scaleon_db`.
- Learning integrity: Module completion is now idempotent, uses configured module points, increments streak at most once per calendar day, updates level and overall progress, and does not award duplicate XP.
- Configuration: `DATABASE_URL` is now required; no silent fallback to the obsolete `scaleon_portal` database.
- Documentation: Updated run steps, architecture, database table catalog, learning API reference, and permanent memory. Recreated the missing root `CHANGELOG.md` from retained project history.
- Validation: Backend Prisma validation/migration status/build passed; frontend TypeScript check and Next.js production build passed.
- Local environment note: Created empty `scaleon_migration_shadow` solely for migration validation; it remains present because database deletion requires explicit approval.

---

# Next Recommended Task

**Secure and complete Learning Administration**

1. Replace the unauthenticated first-login `userAccountId` fallback with a signed short-lived onboarding token.
2. Add Zod validation and granular permission middleware to all learning admin endpoints.
3. Build admin pages for phases/modules, assignments, live sessions, support tickets, and analytics.
4. Complete advanced platform and individual-intern analytics.
5. Finish deliberate light-mode contrast cleanup on remaining legacy pages.
6. Add targeted tests for module completion/XP/streak idempotency, submissions, tickets, and analytics.
