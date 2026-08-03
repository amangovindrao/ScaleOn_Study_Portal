# Intern of the Week — Changes Required by Teammates

> This document lists every change that needs to be made outside `frontend/app/intern/dashboard/page.tsx`
> so the new "Intern of the Week", "This Week XP", "Overall Rank", and "Performance Score" features work end-to-end.
>
> The dashboard already consumes these APIs and types. Your job is to create the data sources.

---

## 1 · Backend — Prisma Schema (`backend/prisma/schema.prisma`)

Add one new model after the existing `DailyActivity` model:

```prisma
model InternOfWeek {
  id          String   @id @default(uuid())
  internId    String
  weekStart   DateTime @db.Date          // Monday of that ISO week
  weekLabel   String                     // "Week of Jul 28, 2026"
  weekXp      Int      @default(0)       // XP earned that week
  reason      String   @default("")      // admin-entered recognition note
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  intern Intern @relation(fields: [internId], references: [id], onDelete: Cascade)

  @@unique([weekStart])           // one winner per week
  @@index([internId])
  @@index([weekStart])
}
```

Also add the reverse relation inside the existing `Intern` model:

```prisma
// Inside model Intern { ... } — add this line with the other relations:
internOfWeekHistory InternOfWeek[]
```

---

## 2 · Backend — Migration

After editing the schema run:

```bash
cd backend
npx prisma migrate dev --name add_intern_of_week
npx prisma generate
```

---

## 3 · Backend — Learning Controller (`backend/src/modules/learning/learning.controller.ts`)

Add two new exported functions at the bottom of the file:

```typescript
import { startOfISOWeek, subWeeks } from 'date-fns'; // install if not present
// OR calculate manually — see implementation below (no extra dependency)

// ── GET /learning/intern-of-week  (any authenticated user) ──────────────────
export const getInternOfWeek = asyncHandler(async (_req: Request, res: Response) => {
  // Return the most recent InternOfWeek record
  const record = await prisma.internOfWeek.findFirst({
    orderBy: { weekStart: 'desc' },
    include: {
      intern: {
        select: {
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });
  sendSuccess(res, record ?? null);
});

// ── GET /learning/intern-of-week/history  (any authenticated user) ───────────
export const getInternOfWeekHistory = asyncHandler(async (_req: Request, res: Response) => {
  const history = await prisma.internOfWeek.findMany({
    orderBy: { weekStart: 'desc' },
    take: 20,
    include: {
      intern: {
        select: {
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });
  sendSuccess(res, history);
});

// ── POST /learning/intern-of-week  (Admin only) ───────────────────────────────
// Body: { internId, weekStart (ISO date string), weekXp, reason }
export const adminSetInternOfWeek = asyncHandler(async (req: Request, res: Response) => {
  const { internId, weekStart, weekXp, reason } = req.body;

  const date = new Date(weekStart);
  date.setHours(0, 0, 0, 0);

  // Build a readable label from the date
  const weekLabel = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const record = await prisma.internOfWeek.upsert({
    where: { weekStart: date },
    create: { internId, weekStart: date, weekLabel, weekXp: weekXp ?? 0, reason: reason ?? '' },
    update: { internId, weekLabel, weekXp: weekXp ?? 0, reason: reason ?? '' },
    include: {
      intern: {
        select: {
          fullName: true,
          scaleonId: true,
          internshipRole: { select: { name: true, code: true } },
        },
      },
    },
  });

  sendSuccess(res, record, 201);
});
```

---

## 4 · Backend — Learning Routes (`backend/src/modules/learning/learning.routes.ts`)

Add these three lines inside the existing router (anywhere before `export default router`):

```typescript
// Intern of the Week
router.get('/intern-of-week',         authenticate(), LC.getInternOfWeek);
router.get('/intern-of-week/history', authenticate(), LC.getInternOfWeekHistory);
router.post('/intern-of-week',        authenticate(), requireUserType('ADMIN'), LC.adminSetInternOfWeek);
```

---

## 5 · Frontend — Intern Profile Page (`frontend/app/intern/profile/page.tsx`)

### 5a — Add new useFetch imports at the top

```typescript
import { useFetch } from "@/app/lib/hooks";
```

### 5b — Add new types near the top of the file

```typescript
interface InternOfWeekRecord {
  id: string;
  weekLabel: string;
  weekXp: number;
  reason: string;
  createdAt: string;
  intern: { fullName: string; scaleonId: string };
}
```

### 5c — Add this hook inside `InternProfilePage()`, after the existing `useAuth` call

```typescript
const { data: iotwHistory } = useFetch<InternOfWeekRecord[]>("/learning/intern-of-week/history");
const myHistory = (iotwHistory ?? []).filter(
  (r) => r.intern.scaleonId === intern?.scaleonId
);
const isCurrentIotw =
  (iotwHistory ?? []).length > 0 &&
  (iotwHistory ?? [])[0].intern.scaleonId === intern?.scaleonId;
```

