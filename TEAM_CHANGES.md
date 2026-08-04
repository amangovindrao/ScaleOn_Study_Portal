# 📋 TEAM_CHANGES.md

> **Purpose:** A running log of all significant changes made during development.
> Teammates should read this before pulling and running the project to understand what changed, what needs to be updated, and what manual steps are required.
>
> **Format:** Newest changes are at the top. Each entry is dated and tagged.

---

## [2026-08-04] — Intern of the Week Admin Portal & Backend Integration (Aakif - feature/admin-intern-of-week)

### 🔎 What Was Changed
Completed Aakif's task for **Intern of the Week**:
- Added `InternOfWeek` model & relations to backend Prisma schema and synced DB schema.
- Implemented backend controller handlers for getting current winner, retrieving winner history, setting weekly winner (Admin only), and deleting winner entries.
- Created new dedicated Admin page at `/admin/intern-of-week` to crown weekly winners with XP & recognition notes, view current active winner banner, and manage winner history table.
- Added "Intern of Week" nav link with Trophy icon to `AdminShell.tsx`.
- Integrated "Intern of the Week" trophy badge and history list card into intern Profile page (`/intern/profile`).

### 📝 Files Modified

#### Frontend
| File | Change |
|---|---|
| [`frontend/app/admin/intern-of-week/page.tsx`](./frontend/app/admin/intern-of-week/page.tsx) | **NEW** — Admin page for setting weekly winner, viewing active winner showcase, and managing history table |
| [`frontend/app/admin/components/AdminShell.tsx`](./frontend/app/admin/components/AdminShell.tsx) | Added "Intern of Week" nav item with Trophy icon |
| [`frontend/app/intern/profile/page.tsx`](./frontend/app/intern/profile/page.tsx) | Added Intern of the Week trophy badge banner and history section |

#### Backend
| File | Change |
|---|---|
| [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma) | Added `InternOfWeek` model and `internOfWeekHistory` relation on `Intern` |
| [`backend/src/modules/learning/learning.controller.ts`](./backend/src/modules/learning/learning.controller.ts) | Added `getInternOfWeek`, `getInternOfWeekHistory`, `adminSetInternOfWeek`, and `adminDeleteInternOfWeek` |
| [`backend/src/modules/learning/learning.routes.ts`](./backend/src/modules/learning/learning.routes.ts) | Registered `/learning/intern-of-week` endpoints |

### 👥 What Teammates Need to Update
- Run `npx prisma generate` in `backend/` if pulling schema changes.

---

## [2026-08-04] — Fixed Admin Layout & Added Admin Analytics

### 🔎 What Was Changed
Restored the `AdminShell.tsx` component which was accidentally overwritten by the Live Sessions page. Moved the Live Sessions code to its correct path (`/admin/live-sessions/page.tsx`). Implemented the Admin Analytics backend endpoint and hooked it up to the Admin Dashboard. Seeded the database with real test data (`db:seed-test`).

### 📝 Files Modified

#### Frontend
| File | Change |
|---|---|
| [`frontend/app/admin/components/AdminShell.tsx`](./frontend/app/admin/components/AdminShell.tsx) | Restored the layout component code |
| [`frontend/app/admin/live-sessions/page.tsx`](./frontend/app/admin/live-sessions/page.tsx) | Created new page with the accidentally overwritten code |
| [`frontend/app/admin/dashboard/page.tsx`](./frontend/app/admin/dashboard/page.tsx) | Updated to fetch and display real admin analytics |

#### Backend
| File | Change |
|---|---|
| [`backend/src/modules/interns/intern.service.ts`](./backend/src/modules/interns/intern.service.ts) | Added `getAnalyticsSummary` logic |
| [`backend/src/modules/interns/intern.controller.ts`](./backend/src/modules/interns/intern.controller.ts) | Added controller for analytics endpoint |
| [`backend/src/modules/interns/intern.routes.ts`](./backend/src/modules/interns/intern.routes.ts) | Added `GET /analytics/summary` route |

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

## 📅 Log Entry: Support Portal Enhancement & Ticket Management (2026-08-04)

