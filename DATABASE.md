# DATABASE

> Complete database documentation for the ScaleOn Internship Study Portal

---

## Database Engine

**PostgreSQL** — production-grade relational database.

- ORM: Prisma
- Schema file: `backend/prisma/schema.prisma`
- Migration tool: `prisma migrate dev` (development) / `prisma migrate deploy` (production)

---

## Design Goals

- Support 100 → 100,000+ interns without architectural changes
- UUID primary keys (globally unique, distributed-friendly)
- Indexed on all foreign keys, status fields, and frequently-queried columns
- Soft deletes (preserve audit trail; never hard-delete user accounts)
- Database-driven RBAC (no hardcoded permissions)
- All tokens stored as SHA-256 hashes (raw tokens never persisted)

---

## Tables Overview

| Table | Purpose |
|-------|---------|
| `Role` | System roles (Super Admin, Admin, Mentor, Intern) |
| `Permission` | Granular permission keys |
| `RolePermission` | N:N join between Role and Permission |
| `UserAccount` | Central authentication identity (all users) |
| `Admin` | Admin domain data |
| `Intern` | Intern domain data |
| `InternProfile` | Extended intern profile info |
| `InternshipRole` | Internship roles (AI, SMM, BD, SALES…) |
| `Batch` | Internship batches |
| `InternshipEnrollment` | Intern↔Role↔Batch enrollment (history) |
| `Session` | Active and past login sessions |
| `RefreshToken` | JWT refresh tokens (hashed, rotated) |
| `PasswordResetToken` | Short-lived password reset tokens (hashed) |
| `LoginHistory` | Every login attempt (success + failure) |
| `ActivityLog` | User action log |
| `AuditLog` | Admin mutation log (before/after state) |
| `Notification` | In-app notifications |
| `Setting` | Application settings |
| `LearningPhase` | Ordered Phase 1/Phase 2 learning groups |
| `LearningModule` | Published learning content and XP rewards |
| `ModuleProgress` | Per-intern module state, completion, score, and time |
| `Assignment` | Module-linked or standalone assignments |
| `AssignmentSubmission` | Intern submissions, reviews, scores, and feedback |
| `InternStreak` | Current/longest streak, total XP, and level |
| `DailyActivity` | One activity aggregate per intern per calendar day |
| `LiveSession` | Scheduled/live/completed learning sessions |
| `LiveSessionAttendee` | Intern attendance for live sessions |
| `SupportTicket` | Intern support requests and resolution state |
| `TicketMessage` | Conversation messages on support tickets |

**Current total: 29 tables.**

---

## Enums

| Enum | Values |
|------|--------|
| `UserType` | ADMIN, INTERN, MENTOR |
| `AccountStatus` | PENDING, ACTIVE, SUSPENDED, INACTIVE, DELETED |
| `InternStatus` | ACTIVE, ON_HOLD, COMPLETED, DROPPED, SUSPENDED |
| `BatchStatus` | UPCOMING, ACTIVE, COMPLETED, ARCHIVED |
| `RoleStatus` | ACTIVE, INACTIVE |
| `EnrollmentStatus` | ENROLLED, ACTIVE, COMPLETED, WITHDRAWN, TRANSFERRED |
| `NotificationType` | SYSTEM, ACCOUNT, CREDENTIAL, ANNOUNCEMENT, REMINDER, CERTIFICATE |

---

## Table Details

### `Role`
System roles with hierarchy.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | String | unique. "Super Admin", "Admin", etc. |
| slug | String | unique. "super_admin", "admin", etc. |
| description | String? | optional |
| level | Int | higher = more privileged |
| isSystem | Boolean | system roles cannot be deleted |
| status | RoleStatus | ACTIVE / INACTIVE |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `status`

---

### `Permission`
Granular permission keys, grouped by feature area.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| key | String | unique. "intern.create", "session.terminate" |
| name | String | human-readable name |
| group | String | "intern", "admin", "auth", "settings" |
| description | String? | |
| createdAt | DateTime | |

**Indexes**: `group`

**Permission Key Convention**: `{group}.{action}`

---

### `RolePermission`
Junction table linking roles to permissions.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| roleId | UUID | FK → Role |
| permissionId | UUID | FK → Permission |
| createdAt | DateTime | |

**Unique**: `(roleId, permissionId)`
**Indexes**: `roleId`, `permissionId`

---

