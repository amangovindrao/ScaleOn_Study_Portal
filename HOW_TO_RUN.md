# How to Run — ScaleOn Study Portal

---

## There are two ways to set up the database

| Mode | Who | When |
|------|-----|------|
| **Local PostgreSQL** | Solo development | Only you, on your machine |
| **Neon Cloud Database** | Team development | Everyone shares one live database |

The team should use **Neon (cloud)**. Local PostgreSQL is only for solo offline work.

---

# OPTION A — Team Setup (Neon Cloud Database)

> One person (the project owner) does Steps 1–4 once.
> All teammates only do Steps 5–7.

---

## Step 1 — Create Neon Project (Owner only, once)

1. Go to **https://neon.tech** and sign up (free)
2. Click **New Project**
   - Project name: `ScaleOn`
   - Database name: `scaleon_db`
   - Region: closest to your team
3. Click **Create Project**
4. Copy the connection string shown — it looks like:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/scaleon_db?sslmode=require
   ```
5. Share this string with your team via WhatsApp / Notion / private message — **never commit it to GitHub**

---

## Step 2 — Configure Your Environment (Owner only)

In `backend/.env`, replace the `DATABASE_URL` line:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/scaleon_db?sslmode=require
```

Also share these values with teammates (they need the same secrets):

```env
JWT_ACCESS_SECRET=dev_scaleon_access_secret_change_in_prod
JWT_REFRESH_SECRET=dev_scaleon_refresh_secret_change_in_prod
CSRF_SECRET=dev_scaleon_csrf_secret_change_in_prod
```

---

## Step 3 — Run Migrations + Seed (Owner only, once)

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
```

This creates all 29 tables and seeds the default admin account into the cloud database.
**Teammates must NOT run this again** — it will try to re-seed and conflict.

---

## Step 4 — Verify (Owner)

```bash
npm run dev
```

Open http://localhost:3000/admin and log in:

```
Email:    admin@scaleon.io
Password: Admin@ScaleOn2026!
```

If login works, the cloud database is live. ✅ Share the connection string with teammates.

---

## Step 5 — Teammate Setup (Each teammate does this once)

### 5a. Clone the repository

```bash
git clone https://github.com/amangovindrao/ScaleOn_Study_Portal.git
cd ScaleOn_Study_Portal
```

### 5b. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd ../frontend
npm install
```

### 5c. Create the backend `.env` file

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and set these values (get them from the project owner):

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/scaleon_db?sslmode=require

NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

JWT_ACCESS_SECRET=same_value_as_owner
JWT_REFRESH_SECRET=same_value_as_owner
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_REMEMBER_EXPIRES_IN=30d

COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

CSRF_SECRET=same_value_as_owner

LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_MINUTES=15
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=20

EMAIL_PROVIDER=console
EMAIL_FROM=ScaleOn Portal <no-reply@scaleon.io>

FRONTEND_URL=http://localhost:3000
PASSWORD_RESET_URL=http://localhost:3000/reset-password
```

### 5d. Generate Prisma client

```bash
cd backend
npm run prisma:generate
```

> Do NOT run `prisma:deploy` or `db:seed` — the owner already did this.

---

## Step 6 — Start the Servers (Everyone, every session)

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
→ Runs on **http://localhost:4000**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
→ Runs on **http://localhost:3000**

---

## Step 7 — Open in Browser

| Page | URL |
|------|-----|
| **Admin Login** | http://localhost:3000/admin |
| **Intern Login** | http://localhost:3000/login |

---

## Default Admin Credentials

```
Email:    admin@scaleon.io
Password: Admin@ScaleOn2026!
```

---

## Daily Quick Start (after first setup)

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Then open http://localhost:3000/admin

---

---

# OPTION B — Local PostgreSQL (Solo only)

Use this only if you are working offline or alone and don't need the shared database.

## Prerequisites

- **Node.js** 18+ (recommended: 22)
- **PostgreSQL** installed and running on port 5432
- **npm** (comes with Node.js)

## Step 1 — Create the local database

Open pgAdmin or psql:

```sql
CREATE DATABASE scaleon_db;
```

## Step 2 — Configure `backend/.env`

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/scaleon_db?schema=public
```

Replace `YOUR_PASSWORD` with your local PostgreSQL password.

## Step 3 — Install, migrate, seed

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
```

## Step 4 — Run

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `Missing required environment variable: DATABASE_URL` | You forgot to create/edit `backend/.env` |
| `Authentication failed` on database | Wrong password or wrong Neon connection string |
| Port 4000 already in use | Kill the process or change `PORT` in `.env` |
| Port 3000 already in use | Frontend will auto-use 3001 |
| `Cannot find module` errors | Run `npm install` in both `backend/` and `frontend/` |
| Prisma schema out of sync | Run `npm run prisma:generate` in `backend/` |

---

## Project Structure

```
ScaleOn_Study_Portal/
├── backend/          ← Express API (port 4000)
├── frontend/         ← Next.js App (port 3000)
├── PROJECT_MEMORY.md ← Full project state and decisions
├── HOW_TO_RUN.md     ← This file
├── ARCHITECTURE.md   ← System design
├── DATABASE.md       ← All 29 tables documented
├── API_DOCUMENTATION.md ← All API endpoints
└── CHANGELOG.md      ← Project history
```
