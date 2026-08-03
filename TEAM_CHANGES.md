# 📋 TEAM_CHANGES.md

> **Purpose:** A running log of all significant changes made during development.
> Teammates should read this before pulling and running the project to understand what changed, what needs to be updated, and what manual steps are required.
>
> **Format:** Newest changes are at the top. Each entry is dated and tagged.

---

## [2026-08-04] — Added "My Certifications" Section & Automated Issue System

### 🔎 What Was Changed
Added an automated **"My Certifications"** section to the intern Profile page. Interns can view, preview modal certificates, download PDF placeholders, and share certificates earned automatically upon course phase completion.

### 📝 Files Modified

#### Frontend
| File | Change |
|---|---|
| [`frontend/app/intern/profile/page.tsx`](./frontend/app/intern/profile/page.tsx) | Added "My Certifications" card section, CertificateCard component with ScaleOn logo preview modal, download PDF, share actions, and friendly empty state |

#### Backend
| File | Change |
|---|---|
| [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma) | Added `Certificate` model with relations to `Intern` and `LearningPhase` |
| [`backend/src/modules/learning/learning.controller.ts`](./backend/src/modules/learning/learning.controller.ts) | Added auto-generation logic inside `completeModule` when all published modules in a phase are complete; added `getMyCertificates` handler |
| [`backend/src/modules/learning/learning.routes.ts`](./backend/src/modules/learning/learning.routes.ts) | Added `GET /api/v1/learning/certificates` endpoint |

### 👥 What Teammates Need to Update
- Run `npx prisma generate` in `backend/` if pulling schema changes.
- Sync database with `npx prisma db push` or migrations.

---

## [2026-08-04] — Profile Page UI Revision (Simplified 3-Card Layout)

### 🔎 What Was Changed
Revised the intern profile page UI to be simpler, more focused, and internship-specific. The previous redesign added many extra sections (AI Projects, Achievements, Coding Profiles, Interested Domains, etc.). This revision strips it back to exactly what interns need: personal info, academic info, and internship details.

**This change is frontend-only. No backend, API, or database changes were made.**

### 📝 Files Modified

| File | Change |
|---|---|
| `frontend/app/intern/profile/page.tsx` | **Full rewrite** — simplified to 3 cards, added toast notifications, profile picture avatar, icons in LinkedIn/GitHub inputs, 250-char About Me counter, phone/URL validation |

### 🗂️ New Page Structure
| Card | Fields |
|---|---|
| **Personal Information** | Profile photo (avatar), Full Name (read-only), Email (read-only, with icon), Phone Number (with validation) |
| **Academic Information** | College, Degree/Branch, Graduation Year |
| **Internship Information** | Intern ID (read-only), Role (read-only), Batch (read-only), Skills (chip tags), LinkedIn (with icon + validation), GitHub (with icon + validation), About Me (250 chars max with counter) |

### ✅ UI Features Added
- **Toast notifications** — bottom-right animated toast on save success or error (auto-dismisses in 4s)
- **Skill chips** — add with `Enter`/`,`, remove with `×` button or `Backspace`, no comma-separated text input
- **Icons inside inputs** — LinkedIn (blue), GitHub (dark), Mail, Phone icons inside input fields
- **Phone validation** — checks for valid phone format
- **LinkedIn validation** — must match `linkedin.com/in/...` pattern
- **GitHub validation** — must match `github.com/...` pattern
- **About Me counter** — live `{n} / 250` character counter, turns amber at 230
- **Sticky save button** — full-width fixed bar on mobile; inline button with icon on desktop
- **Password visibility toggles** — show/hide each password field individually

### ❌ Fields Removed from UI
The following fields were removed from the profile form UI (they still exist in the database and backend):
- Semester
- Portfolio / Website
- University (merged into College field)
- Specialization
- Current Role
- Interested Domains
- Coding Profiles (LeetCode, etc.)
- AI Projects
- Achievements
- Profile Completion bar

> These fields still exist in the `InternProfile` table (from the previous migration). They are simply not shown in the UI. Data previously saved in these fields is preserved.

