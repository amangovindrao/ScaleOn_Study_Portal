"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchCourses, fetchCourseById, fetchDashboard, fetchCertificates, completeLessonMock } from "../mock";
import { Course, LearningDashboardData, Certificate } from "../types";

/**
 * SWAP POINT: this file is the only place that needs to change when the real API exists.
 * Every hook below returns { data, loading, error, refetch } — the same shape as the app-wide
 * `useFetch` hook in app/lib/hooks.ts — so once real endpoints exist, these can either call
 * `useFetch("/learning/courses")` directly or keep this wrapper for now.
 */

function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => !cancelled && setData(result))
      .catch(() => !cancelled && setError("Failed to load learning data"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, error, refetch };
}

export function useCourses() {
  return useAsync<Course[]>(fetchCourses);
}

export function useCourse(courseId: string) {
  return useAsync<Course | null>(() => fetchCourseById(courseId), [courseId]);
}

export function useLearningDashboard() {
  return useAsync<LearningDashboardData>(fetchDashboard);
}

export function useCertificates() {
  return useAsync<Certificate[]>(fetchCertificates);
}

export function useCompleteLesson() {
  const [completing, setCompleting] = useState<string | null>(null);
  const complete = useCallback(async (lessonId: string) => {
    setCompleting(lessonId);
    const result = await completeLessonMock(lessonId);
    setCompleting(null);
    return result;
  }, []);
  return { complete, completing };
}
