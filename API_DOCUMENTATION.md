# API DOCUMENTATION

> ScaleOn Internship Study Portal — REST API Reference

---

## Base URL

```
http://localhost:4000/api/v1
```

Production: `https://api.scaleon.io/api/v1`

---

## Authentication

All protected routes require a valid **access token** (httpOnly cookie set on login). The frontend calls the backend directly and sends `credentials: 'include'` on every request.

State-changing requests require the **CSRF token** in production. CSRF middleware is intentionally disabled in local development and enabled when `NODE_ENV=production`.

---

## Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `NO_TOKEN` | 401 | No access token provided |
| `INVALID_TOKEN` | 401 | Access token invalid or expired |
| `SESSION_INVALID` | 401 | Session revoked or expired |
| `ACCOUNT_INACTIVE` | 401 | Account not active |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `ACCOUNT_SUSPENDED` | 401 | Account is suspended |
| `ACCOUNT_LOCKED` | 401 | Brute force lock |
| `FORBIDDEN` | 403 | Not allowed |
| `PERMISSION_DENIED` | 403 | Missing permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate record |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Auth Module — `/api/v1/auth`

### POST `/auth/login/intern`
Intern login (admin-assigned Intern ID or email + password).

**Rate limit**: 20 req / 15 min

**Body:**
```json
{ "identifier": "SOINT260001", "password": "any_non_empty_password", "remember": false }
```

**Response:**
```json
{
  "success": true,
  "data": { "sessionId": "uuid", "isFirstLogin": true, "mustChangePassword": true }
}
```

Sets `access_token` + `refresh_token` httpOnly cookies.

---

### POST `/auth/login/admin`
Admin login (email + password). Hidden route.

**Rate limit**: 20 req / 15 min

**Body:**
```json
{ "email": "admin@scaleon.io", "password": "Admin@ScaleOn2026!", "remember": false }
```

---

### POST `/auth/login/admin/google`
Admin Google OAuth login.

**Body:**
```json
{ "idToken": "google_id_token_here", "remember": false }
```

---

### POST `/auth/logout`
**Auth**: Required

Revokes current session and clears auth cookies.

---

### POST `/auth/refresh`
Rotate refresh token and issue new access token.

**Rate limit**: 20 req / 15 min

Reads `refresh_token` cookie automatically.

---

### GET `/auth/me`
**Auth**: Required

Returns current user's full profile.

---

### POST `/auth/forgot-password`
Send password reset email. Always returns 200 to prevent enumeration.

**Rate limit**: 20 req / 15 min

**Body:**
```json
{ "identifier": "SOINT260001 or email" }
```

---

### POST `/auth/reset-password`
Reset password using a token from the reset email.

**Rate limit**: 20 req / 15 min

**Body:**
```json
{ "token": "raw_token_from_email", "newPassword": "NewP@ss1234!" }
```

---

### POST `/auth/change-password`
**Auth**: Required

Change password for authenticated user.

**Body:**
```json
{ "currentPassword": "old", "newPassword": "NewP@ss1234!" }
```

---

### POST `/auth/first-login/complete`
**Auth**: Optional (reads cookie if available, falls back to body `userAccountId`)

Complete first-login flow: set new password, fill profile, accept terms. No current password required.

**Body:**
```json
{
  "newPassword": "any_password",
  "acceptTerms": true,
  "profile": {
    "phone": "+91 9876543210",
    "college": "MIT",
    "branch": "CS",
    "semester": "5th",
    "linkedin": "https://...",
    "github": "https://..."
  }
}
```

---

## Interns Module — `/api/v1/interns`

All endpoints require **Admin** user type.

### GET `/interns`
**Permission**: `intern.view`

Query params: `page`, `pageSize`, `search`, `internshipRoleId`, `batchId`, `status`, `mentorId`, `sortBy`, `sortOrder`

**Search fields**: name, scaleonId, email, username, phone

---

### POST `/interns`
**Permission**: `intern.create`

Creates intern account. Admin provides Intern ID. Password is auto-generated.

**Body:**
```json
{
  "fullName": "Arjun Sharma",
  "email": "arjun@email.com",
  "internId": "SOINT260003",
  "phone": "+91 9876543210 (optional)",
  "internshipRoleId": "uuid",
  "batchId": "uuid (optional)",
  "mentorId": "uuid (optional)",
  "startDate": "2026-01-01T00:00:00.000Z (optional)",
  "endDate": "2026-06-30T00:00:00.000Z (optional)"
}
```

**Response:** `{ intern, internId, temporaryPassword }` — password shown once only.

---

### GET `/interns/:id`
**Permission**: `intern.view`

---

### PATCH `/interns/:id`
**Permission**: `intern.update`

---

### DELETE `/interns/:id`
**Permission**: `intern.delete`

Soft delete. Sets account status to DELETED.

---

### POST `/interns/:id/suspend`
**Permission**: `intern.suspend`

**Body:** `{ "reason": "optional reason" }`

---

### POST `/interns/:id/activate`
**Permission**: `intern.suspend`

---

### POST `/interns/:id/transfer`
**Permission**: `intern.transfer`

**Body:** `{ "internshipRoleId": "uuid", "batchId": "uuid or null" }`

