import { dummyCourses } from "./courses";
import { dummyCertificates, dummyStreak } from "./certificates";
import { Course, LearningDashboardData } from "../types";

/**
 * Each function below stands in for one future REST call. Keeping them here (rather than
 * spreading `await fetch(...)` calls through components) means hooks/useLearningData.ts is the
 * ONLY file that changes when the real endpoints exist.
 */

// Future: GET /api/v1/learning/courses
export async function fetchCourses(): Promise<Course[]> {
  await simulateLatency();
  return dummyCourses;
}

// Future: GET /api/v1/learning/courses/:id
export async function fetchCourseById(courseId: string): Promise<Course | null> {
  await simulateLatency();
  return dummyCourses.find((c) => c.id === courseId) ?? null;
}

// Future: GET /api/v1/learning/dashboard  (today: partially covered by GET /learning/my-streak)
export async function fetchDashboard(): Promise<LearningDashboardData> {
  await simulateLatency();
  const allLessons = dummyCourses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const completedLessons = allLessons.filter((l) => l.progress.status === "COMPLETED");
  const inProgress = allLessons.find((l) => l.progress.status === "IN_PROGRESS");

  return {
    streak: dummyStreak,
    totalCertificates: dummyCertificates.length,
    overallProgressPercent: Math.round((completedLessons.length / allLessons.length) * 100),
    currentCourseId: inProgress?.moduleId
      ? dummyCourses.find((c) => c.modules.some((m) => m.id === inProgress.moduleId))?.id ?? null
      : null,
    currentLessonId: inProgress?.id ?? null,
    recentlyCompletedLessons: completedLessons.slice(0, 5).map((l) => ({
      lessonId: l.id,
      lessonTitle: l.title,
      courseTitle: dummyCourses.find((c) => c.modules.some((m) => m.id === l.moduleId))?.title ?? "",
      completedAt: l.progress.completedAt ?? "",
    })),
  };
}

// Future: GET /api/v1/learning/certificates
export async function fetchCertificates() {
  await simulateLatency();
  return dummyCertificates;
}

// Future: POST /api/v1/learning/lessons/:id/complete  (today's closest real route: POST /learning/modules/:id/complete)
export async function completeLessonMock(lessonId: string): Promise<{ success: true; xpAwarded: number }> {
  await simulateLatency();
  for (const course of dummyCourses) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        lesson.progress = { status: "COMPLETED", completedAt: new Date().toISOString(), quizScore: lesson.progress.quizScore };
        return { success: true, xpAwarded: lesson.xp };
      }
    }
  }
  return { success: true, xpAwarded: 0 };
}

function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}
