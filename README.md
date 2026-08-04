# ScaleOn Study Portal

A full-stack internship management and learning portal.
Admins manage intern accounts, batches, roles, and learning content.
Interns track progress, complete modules, submit assignments, and earn XP.

**No public registration — only admins can create intern accounts.**

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js 22, Express.js, TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Auth | JWT (access + refresh tokens, httpOnly cookies) |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Features

- Admin and intern authentication with JWT + rotating refresh tokens
- Admin-assigned Intern IDs — interns log in with Intern ID or email
- First-login onboarding (set password → fill profile → accept agreement)
- Intern CRUD, bulk creation, suspend/activate, role/batch transfer
- Database-driven RBAC with live permission editing
- Learning phases and modules with XP and streak tracking
- Leaderboard, assignments, live sessions, support tickets
- Session management — admin can terminate any session
- Full login history and audit logs

---

## Quick Start for Teammates

> The project owner sets up the cloud database once.
> Teammates only clone, configure `.env`, and run.

### 1. Clone the repo

```bash
git clone https://github.com/amangovindrao/ScaleOn_Study_Portal.git
cd ScaleOn_Study_Portal
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Create `backend/.env`

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and fill in the values shared by the project owner:

```env
DATABASE_URL=postgresql://...neon.tech/scaleon_db?sslmode=require
JWT_ACCESS_SECRET=get_from_owner
JWT_REFRESH_SECRET=get_from_owner
CSRF_SECRET=get_from_owner
```

> Get these values from the project owner — never commit them to GitHub.

### 4. Generate Prisma client

```bash
cd backend
npm run prisma:generate
```

### 5. Run the project

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 6. Open in browser

| Page | URL |
|------|-----|
| Admin Login | http://localhost:3000/admin |
| Intern Login | http://localhost:3000/login |

---

## Default Admin Login

```
Email:    admin@scaleon.io
Password: Admin@ScaleOn2026!
```

---

## Full Setup Guide

See **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** for:
- Complete local PostgreSQL setup (solo)
- Complete Neon cloud setup (team)
- Troubleshooting

## Other Docs

| File | Contents |
|------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and decisions |
| [DATABASE.md](./DATABASE.md) | All 29 tables documented |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | All REST endpoints |
| [CHANGELOG.md](./CHANGELOG.md) | Project history |
| [PROJECT_MEMORY.md](./PROJECT_MEMORY.md) | Full project state |

---

## Project Structure

```
ScaleOn_Study_Portal/
├── backend/
│   ├── prisma/          ← Schema, migrations, seed
│   └── src/
│       ├── modules/     ← auth, interns, learning, sessions, profiles, roles
│       ├── middleware/  ← auth, CSRF, rate limit, error, validation
│       ├── services/    ← session, email, audit, permission
│       └── utils/       ← JWT, cookies, crypto, password, API helpers
├── frontend/
│   └── app/
│       ├── (auth)/      ← login, forgot-password, reset-password
│       ├── admin/       ← dashboard, interns, batches, assignments, roles, sessions
│       ├── intern/      ← dashboard, learning, leaderboard, assignments, support
│       ├── onboarding/  ← first-login wizard
│       ├── components/  ← shared UI (navbar, cards, modal, badge, input)
│       └── lib/         ← API client, auth context, hooks, utils
├── HOW_TO_RUN.md
├── README.md
└── *.md                 ← Architecture, Database, API, Changelog docs
```

---

## Admin Assignments Module (`feature/admin-assignments`)

### Overview
Admin-facing assignment management hub: list and overview metrics of all assignments, course/module filter, due-date range filter, assignment create/edit/delete modal workflows, and per-assignment submission grading (score, status decision, and written feedback).

### Folder Structure
```
app/admin/assignments/
  page.tsx                       # assignment list, search, filter, metrics, create modal
  [assignmentId]/page.tsx        # single assignment submission list & review modal
  types.ts                       # Assignment / AssignmentSubmission / Status types
  mock/                          # dummy data + mock "API" functions
    assignments.ts
    submissions.ts
    modules.ts
    index.ts
  hooks/useAssignmentsData.ts    # data-access layer (swap point for real API)
  components/                    # assignment-specific UI components
    AssignmentTable.tsx
    AssignmentFormModal.tsx
    SubmissionRow.tsx
    ReviewModal.tsx
    StatusFilter.tsx
    SearchBar.tsx
    EmptyState.tsx
    LoadingSkeleton.tsx
```

### Features
- **Overview Metrics**: Total tasks, total submissions count, pending review count, and average max score.
- **Search & Filtering**: Live search by assignment title/description, filter by linked learning module, and filter by due-date status (overdue, upcoming, no due date).
- **Assignment Management**: Create and Edit assignment details (title, description, instructions, module selection, due date, max score) using standard modal forms. Delete assignment with confirmation modal.
- **Submission Grading & Review**: View intern submissions per assignment (filtered by status: All, Pending, Approved, Rejected), inspect submission URL/text payload, assign numerical scores (0..maxScore), provide written feedback, and mark status (`APPROVED`, `REVIEWED`, `REJECTED`).
- **Dark Mode Card UI**: Follows established `BatchesPage` dark slate styling (`bg-slate-900/60`, `border-white/8`, `bg-purple-600` primary buttons).

### How to Run
Visit `/admin/assignments` in your browser (requires logging in with Admin credentials).

### Dependencies
No new npm packages installed. Uses existing `lucide-react`, Next.js App Router, Tailwind CSS 4, and UI primitives (`app/components/ui/*`).

### Environment Variables
None required for this module.

### Data Strategy & Future API Integration
All data access operations are routed through `app/admin/assignments/hooks/useAssignmentsData.ts` backed by typed mock data matching real Prisma `Assignment` and `AssignmentSubmission` models. Pointing to live endpoints (`GET /admin/assignments`, `POST /admin/assignments`, `PATCH /admin/assignments/submissions/:id`) will only require updating `useAssignmentsData.ts`.

### Known Limitations & Backend Work Required
- Currently backed by in-memory mock data.
- **Backend work needed**: No backend controller/routes exist for `Assignment`/`AssignmentSubmission` yet (`backend/src/modules/assignments/*`), and no RBAC permissions are seeded for assignment management.