### 1. What Was Changed
- **Ticket Deletion**: Added capability for interns to delete their support tickets.
- **Interactive Thread Messaging**: Interns can send follow-up replies directly in open ticket conversation threads.
- **Self-Service Status Control**: Interns can toggle ticket status between `RESOLVED` and `OPEN` (re-opening).
- **Category & Priority Selection**: Ticket creation now accepts `category` (*General, Technical, Academic, Other*) and `priority` (*Low, Medium, High, Urgent*).
- **Support Metrics Summary**: Added top dashboard cards displaying Total, Active/Pending, and Resolved ticket counts.
- **Search & Multi-Filtering**: Live keyword search bar and filter controls for Status and Priority.
- **FAQ Knowledge Base & Mentor Contact**: Built an interactive FAQ accordion tab and direct mentor contact panel.
- **Optimistic State Management**: Client-side state updates instantly (0ms delay) upon creating, deleting, replying, or closing tickets before background server synchronization finishes.

### 2. Which Files Were Modified
- **[backend/src/modules/learning/learning.controller.ts](./backend/src/modules/learning/learning.controller.ts)**: Added `deleteTicket`, `replyTicket`, and `updateTicketStatus` handlers.
- **[backend/src/modules/learning/learning.routes.ts](./backend/src/modules/learning/learning.routes.ts)**: Registered `DELETE`, `POST` message, and `PATCH` status endpoints for intern support tickets.
- **[frontend/app/intern/support/page.tsx](./frontend/app/intern/support/page.tsx)**: Full Support Hub redesign, thread replies, status toggling, search/filtering, stats header, and FAQ tab.

### 3. Which Other Files/Components Need to be Updated by Teammates
- **Admin Support Dashboard (Teammates working on Admin portal)**:
  - If building/updating admin support management screens (e.g. `/admin/support`), consume `category` and `priority` from `SupportTicket` records returned by `LC.adminListTickets`.
  - Admin replies can be created by inserting records into `TicketMessage` with `senderType: 'ADMIN'`.

### 4. New Dependencies, APIs, Environment Variables, or Database Changes
- **New API Endpoints**:
  - `DELETE /api/v1/learning/support/tickets/:ticketId` - Deletes a ticket and cascades to associated messages.
  - `POST /api/v1/learning/support/tickets/:ticketId/messages` - Body: `{ message: string }`. Appends an intern reply message to the ticket thread.
  - `PATCH /api/v1/learning/support/tickets/:ticketId/status` - Body: `{ status: 'OPEN' | 'RESOLVED' | 'IN_PROGRESS' }`. Updates ticket status.
- **Dependencies**: None.
- **Database Schema**: No migrations required (uses existing Prisma `SupportTicket` and `TicketMessage` models).
- **Environment Variables**: None.

### 5. Manual Setup or Migration Steps
- None. Standard server restart automatically loads the new routes.

### 6. Breaking Changes & Important Notes
- **Breaking Changes**: None.
- **Important Note**: `TicketMessage` model has `@relation(fields: [ticketId], references: [id], onDelete: Cascade)` in Prisma schema, so deleting a `SupportTicket` cleanly deletes all message history without leaving orphaned records.

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

---

## [2026-08-03] — Profile Page Redesign + Database Schema Extension

### 🔎 What Was Changed
A complete redesign of the intern profile page with new UI sections and extended backend data model to support richer profile information useful for a recruiter-facing intern portal.

---

## [2026-08-03] — Prisma Connection Pool Fix + Graceful Shutdown

### 🔎 What Was Changed
Fixed a Prisma connection pool timeout error (`Timed out fetching a new connection from the connection pool`) that occurred when logging in. The root cause was orphaned Node processes from hot-reloads not releasing database connections, and Proton Drive's `ProTUN` virtual network adapter intercepting SSL connections on one developer machine.

---

## [2026-08-03] — Repository Initialization

### 🔎 What Was Changed
- Initialized a git repository in the project root (`git init`)
- Added remote `origin` pointing to `https://github.com/amangovindrao/ScaleOn_Study_Portal`
- Force-checked out `main` branch from remote (overwrote local files with repo versions)

---

*Last updated: 2026-08-04 by Antigravity (AI Coding Assistant)*