### 5d — Add this new section BEFORE the profile form, after the header card

```tsx
{/* ── Intern of the Week badge ── */}
{isCurrentIotw && (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
    <span className="text-2xl">🏆</span>
    <div>
      <p className="text-sm font-bold text-amber-800">Intern of the Week!</p>
      <p className="text-xs text-amber-600 mt-0.5">{(iotwHistory ?? [])[0].weekLabel}</p>
    </div>
  </div>
)}

{/* ── Intern of the Week history ── */}
{myHistory.length > 0 && (
  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
      🏅 Intern of the Week History
    </h2>
    <div className="space-y-2">
      {myHistory.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
          <div>
            <p className="text-sm font-medium text-slate-900">{r.weekLabel}</p>
            {r.reason && (
              <p className="text-xs text-slate-500 italic mt-0.5">&quot;{r.reason}&quot;</p>
            )}
          </div>
          <span className="text-xs font-bold text-amber-600 flex-shrink-0 ml-3">{r.weekXp} XP</span>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 6 · Backend — Admin can set Intern of the Week via API

Once the above is deployed, the admin can set the winner by calling:

```
POST /api/v1/learning/intern-of-week
Authorization: Admin cookie

Body:
{
  "internId": "<intern UUID from the Intern table>",
  "weekStart": "2026-07-28",
  "weekXp": 340,
  "reason": "Completed all Phase 1 modules and topped the leaderboard"
}
```

An admin dashboard UI page for this can be built later. For now it can be done via API client (Postman, curl, etc.).

---

## 7 · Quick summary of files to change

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `InternOfWeek` model + `internOfWeekHistory` relation on `Intern` |
| `backend/src/modules/learning/learning.controller.ts` | Add `getInternOfWeek`, `getInternOfWeekHistory`, `adminSetInternOfWeek` |
| `backend/src/modules/learning/learning.routes.ts` | Add 3 new routes |
| `frontend/app/intern/profile/page.tsx` | Add `useFetch`, history type, badge + history section |

The dashboard (`frontend/app/intern/dashboard/page.tsx`) is **already done** — it calls `/learning/intern-of-week` and displays the widget. It shows `null` gracefully until the backend endpoint exists.

---

## 9 · Latest dashboard-only additions (already done — no teammate action needed)

These were added after the initial doc and live in `frontend/app/intern/dashboard/page.tsx` only.

### Continue Course panel
- Fetches `/learning/my-learning` (already exists in the backend)
- Panel is **hidden completely** if the intern has no learning content assigned yet
- Shows the first `IN_PROGRESS` module, or falls back to the first `AVAILABLE` one
- Displays: phase name, module title, duration, XP reward, `X of Y completed`
- Button says **"Continue →"** if in-progress, **"Start →"** if not started
- Mini progress bar across all modules shown below the panel

### Streak widget redesign
- Flame icon turns grey at `0` streak, orange when active
- Best streak shows `—` instead of `0d` when no streak yet
- Total XP is muted grey at `0`, amber when earned
- Clean two-column layout so zeros look intentional, not broken

### How to boost rank — tips modal
- **"Boost ↑"** button on the Your Rank stat card
- **"How to improve?"** link in the leaderboard panel header
- Both open a modal with 6 actionable tips
- Tips cover: daily modules, streak, assignments, live sessions, weekly XP, leaderboard awareness
- "Start earning XP now →" CTA links to `/intern/learning`
- Click backdrop to close; no extra libraries used

---

## 10 · Complete status summary

| Feature | Status | Where |
|---------|--------|-------|
| This Week XP stat | ✅ Done | Dashboard |
| Overall Rank stat | ✅ Done | Dashboard |
| Animated counters | ✅ Done | Dashboard |
| 7-day XP bar chart | ✅ Done | Dashboard |
| Mini leaderboard + your rank | ✅ Done | Dashboard |
| Level progress bar | ✅ Done | Dashboard |
| Continue Course panel | ✅ Done | Dashboard |
| Streak widget redesign | ✅ Done | Dashboard |
| How to improve tips modal | ✅ Done | Dashboard |
| Intern of the Week widget | ⏳ Backend needed | Dashboard shows empty until API exists |
| Profile IOTW badge | ⏳ Backend needed | Profile page — see section 5 above |
| Profile IOTW history | ⏳ Backend needed | Profile page — see section 5 above |
| Backend InternOfWeek model | ⏳ Teammate | Schema — see section 1 above |
| Backend IOTW controller | ⏳ Teammate | Controller — see section 3 above |
| Backend IOTW routes | ⏳ Teammate | Routes — see section 4 above |
