"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, Zap } from "lucide-react";
import { useCourse } from "../hooks/useLearningData";
import { ModuleCard } from "../components/ModuleCard";
import { ProgressBar } from "../components/ProgressBar";
import { EmptyState, LoadingSkeleton } from "../components/EmptyState";
import { computeCourseProgress } from "../types";

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course, loading } = useCourse(courseId);

  if (loading) return <LoadingSkeleton rows={3} />;
  if (!course) return <EmptyState title="Course not found" subtitle="It may have been unpublished or removed." />;

  const progress = computeCourseProgress(course);

  return (
    <div className="space-y-6">
      <Link href="/intern/learning" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
        <ChevronLeft size={16} /> Back to Learning
      </Link>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-3">
        <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
        <p className="text-slate-500 text-sm">{course.description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={12} /> {course.durationMinutes}m total</span>
          <span className="flex items-center gap-1 text-blue-500 font-semibold"><Zap size={12} /> {course.xpReward} XP reward</span>
        </div>
        <ProgressBar percent={progress} />
      </div>

      <div className="space-y-4">
        {course.modules.map((mod) => (
          <ModuleCard key={mod.id} courseId={course.id} module={mod} />
        ))}
      </div>
    </div>
  );
}
