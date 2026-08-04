# 2026-08-04

## Feature
Learning Page rebuild (`feature/intern-learning`) — dashboard, course browsing, lesson player, quizzes, certificates. Built on dummy data with an architecture designed for a minimal-diff swap to real APIs.

## What Changed
- Replaced the previous flat, real-API-wired Learning Page (list of phases/modules with a single "Complete" button) with a modular dashboard: welcome/streak header, XP/certificate/progress stats, "Continue Learning" resume card, filterable/searchable course grid, course detail view, and a dedicated lesson player (video + reading + attachments + quiz + completion).
- Introduced a `Course → Module → Lesson` data model (see Backend Changes Required — `Lesson` does not exist in the DB today).
- All data currently comes from `mock/` files; a `hooks/useLearningData.ts` layer is the single swap point for connecting to real endpoints later.
- Temporarily disconnected this page from the real `/learning/my-learning` and `/learning/modules/:id/complete` endpoints it was previously using, per team decision to rebuild against dummy data first.

## Files Modified
- `app/intern/learning/page.tsx` (full rewrite)

## New Components
- `app/intern/learning/types.ts`
- `app/intern/learning/mock/{courses.ts,certificates.ts,index.ts}`
- `app/intern/learning/hooks/useLearningData.ts`
- `app/intern/learning/components/{LearningHeader,LearningStats,ContinueLearningCard,CourseCard,ModuleCard,LessonCard,VideoPlayer,QuizCard,CertificateCard,CategoryFilter,SearchBar,ProgressBar,EmptyState}.tsx`
- `app/intern/learning/[courseId]/page.tsx` (new route — course detail)
- `app/intern/learning/[courseId]/[lessonId]/page.tsx` (new route — lesson player)

## APIs Used
(Currently Dummy Data)

| Mock function | Future endpoint | Today's real equivalent |
|---|---|---|
| `fetchCourses()` | `GET /api/v1/learning/courses` | `GET /learning/my-learning` (returns Phases→Modules, no Lessons) |
| `fetchCourseById(id)` | `GET /api/v1/learning/courses/:id` | none — not exposed as single-course endpoint today |
| `fetchDashboard()` | `GET /api/v1/learning/dashboard` | partially: `GET /learning/my-streak` (real, already matches streak shape) |
| `fetchCertificates()` | `GET /api/v1/learning/certificates` | none — no Certificate table exists |
| `completeLessonMock(id)` | `POST /api/v1/learning/lessons/:id/complete` | `POST /learning/modules/:id/complete` (per-module, not per-lesson) |

## Dependencies Added
None (reused existing `lucide-react`, Tailwind v4, in-repo UI primitives).

## Environment Variables
None (unaffected: still reads `NEXT_PUBLIC_API_URL` for future use, but no live calls are made yet).

## Database Changes
None made — but see "Backend Changes Required" below for what's needed before this page can go live against real data.

## Backend Changes Required
The current schema (`LearningPhase → LearningModule → ModuleProgress`) does not support this page's full spec. To connect for real, backend needs:
1. **`Lesson` model** — a Module currently has one flat `content`/`videoUrl`/`resourceUrl`; the new UI expects an ordered array of Lessons per Module, each with its own video/reading/resources.
2. **`Resource` as a list**, not a single `resourceUrl` string.
3. **`Quiz` + `QuizQuestion` models** — `ModuleProgress.score` has a comment referencing quiz scoring, but no quiz table backs it today.
4. **`Certificate` model** — not in the schema at all; needed for certificate issuance and the `GET /certificates` endpoint.
5. **Per-lesson progress** — today progress (`ModuleProgress`) is tracked per Module; the new UI needs it per Lesson (module completion can then be derived).
6. New admin CRUD endpoints for lessons/quizzes/resources/certificates, plus reorder and publish/draft-toggle endpoints (existing `POST/PATCH /learning/phases` and `/learning/modules` cover course/module level only).

## Changes Required by Other Teams
**Admin Team**: no developer is currently assigned to `app/admin/` learning-content management, and no nav entry exists for it in `AdminShell.tsx`. Once the backend models above exist, someone needs to own building the Course/Module/Lesson/Quiz/Certificate management UI — this is a gap in the current branch assignments, not something this branch can build (out of module scope).

**Backend Team**: see above.

**Dashboard Team (Yashit)**: no action needed — this branch does not touch shared dashboard files, but note `GET /learning/my-streak` (real endpoint) is reused as-is by this page; no changes needed there.

## Manual Setup
```
npm install
```
No new packages, no migrations, no env vars needed to run this branch as-is (dummy data only).

## Breaking Changes
The Learning Page is temporarily disconnected from the real backend (`/learning/my-learning`, `/learning/modules/:id/complete`). Anyone testing end-to-end intern flows against real data should be aware the Learning tab now shows dummy courses, not their actual assigned modules, until reconnection work happens.

## Notes
- Component/folder structure is fully self-contained under `app/intern/learning/` — no shared files outside this branch's ownership were touched.
- `hooks/useLearningData.ts` is intentionally the only file that should need to change when real endpoints are ready; it currently mirrors the `{ data, loading, error, refetch }` shape of the app-wide `useFetch` hook in `app/lib/hooks.ts` so a future swap can even just call `useFetch` directly if the API shape matches.
- Known pre-existing issue (not introduced by this branch, but relevant here): `app/lib/api.ts` defines `authApi.refresh()` but nothing calls it on a 401 — sessions will silently fail ~15 minutes in. Worth fixing before this page (or any page) goes live against real data with long study sessions.
