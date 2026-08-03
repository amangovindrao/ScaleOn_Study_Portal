/**
 * Types for the Learning module.
 *
 * IMPORTANT — mapping to real backend (see backend/prisma/schema.prisma):
 *   Course      -> LearningPhase          (exists today, renamed conceptually)
 *   Module      -> LearningModule         (exists today)
 *   Lesson      -> NOT IN DB YET          (today a Module has ONE flat content/videoUrl/resourceUrl —
 *                                          this file models lessons as an array per module, which the
 *                                          backend team needs to build; see TEAM_CHANGES.md)
 *   Quiz        -> NOT IN DB YET
 *   Certificate -> NOT IN DB YET
 *   Progress    -> ModuleProgress          (exists today, but is per-MODULE not per-LESSON;
 *                                          this file assumes future per-lesson progress rows)
 *
 * Every dummy-data function in mock/ is written to return exactly what its future endpoint
 * would return, so swapping mock -> api only ever touches hooks/useLearningData.ts.
 */

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export type ContentStatus = "DRAFT" | "PUBLISHED";

export type ProgressStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "link" | "doc" | "zip";
  url: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  passingScore: number; // percentage
  questions: QuizQuestion[];
}

export interface LessonProgress {
  status: ProgressStatus;
  completedAt: string | null;
  quizScore: number | null;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  readingContent: string | null; // markdown
  attachments: Resource[];
  quiz: Quiz | null;
  xp: number;
  progress: LessonProgress;
}

export interface ModuleSummary {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  status: ContentStatus;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  xpReward: number;
  status: ContentStatus;
  order: number;
  modules: ModuleSummary[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
}

export interface LearningDashboardData {
  streak: LearningStreak;
  totalCertificates: number;
  overallProgressPercent: number;
  currentCourseId: string | null;
  currentLessonId: string | null;
  recentlyCompletedLessons: { lessonId: string; lessonTitle: string; courseTitle: string; completedAt: string }[];
}

/** Derived, computed client-side — never stored directly. */
export function computeCourseProgress(course: Course): number {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) return 0;
  const completed = allLessons.filter((l) => l.progress.status === "COMPLETED").length;
  return Math.round((completed / allLessons.length) * 100);
}

export function computeModuleProgress(mod: ModuleSummary): number {
  if (mod.lessons.length === 0) return 0;
  const completed = mod.lessons.filter((l) => l.progress.status === "COMPLETED").length;
  return Math.round((completed / mod.lessons.length) * 100);
}