### `UserAccount`
Central authentication identity for all user types.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| username | String? | unique. SO-AI-0001. null for admins |
| email | String | unique |
| phone | String? | |
| passwordHash | String? | bcrypt. null if Google-only |
| googleId | String? | unique. for Google OAuth |
| userType | UserType | ADMIN / INTERN / MENTOR |
| status | AccountStatus | default PENDING |
| roleId | UUID | FK → Role |
| isFirstLogin | Boolean | default true; triggers onboarding |
| mustChangePassword | Boolean | default true |
| termsAcceptedAt | DateTime? | |
| emailVerifiedAt | DateTime? | |
| lastLoginAt | DateTime? | |
| failedLoginAttempts | Int | brute force tracking |
| lockedUntil | DateTime? | account lock until |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `userType`, `status`, `roleId`

---

### `Admin`
Admin-specific domain data. 1:1 with UserAccount.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | unique FK → UserAccount |
| fullName | String | |
| profileImage | String? | URL |
| designation | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

### `Intern`
Intern domain data. 1:1 with UserAccount.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | unique FK → UserAccount |
| scaleonId | String | unique. SOINT260001 |
| fullName | String | |
| internshipRoleId | UUID | FK → InternshipRole |
| batchId | UUID? | FK → Batch (optional) |
| mentorId | UUID? | FK → Admin (optional) |
| startDate | DateTime? | |
| endDate | DateTime? | |
| status | InternStatus | ACTIVE / ON_HOLD / etc. |
| currentPhase | String? | phase name |
| currentModule | String? | current learning module |
| overallProgress | Float | 0–100 |
| attendancePercent | Float | 0–100 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `internshipRoleId`, `batchId`, `status`, `mentorId`, `fullName`

---

### `InternProfile`
Extended profile completed during onboarding. 1:1 with Intern.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| internId | UUID | unique FK → Intern |
| photo | String? | URL |
| bio | String? | |
| linkedin | String? | |
| github | String? | |
| portfolio | String? | |
| resumeUrl | String? | |
| skills | String[] | array |
| college | String? | |
| university | String? | |
| branch | String? | |
| semester | String? | |
| expectedGraduation | DateTime? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

### `InternshipRole`
Roles interns can be enrolled in. Drives username generation.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | String | unique. "Artificial Intelligence" |
| code | String | unique. "AI", "SMM", "BD", "SALES" |
| usernamePrefix | String | "SO-AI", "SO-SMM" (computed, stored) |
| description | String? | |
| status | RoleStatus | ACTIVE / INACTIVE |
| usernameSeq | Int | last issued sequence for username generation |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `status`

---

### `Batch`
Intern cohorts.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | String | unique. "Batch 2026 - Jan" |
| code | String | unique. "B2601" |
| startDate | DateTime? | |
| endDate | DateTime? | |
| capacity | Int? | |
| status | BatchStatus | UPCOMING / ACTIVE / COMPLETED / ARCHIVED |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `status`

---

### `InternshipEnrollment`
Tracks intern enrollment history. Supports role transfers.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| internId | UUID | FK → Intern |
| internshipRoleId | UUID | FK → InternshipRole |
| batchId | UUID? | FK → Batch (optional) |
| status | EnrollmentStatus | |
| startDate | DateTime? | |
| endDate | DateTime? | |
| enrolledAt | DateTime | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes**: `internId`, `internshipRoleId`, `batchId`, `status`

---

### `Session`
Login sessions. Admin can terminate any session.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | FK → UserAccount |
| ipAddress | String? | |
| userAgent | String? | |
| browser | String? | |
| os | String? | |
| device | String? | |
| country | String? | |
| city | String? | |
| isActive | Boolean | default true |
| lastActivityAt | DateTime | |
| expiresAt | DateTime | |
| revokedAt | DateTime? | set when admin terminates |
| createdAt | DateTime | |

**Indexes**: `userAccountId`, `isActive`

---

### `RefreshToken`
Rotated JWT refresh tokens. Raw tokens never stored.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | FK → UserAccount |
| sessionId | UUID? | FK → Session |
| tokenHash | String | unique. SHA-256 of raw token |
| expiresAt | DateTime | |
| revokedAt | DateTime? | |
| replacedByTokenId | String? | rotation chain |
| ipAddress | String? | |
| userAgent | String? | |
| createdAt | DateTime | |

**Indexes**: `userAccountId`, `sessionId`

---