### 👥 What Teammates Need to Update
- **Nothing** — frontend-only change. Pull and refresh your browser.
- If you are building the **admin intern detail view**, note that the UI-removed fields still exist in the DB and are returned by `GET /api/v1/profiles/:internId`. You can still display them on the admin side.

### ⚠️ Breaking Changes
None.

### 🌐 API Changes
None. The `PATCH /api/v1/profiles/me` and `GET /api/v1/profiles/me` endpoints are unchanged.

### 🔐 Environment Variables
None.

---

## [2026-08-03] — Profile Page Redesign + Database Schema Extension

### 🔎 What Was Changed
A complete redesign of the intern profile page with new UI sections and extended backend data model to support richer profile information useful for a recruiter-facing intern portal.

### 📝 Files Modified

#### Frontend
| File | Change |
|---|---|
| `frontend/app/intern/profile/page.tsx` | **Full rewrite** — 9 new sections, skill chips, domain multi-select, coding profiles, completion bar, sticky save button, password visibility toggles |

#### Backend
| File | Change |
|---|---|
| `backend/src/modules/profile/profile.controller.ts` | Extended `updateProfileSchema` Zod object to accept 6 new fields: `specialization`, `currentRole`, `interestedDomains`, `codingProfiles`, `aiProjects`, `achievements` |
| `backend/prisma/schema.prisma` | Added 6 new columns to `InternProfile` model (see Database Changes below) |
| `backend/prisma/migrations/20260803182244_add_extended_profile_fields/migration.sql` | **New migration file** — adds columns to `InternProfile` table |

---

### 👥 What Teammates Need to Update

#### All teammates — **Run migration first before starting backend**
```bash
cd backend
npx prisma migrate deploy   # applies the new migration
npx prisma generate         # regenerates Prisma Client
```

#### Backend teammates
- If you are adding/modifying the **admin intern detail view**, the `InternProfile` object now has 6 additional fields. Update your admin panel read views accordingly:
  - `specialization` (String)
  - `currentRole` (String)
  - `interestedDomains` (String[])
  - `codingProfiles` (Json: `{ leetcode, codeforces, hackerrank, codechef }`)
  - `aiProjects` (String — freeform text)
  - `achievements` (String — freeform text)
- The `getProfileByInternId` admin endpoint already returns the full `InternProfile` and will now include the new fields automatically.
- The `updateProfileByInternId` admin endpoint also uses the same `updateProfileSchema`, so it accepts the new fields too.

#### Frontend teammates
- If you are building the **admin intern detail page** (`/admin/interns/[id]`), update it to display the new profile fields.
- The `AuthUser.intern.profile` type in `frontend/app/lib/auth-context.tsx` is typed as `Record<string, unknown> | null`. If you need strongly typed access to profile fields anywhere, consider extending this interface.

---

### 🗄️ Database Changes

**Migration:** `20260803182244_add_extended_profile_fields`

**Table:** `InternProfile`

| Column | Type | Default | Notes |
|---|---|---|---|
| `specialization` | `TEXT` | `NULL` | e.g., "Machine Learning" |
| `currentRole` | `TEXT` | `NULL` | e.g., "AI Intern at ScaleOn" |
| `interestedDomains` | `TEXT[]` | `{}` | Array of domain strings |
| `codingProfiles` | `JSONB` | `NULL` | `{ leetcode, codeforces, hackerrank, codechef }` |
| `aiProjects` | `TEXT` | `NULL` | Freeform markdown-style text |
| `achievements` | `TEXT` | `NULL` | Freeform text |

**SQL (for reference):**
```sql
ALTER TABLE "InternProfile"
  ADD COLUMN "achievements" TEXT,
  ADD COLUMN "aiProjects" TEXT,
  ADD COLUMN "codingProfiles" JSONB,
  ADD COLUMN "currentRole" TEXT,
  ADD COLUMN "interestedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "specialization" TEXT;
```

> ✅ This migration is **non-destructive** (additive only). Existing rows are unaffected.

---

### ⚙️ New Dependencies
None. All new UI components (skill chips, multi-select dropdown) are built with vanilla React + Lucide icons already in the project.

