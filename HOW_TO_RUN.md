# How to Run ScaleOn Study Portal

---

## Prerequisites

- **Node.js** 18+ (recommended: 22)
- **PostgreSQL** installed and running on port 5432
- **npm** (comes with Node.js)

---

## Step 1: Create the Database

Open pgAdmin or psql and create a database:

```sql
CREATE DATABASE scaleon_db;
```

---

## Step 2: Configure Backend Environment

```bash
cd backend
```

Edit `.env` file — update these values:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/scaleon_db?schema=public
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

---

## Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

---

## Step 4: Setup Database (first time only)

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Apply the committed migration history
npm run prisma:deploy

# Seed default data (admin account, roles, permissions, internship roles, batch)
npm run db:seed
```

---

## Step 5: Start the Servers

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

## Step 6: Open in Browser

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

## Quick Start (after first setup)

Every time you want to run the project:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Then open http://localhost:3000/admin (or port 3001 if Next.js reports that 3000 is occupied).