### `PasswordResetToken`
Short-lived (15 min) email password reset tokens.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | FK → UserAccount |
| tokenHash | String | unique. SHA-256 |
| expiresAt | DateTime | 15 min from creation |
| usedAt | DateTime? | set when used |
| ipAddress | String? | |
| createdAt | DateTime | |

**Indexes**: `userAccountId`

---

### `LoginHistory`
Every authentication attempt (success + failure).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID? | FK → UserAccount (null on failed attempt with bad identifier) |
| identifierUsed | String | username/email that was tried |
| success | Boolean | |
| failureReason | String? | "INVALID_PASSWORD", "ACCOUNT_LOCKED", etc. |
| ipAddress | String? | |
| userAgent | String? | |
| browser | String? | |
| os | String? | |
| device | String? | |
| country | String? | |
| city | String? | |
| createdAt | DateTime | |

**Indexes**: `userAccountId`, `success`, `createdAt`

---

### `ActivityLog`
User action log.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID? | who did it |
| action | String | "intern.created", "profile.updated", etc. |
| entityType | String? | "Intern", "Admin", etc. |
| entityId | String? | ID of affected entity |
| metadata | Json? | additional context |
| ipAddress | String? | |
| createdAt | DateTime | |

**Indexes**: `userAccountId`, `(entityType, entityId)`, `createdAt`

---

### `AuditLog`
Admin mutations (before/after state for compliance).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| actorId | String? | who performed the action |
| actorType | String? | "ADMIN" / "INTERN" / "SYSTEM" |
| action | String | "intern.update", "intern.suspend", etc. |
| entityType | String? | |
| entityId | String? | |
| before | Json? | state before change |
| after | Json? | state after change |
| ipAddress | String? | |
| createdAt | DateTime | |

**Indexes**: `actorId`, `(entityType, entityId)`, `createdAt`

---

### `Notification`
In-app notifications for users.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userAccountId | UUID | FK → UserAccount |
| type | NotificationType | SYSTEM, ACCOUNT, etc. |
| title | String | |
| message | String | |
| data | Json? | extra context |
| readAt | DateTime? | null = unread |
| createdAt | DateTime | |

**Indexes**: `userAccountId`, `readAt`

---

### `Setting`
Key-value application settings store.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| key | String | unique |
| value | Json | |
| group | String | "general", "auth", "email", etc. |
| description | String? | |
| updatedAt | DateTime | |
| createdAt | DateTime | |

**Indexes**: `group`

---

## Relationships Diagram

```
UserAccount ─────── Admin (1:1)
    │   └────────── Intern (1:1)
    │                   └──── InternProfile (1:1)
    │                   └──── InternshipRole (N:1)
    │                   └──── Batch (N:1, optional)
    │                   └──── Admin/mentor (N:1, optional)
    │                   └──── InternshipEnrollment (1:N)
    └────────── Session (1:N)
    └────────── RefreshToken (1:N)
    └────────── PasswordResetToken (1:N)
    └────────── LoginHistory (1:N)
    └────────── ActivityLog (1:N)
    └────────── Notification (1:N)
    └────── Role (N:1)

Role ─────────── RolePermission (1:N)
Permission ───── RolePermission (1:N)
```

---

## Intern Identity Rules

- Admins manually assign the Intern ID (for example `SOINT260001` or another organization-approved format).
- `UserAccount.username` stores that same Intern ID for compatibility; no separate generated login username is shown.
- Interns sign in with Intern ID or email plus password.
- `InternshipRole.usernameSeq` and `Setting` sequence values are legacy compatibility fields and are not used for current intern creation.

---

## Password Policy

- Any non-empty password is accepted by explicit product requirement.
- Passwords are hashed with bcrypt and never stored in plaintext.
- First-login password setup does not ask for the temporary password again.
- Later password changes from Profile/Security require the current password.

---

## Indexes Summary

All foreign key columns are indexed. Additional indexes:
- `UserAccount`: userType, status, roleId
- `Intern`: internshipRoleId, batchId, status, mentorId, fullName
- `Session`: userAccountId, isActive
- `LoginHistory`: userAccountId, success, createdAt
- `ActivityLog`: userAccountId, (entityType, entityId), createdAt
- `AuditLog`: actorId, (entityType, entityId), createdAt
- `Notification`: userAccountId, readAt

---

## Migration Commands

```bash
# Development: create and apply a new migration
npx prisma migrate dev --name init

# Production: apply existing migrations
npx prisma migrate deploy

# Regenerate client after schema change
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

**Last Updated**: 2026-08-01 (29-table learning/engagement schema and migration repair)
