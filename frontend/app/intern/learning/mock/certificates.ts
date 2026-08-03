import { Certificate, LearningStreak } from "../types";

/**
 * Future: GET /api/v1/learning/certificates
 * Today: no equivalent exists — Certificate is not a table in the DB yet.
 */
export const dummyCertificates: Certificate[] = [
  {
    id: "cert-1",
    courseId: "course-1",
    courseTitle: "Frontend Foundations",
    issuedAt: "2026-07-30T09:00:00Z",
    certificateUrl: "https://example.com/certificates/cert-1.pdf",
  },
];

/**
 * Today: GET /learning/my-streak returns exactly this shape already (real, working endpoint).
 * No backend change needed here.
 */
export const dummyStreak: LearningStreak = {
  currentStreak: 4,
  longestStreak: 9,
  totalXp: 320,
  level: 4,
};
