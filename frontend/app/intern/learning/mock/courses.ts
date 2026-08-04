import { Course } from "../types";

/**
 * Dummy data standing in for:
 *   Future: GET /api/v1/learning/courses
 *   Today's real (narrower) equivalent: GET /learning/my-learning -> LearningPhase[] with nested LearningModule[]
 *
 * Admin CRUD this will eventually back (already partially real today):
 *   POST   /learning/phases         -> create course     (exists)
 *   POST   /learning/modules        -> create module      (exists)
 *   PATCH  /learning/modules/:id    -> update module       (exists)
 *   Needed for full spec (do not exist yet): lesson CRUD, quiz CRUD, resource CRUD, reorder endpoints,
 *   publish/draft toggle at course+module+lesson level, certificate issuance.
 */
export const dummyCourses: Course[] = [
  {
    id: "course-1",
    title: "Frontend Foundations",
    description: "Core HTML, CSS and JavaScript concepts every ScaleOn intern needs before touching React.",
    thumbnailUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400",
    category: "Web Development",
    difficulty: "Beginner",
    durationMinutes: 180,
    xpReward: 150,
    status: "PUBLISHED",
    order: 0,
    modules: [
      {
        id: "module-1",
        courseId: "course-1",
        title: "HTML & Semantic Markup",
        description: "Structure pages the way browsers and screen readers expect.",
        order: 0,
        status: "PUBLISHED",
        lessons: [
          {
            id: "lesson-1",
            moduleId: "module-1",
            title: "Why Semantic HTML Matters",
            order: 0,
            videoUrl: "https://example.com/videos/semantic-html.mp4",
            videoDurationSeconds: 480,
            readingContent: "Semantic tags like `<article>`, `<nav>` and `<section>` describe meaning, not just layout...",
            attachments: [{ id: "res-1", title: "HTML Cheatsheet", type: "pdf", url: "https://example.com/resources/html-cheatsheet.pdf" }],
            quiz: {
              id: "quiz-1",
              passingScore: 70,
              questions: [
                { id: "q1", question: "Which tag best represents a self-contained blog post?", options: ["<div>", "<article>", "<span>", "<b>"], correctOptionIndex: 1 },
              ],
            },
            xp: 20,
            progress: { status: "COMPLETED", completedAt: "2026-07-28T10:00:00Z", quizScore: 100 },
          },
          {
            id: "lesson-2",
            moduleId: "module-1",
            title: "Forms & Accessibility",
            order: 1,
            videoUrl: "https://example.com/videos/forms-a11y.mp4",
            videoDurationSeconds: 600,
            readingContent: "Every input needs a label. ARIA attributes fill the gaps native HTML can't...",
            attachments: [],
            quiz: null,
            xp: 15,
            progress: { status: "IN_PROGRESS", completedAt: null, quizScore: null },
          },
        ],
      },
      {
        id: "module-2",
        courseId: "course-1",
        title: "CSS Layout Systems",
        description: "Flexbox and Grid for real-world responsive layouts.",
        order: 1,
        status: "PUBLISHED",
        lessons: [
          {
            id: "lesson-3",
            moduleId: "module-2",
            title: "Flexbox in Practice",
            order: 0,
            videoUrl: "https://example.com/videos/flexbox.mp4",
            videoDurationSeconds: 540,
            readingContent: "Flexbox solves one-dimensional layout problems...",
            attachments: [{ id: "res-2", title: "Flexbox Playground", type: "link", url: "https://example.com/playground/flexbox" }],
            quiz: null,
            xp: 15,
            progress: { status: "AVAILABLE", completedAt: null, quizScore: null },
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "React & Component Architecture",
    description: "Building maintainable UIs with hooks, composition, and typed props.",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    category: "Web Development",
    difficulty: "Intermediate",
    durationMinutes: 240,
    xpReward: 220,
    status: "PUBLISHED",
    order: 1,
    modules: [
      {
        id: "module-3",
        courseId: "course-2",
        title: "Hooks Deep Dive",
        description: "useState, useEffect, and custom hooks done right.",
        order: 0,
        status: "PUBLISHED",
        lessons: [
          {
            id: "lesson-4",
            moduleId: "module-3",
            title: "Rules of Hooks",
            order: 0,
            videoUrl: "https://example.com/videos/rules-of-hooks.mp4",
            videoDurationSeconds: 420,
            readingContent: "Hooks must be called at the top level, never conditionally...",
            attachments: [],
            quiz: {
              id: "quiz-2",
              passingScore: 80,
              questions: [
                { id: "q2", question: "Can you call useState inside an if statement?", options: ["Yes", "No"], correctOptionIndex: 1 },
              ],
            },
            xp: 20,
            progress: { status: "LOCKED", completedAt: null, quizScore: null },
          },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "Backend Fundamentals with Express",
    description: "REST APIs, middleware, and authentication patterns used across ScaleOn services.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    category: "Backend Development",
    difficulty: "Advanced",
    durationMinutes: 300,
    xpReward: 260,
    status: "PUBLISHED",
    order: 2,
    modules: [
      {
        id: "module-4",
        courseId: "course-3",
        title: "Middleware & Auth",
        description: "Request pipelines, JWTs, and role-based guards.",
        order: 0,
        status: "PUBLISHED",
        lessons: [
          {
            id: "lesson-5",
            moduleId: "module-4",
            title: "Writing Custom Middleware",
            order: 0,
            videoUrl: "https://example.com/videos/middleware.mp4",
            videoDurationSeconds: 660,
            readingContent: "Middleware functions receive (req, res, next) and can short-circuit a request...",
            attachments: [{ id: "res-3", title: "Express Middleware Guide", type: "doc", url: "https://example.com/resources/middleware-guide.docx" }],
            quiz: null,
            xp: 25,
            progress: { status: "LOCKED", completedAt: null, quizScore: null },
          },
        ],
      },
    ],
  },
];
