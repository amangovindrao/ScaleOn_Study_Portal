This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Learning Module (`feature/intern-learning`)

### Overview
Intern-facing learning experience: dashboard with streak/XP/certificates, a searchable/filterable course catalog, per-course module/lesson breakdown, and a lesson player with video, reading material, attachments, and quizzes.

### Folder Structure
```
app/intern/learning/
  page.tsx                       # dashboard (course grid, stats, continue-learning)
  [courseId]/page.tsx            # course detail (modules + lessons)
  [courseId]/[lessonId]/page.tsx # lesson player
  types.ts                       # Course/Module/Lesson/Quiz/Certificate types
  mock/                          # dummy data + mock "API" functions
  hooks/useLearningData.ts       # data-access layer (swap point for real API)
  components/                    # all learning-specific UI components
```

### Features
- Learning dashboard: welcome/streak banner, XP/certificates/progress stats, continue-learning resume card
- Course catalog with search + category/difficulty/status filters
- Course detail: modules with per-module progress, ordered lessons
- Lesson player: video, reading content, downloadable attachments, quiz with scoring, completion + XP award
- Certificates list
- Responsive grid (1 col mobile → 2 tablet → 3 desktop)

### How to Run
```bash
npm install
npm run dev
```
Visit `/intern/learning` (requires being logged in as an INTERN user — auth is unaffected by this branch).

### Dependencies
No new packages. Uses existing `lucide-react`, Tailwind v4, and in-repo UI primitives (`app/components/ui/*`).

### Environment Variables
None required for this branch (no live API calls yet).

### Dummy Data
All content in `app/intern/learning/mock/`. Structured to mirror a `Course → Module → Lesson` hierarchy, which is **richer than the current real backend** (`LearningPhase → LearningModule`, no lessons/quizzes/certificates yet — see `TEAM_CHANGES.md` for exactly what backend work is needed).

### Future API Integration
Only `app/intern/learning/hooks/useLearningData.ts` needs to change — it wraps mock calls today and can be pointed at real `fetch`/`useFetch` calls once the backend supports the full course/lesson/quiz/certificate shape.

### Known Limitations
- Not connected to real data — courses shown are fixed dummy content, not derived from the logged-in intern's actual assignments.
- Quiz state resets on refresh (not persisted).
- No lesson reordering / admin management UI yet (see `TEAM_CHANGES.md` — no team currently owns Admin learning-content management).

### Future Improvements
- Reconnect to real API once `Lesson`/`Quiz`/`Certificate` backend models exist.
- Persist quiz attempts and lesson-level progress server-side.
- Add drag-and-drop reordering for admin (once that module has an owner).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
