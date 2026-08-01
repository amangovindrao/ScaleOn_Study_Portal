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
│       ├── admin/       ← dashboard, interns, batches, roles, sessions
│       ├── intern/      ← dashboard, learning, leaderboard, assignments, support
│       ├── onboarding/  ← first-login wizard
│       ├── components/  ← shared UI (navbar, cards, modal, badge, input)
│       └── lib/         ← API client, auth context, hooks, utils
├── HOW_TO_RUN.md
├── README.md
└── *.md                 ← Architecture, Database, API, Changelog docs
```