### 🌐 API Changes
- `PATCH /api/v1/profiles/me` — now accepts the 6 new fields in the request body (all optional, fully backward compatible)
- `GET /api/v1/profiles/me` — response now includes the 6 new fields (null by default for existing profiles)

### 🔐 Environment Variables
No new environment variables required.

### ⚠️ Breaking Changes
None. All changes are strictly additive and backward compatible.

### 🧑‍💻 Manual Setup / Migration Steps
```bash
# Required for every teammate after pulling this change:
cd backend
npx prisma migrate deploy   # or: npx prisma migrate dev (if on dev branch)
npx prisma generate
npm run dev

cd ../frontend
npm run dev
```

---

## [2026-08-03] — Prisma Connection Pool Fix + Graceful Shutdown

### 🔎 What Was Changed
Fixed a Prisma connection pool timeout error (`Timed out fetching a new connection from the connection pool`) that occurred when logging in. The root cause was orphaned Node processes from hot-reloads not releasing database connections, and Proton Drive's `ProTUN` virtual network adapter intercepting SSL connections on one developer machine.

### 📝 Files Modified

| File | Change |
|---|---|
| `backend/.env` | Ensured `connect_timeout=30` is set in `DATABASE_URL` (no extra params that interfere with PgBouncer) |
| `backend/src/server.ts` | Added `SIGINT` and `SIGUSR2` signal handlers so Prisma properly disconnects when ts-node-dev hot-reloads or the server is stopped with Ctrl+C |

### 📋 Details of `server.ts` Change
```typescript
// Before: only handled SIGTERM
process.on('SIGTERM', () => { ... });

// After: shared shutdown handler covers all signals
const shutdown = () => { server.close(() => { prisma.$disconnect(); }); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);   // ← new: Ctrl+C
process.on('SIGUSR2', shutdown);  // ← new: ts-node-dev restart signal
```

### 👥 What Teammates Need to Update
- **Nothing** — pull the changes and restart your backend. The fix is transparent.
- If you are on a machine with **ProtonDrive / ProtonMail / ProtonVPN** installed, the `ProTUN` virtual network adapter will intercept database SSL connections and cause `ECONNRESET` errors. Disconnect or uninstall Proton when running the backend locally, or configure split tunneling to exclude port 5432.

### ⚠️ Breaking Changes
None.

---

## [2026-08-03] — Repository Initialization

### 🔎 What Was Changed
- Initialized a git repository in the project root (`git init`)
- Added remote `origin` pointing to `https://github.com/amangovindrao/ScaleOn_Study_Portal`
- Force-checked out `main` branch from remote (overwrote local files with repo versions)

### 📝 Files Modified
All files — initial pull from the repository.

### ⚙️ Manual Setup Steps (for new developers)
```bash
# 1. Clone the repository
git clone https://github.com/amangovindrao/ScaleOn_Study_Portal.git
cd ScaleOn_Study_Portal

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your DATABASE_URL and DIRECT_URL from Neon Console

# 4. Run Prisma migrations and seed
cd backend
npx prisma migrate deploy
npx prisma generate
npm run db:seed              # creates super admin + default roles/batches
npm run db:seed-test         # (optional) adds test intern accounts

# 5. Start servers
npm run dev                  # in backend/
cd ../frontend && npm run dev
```

### 🔐 Environment Variables Required
```env
# backend/.env
DATABASE_URL=postgresql://...@ep-xxx-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30
DIRECT_URL=postgresql://...@ep-xxx.region.neon.tech/neondb?sslmode=require&connect_timeout=30
JWT_ACCESS_SECRET=<random secret>
JWT_REFRESH_SECRET=<random secret>
CSRF_SECRET=<random secret>
```
See `backend/.env.example` for the full list.

### 🔑 Default Credentials (Development Only)
| Role | Identifier | Password |
|---|---|---|
| Super Admin | `admin@scaleon.io` | `Admin@ScaleOn2026!` |
| Test Intern | `SOINT260001` – `SOINT260007` | `Test@1234` |

> ⚠️ **Change these in production!**

---

*Last updated: 2026-08-03 by Antigravity (AI Coding Assistant)*
*For questions about any change, check the relevant file's git history or ask the developer who made the change.*
