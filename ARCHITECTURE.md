# ARCHITECTURE

> Complete architectural documentation for the ScaleOn Internship Study Portal

---

## System Overview

ScaleOn is a fullstack web application for managing internships at scale.

**Core Pillars:**
- Identity & Access Management (RBAC, secure authentication)
- Intern lifecycle management (enrollment, progress tracking, certification)
- Learning content delivery & assessment
- Analytics & reporting

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React Context (AuthProvider) + custom hooks (useFetch)
- **UI**: Light mode, professional (white/slate/blue), rounded cards, shadows
- **Animations**: Framer Motion (dock nav, display cards, form stagger)
- **Icons**: Lucide React
- **Utilities**: clsx + tailwind-merge (cn function)
- **API Client**: Browser requests go directly to `http://localhost:4000/api/v1` with credentials included; backend CORS permits local frontend ports 3000 and 3001

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + refresh tokens (httpOnly cookies)
- **Security**: bcrypt, helmet, hpp, rate limiting, brute force protection

### Infrastructure
- **Database**: PostgreSQL (production-ready, scales to 100K+ interns)
- **Storage**: TBD (file uploads, images, certificates)
- **Email**: TBD (Resend / SendGrid / AWS SES)
- **Deployment**: TBD

---

## Folder Structure

```
ScaleOn_Study_Portal/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # database schema
│   ├── src/
│   │   ├── config/                # env, constants
│   │   ├── lib/                   # prisma client
│   │   ├── middleware/            # auth, error, validation
│   │   ├── modules/               # feature modules (auth, admin, intern)
│   │   ├── services/              # business logic
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # helpers
│   │   └── server.ts              # express app entry
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # auth pages (login, reset-password)
│   │   ├── admin/                 # admin dashboard & modules
│   │   ├── intern/                # intern dashboard & learning
│   │   └── api/                   # Next.js API routes (thin proxy to backend)
│   ├── components/                # reusable UI components
│   ├── lib/                       # frontend utils
│   └── public/                    # static assets
├── PROJECT_MEMORY.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API_DOCUMENTATION.md
└── CHANGELOG.md
```

---

## Authentication Architecture

### Credential Model
- **Single Source of Truth**: `UserAccount` table holds all authentication credentials
- **Domain Separation**: `Admin` and `Intern` tables hold domain-specific data only
- **No Public Registration**: Only admins can create user accounts

### Admin Login
- **Route**: `/admin` (not linked from intern login)
- **Method**: Email + password; Google OAuth code remains optional and disabled unless configured
- **Session**: JWT access token (15 min) + rotating refresh token (7 days, or 30 days with remember-me)

### Intern Login
- **Route**: `/login`
- **Method**: Admin-assigned Intern ID or email + password; interns cannot self-register
- **First Login Flow**:
  1. Set a new password without re-entering the temporary password
  2. Complete optional profile fields
  3. Accept the Internship Agreement and Privacy Policy
  4. Enter the dashboard

### Password Policy
- Any non-empty password is accepted by explicit product requirement
- Passwords are hashed with bcrypt and never stored in plaintext
- Admins can regenerate/reset intern passwords

### Session Management
- Access token (JWT, 15 minutes, httpOnly cookie)
- Refresh token (JWT, 7 days, httpOnly cookie, rotated on use)
- Session tracking: IP, user agent, browser, OS, device, country, city
- Admin can terminate any session

### Security Measures
- Rate limiting (login: 5 attempts / 15 min)
- Brute force protection (account lock after 5 failed attempts)
- CSRF protection
- XSS protection (helmet)
- SQL injection prevention (Prisma parameterized queries)
- Input validation (zod)

---

## Role-Based Access Control (RBAC)

### Design
- **Fully database-driven**: No hardcoded permissions
- **Hierarchy**: Roles have a `level` field; higher level = more privileged
- **Composable**: Permissions are grouped (intern.*, admin.*, auth.*)

### System Roles
1. **Super Admin** (level 100): full platform control, cannot be deleted
2. **Admin** (level 50): manage interns, content, batches, roles
3. **Mentor** (level 25, future): guide interns, review progress
4. **Intern** (level 10): access learning, track progress, earn certificates