---

### POST `/interns/:id/extend`
**Permission**: `intern.extend`

**Body:** `{ "newEndDate": "ISO date", "reason": "..." }`

---

### POST `/interns/:id/reset-password`
**Permission**: `intern.reset_password`

Generates new password, emails intern, optionally forces change.

**Body:** `{ "forceChange": true }`

**Response:** `{ "temporaryPassword": "..." }`

---

## Sessions Module — `/api/v1/sessions`

### GET `/sessions/me`
**Auth**: Required (any user type)

Own active sessions.

---

### GET `/sessions/me/login-history`
**Auth**: Required (any user type)

Own login history, paginated.

---

### GET `/sessions`
**Auth**: Admin | **Permission**: `session.view`

All sessions. Query: `page`, `pageSize`, `userAccountId`, `activeOnly`

---

### DELETE `/sessions/:id`
**Auth**: Admin | **Permission**: `session.terminate`

Terminate a specific session.

---

### DELETE `/sessions/user/:userId/all`
**Auth**: Admin | **Permission**: `session.terminate`

Terminate all sessions for a user.

---

### GET `/sessions/user/:userId/login-history`
**Auth**: Admin | **Permission**: `login_history.view`

Login history for a specific user.

---

## Profiles Module — `/api/v1/profiles`

### GET `/profiles/me`
**Auth**: Intern

Own full profile.

---

### PATCH `/profiles/me`
**Auth**: Intern

Update own profile (photo, bio, links, skills, education).

---

### GET `/profiles/intern/:internId`
**Auth**: Admin | **Permission**: `profile.view_any`

---

### PATCH `/profiles/intern/:internId`
**Auth**: Admin | **Permission**: `profile.edit_any`

---

## Roles Module — `/api/v1/roles`

All endpoints require **Admin**.

### GET `/roles`
**Permission**: `role.view`

All system roles with permissions and user counts.

---

### POST `/roles`
**Permission**: `role.manage`

Create a custom role.

---

### GET `/roles/:id`
**Permission**: `role.view`

---

### PUT `/roles/:id/permissions`
**Permission**: `role.assign_permissions`

Replace all permission assignments for a role.

**Body:** `{ "permissionIds": ["uuid", ...] }`

---

### GET `/roles/permissions/all`
**Permission**: `role.view`

All available permissions in the system.

---

## Catalog Module — `/api/v1/catalog`

All endpoints require **Admin**.

### GET `/catalog/internship-roles`
**Permission**: `internship_role.view`

---

### POST `/catalog/internship-roles`
**Permission**: `internship_role.manage`

**Body:** `{ "name": "Data Science", "code": "DS", "description": "..." }`

---

### PATCH `/catalog/internship-roles/:id`
**Permission**: `internship_role.manage`

---

### GET `/catalog/batches`
**Permission**: `batch.view`

---

### POST `/catalog/batches`
**Permission**: `batch.manage`

**Body:** `{ "name": "Batch 2026 - Jul", "code": "B2607", "startDate": "...", "endDate": "...", "capacity": 50 }`

---

### PATCH `/catalog/batches/:id`
**Permission**: `batch.manage`

---

## Learning Module — `/api/v1/learning`

All routes require authentication. Intern-only and admin-only restrictions are noted below.

| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| GET | `/learning/my-learning` | Intern | Published phases/modules with own progress |
| POST | `/learning/modules/:moduleId/complete` | Intern | Complete once, award configured XP, update daily activity/streak/progress |
| GET | `/learning/my-streak` | Intern | Streak, XP, level, and recent activity |
| GET | `/learning/assignments` | Intern | Assignments with own submissions |
| POST | `/learning/assignments/:assignmentId/submit` | Intern | Create or update a submission |
| GET | `/learning/live-sessions` | Any authenticated user | Scheduled and live sessions |
| GET | `/learning/leaderboard` | Any authenticated user | Top 20 interns by total XP |
| GET | `/learning/support/my-tickets` | Intern | Own support tickets and messages |
| POST | `/learning/support/tickets` | Intern | Create a support ticket |
| GET | `/learning/phases` | Admin | List all phases and modules |
| POST | `/learning/phases` | Admin | Create and publish a phase |
| POST | `/learning/modules` | Admin | Create and publish a module |
| PATCH | `/learning/modules/:id` | Admin | Update a module |
| POST | `/learning/assignments/create` | Admin | Create an assignment |
| POST | `/learning/live-sessions/create` | Admin | Schedule a live session |
| GET | `/learning/support/all-tickets` | Admin | List all support tickets |
| GET | `/learning/analytics` | Admin | Platform intern/module/progress analytics |

Admin learning routes currently enforce the `ADMIN` user type; granular learning permission checks and request validation remain pending.

---

## Health Check

### GET `/health`
No auth. Returns server status.

```json
{ "status": "ok", "timestamp": "ISO", "env": "development" }
```

---

## Rate Limits

| Endpoint group | Limit |
|----------------|-------|
| All endpoints | 300 req / 15 min |
| Auth endpoints | 20 req / 15 min |
| Brute force lock | 5 failed → 15 min lock |

---

**Last Updated**: 2026-08-01 (learning routes and backend recovery)
