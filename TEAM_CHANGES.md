# TEAM CHANGES & MODULE HIGHLIGHTS

This document records code, API, schema, and architectural changes made across sprint features to keep all team members synchronized without needing to inspect full git diffs.

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
- **[backend/src/modules/learning/learning.controller.ts](file:///c:/ScaleOn/StudyPortal/ScaleOn_Study_Portal/backend/src/modules/learning/learning.controller.ts)**: Added `deleteTicket`, `replyTicket`, and `updateTicketStatus` handlers.
- **[backend/src/modules/learning/learning.routes.ts](file:///c:/ScaleOn/StudyPortal/ScaleOn_Study_Portal/backend/src/modules/learning/learning.routes.ts)**: Registered `DELETE`, `POST` message, and `PATCH` status endpoints for intern support tickets.
- **[frontend/app/intern/support/page.tsx](file:///c:/ScaleOn/StudyPortal/ScaleOn_Study_Portal/frontend/app/intern/support/page.tsx)**: Full Support Hub redesign, thread replies, status toggling, search/filtering, stats header, and FAQ tab.

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