### Permission Groups
- `intern.*`: intern management (create, update, delete, view, suspend, transfer)
- `admin.*`: admin management
- `role.*`: role & permission management
- `batch.*`: batch management
- `content.*`: learning content management (future)
- `certificate.*`: certificate issuance (future)
- `session.*`: session management
- `auth.*`: authentication operations

---

## Database Design Principles

### Scalability
- Designed for 100 to 100,000+ interns without architectural changes
- Indexed foreign keys, status fields, and frequent search columns
- UUID primary keys (distributed-friendly)

### Relationships
- `UserAccount` 1:1 `Admin` (onDelete: Cascade)
- `UserAccount` 1:1 `Intern` (onDelete: Cascade)
- `UserAccount` 1:N `Session`, `RefreshToken`, `LoginHistory`, `ActivityLog`, `Notification`
- `Intern` N:1 `InternshipRole`
- `Intern` N:1 `Batch` (optional)
- `Intern` N:1 `Admin` (mentor, optional)
- `Intern` 1:1 `InternProfile`
- `Intern` N:N `InternshipRole` via `InternshipEnrollment` (supports role transfers)
- `Role` N:N `Permission` via `RolePermission`

### Soft Deletes
- `UserAccount.status = DELETED` (preserve audit trail)
- `AuditLog` captures all critical mutations

---

## API Design

### REST Principles
- RESTful resource naming
- HTTP verbs: GET, POST, PUT, PATCH, DELETE
- Status codes: 200, 201, 400, 401, 403, 404, 500
- JSON request/response bodies
- Error format: `{ success: false, error: { code, message, details? } }`

### Authentication
- Protected routes use `authenticateToken` middleware
- Role/permission checks use `requirePermission(...)` middleware

### Modules
- `/auth`: login, logout, refresh, reset-password, google-auth
- `/users`: user account operations (admin-only)
- `/admins`: admin-specific operations
- `/interns`: intern CRUD, search, filter, suspend, activate
- `/roles`: role & permission management
- `/batches`: batch CRUD
- `/internship-roles`: internship role CRUD
- `/sessions`: session management (view, terminate)
- `/profile`: intern profile management (intern-only)

---

## Security Layers

### Network
- CORS: whitelist frontend origin only
- Helmet: security headers (CSP, X-Frame-Options, etc.)
- HPP: HTTP parameter pollution prevention

### Authentication
- JWT with short expiry (15 min)
- Refresh token rotation (7 days, single-use, rotation chain tracked)
- Token hashing (SHA-256) before storage; raw tokens never stored

### Authorization
- Middleware: `requireAuth`, `requireRole`, `requirePermission`
- Every protected route checks authentication + authorization

### Input
- Zod validation on all request bodies
- SQL injection prevented by Prisma (parameterized queries)
- XSS prevented by React (automatic escaping) + Content-Security-Policy header

### Logging
- `LoginHistory`: every login attempt (success/failure, IP, user agent, location)
- `ActivityLog`: user actions (entity type, entity ID, metadata)
- `AuditLog`: admin actions (before/after state)

---

## Monitoring & Observability

(To be implemented in future prompts)

- Health check endpoint: `/health`
- Metrics: request count, error rate, response time
- Logging: structured JSON logs (Winston / Pino)
- APM: (Sentry / Datadog / New Relic)

---

## Deployment Strategy

(To be implemented in future prompts)

- **Backend**: Node.js server (Vercel, Railway, AWS ECS, Fly.io)
- **Frontend**: Next.js (Vercel)
- **Database**: PostgreSQL (Supabase, Neon, AWS RDS)
- **CI/CD**: GitHub Actions
- **Secrets**: Environment variables (never committed)

---

## Future Architecture Decisions

- File storage (AWS S3 / Cloudinary for profile photos, resumes, certificates)
- Email service (Resend / SendGrid / AWS SES)
- Real-time notifications (WebSockets / Server-Sent Events / Pusher)
- Cache layer (Redis for sessions, rate limiting)
- Search (Algolia / Elasticsearch for advanced intern search)

---

**Last Updated**: 2026-08-01 (backend recovery, direct API architecture, learning system)
