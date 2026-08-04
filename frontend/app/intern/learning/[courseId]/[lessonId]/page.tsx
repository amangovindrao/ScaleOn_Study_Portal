"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Paperclip, CheckCircle } from "lucide-react";
import { useCourse, useCompleteLesson } from "../../hooks/useLearningData";
import { VideoPlayer } from "../../components/VideoPlayer";
import { QuizCard } from "../../components/QuizCard";
import { EmptyState, LoadingSkeleton } from "../../components/EmptyState";

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const { data: course, loading, refetch } = useCourse(courseId);
  const { complete, completing } = useCompleteLesson();
  const [justCompleted, setJustCompleted] = useState(false);

  if (loading) return <LoadingSkeleton rows={2} />;
  if (!course) return <EmptyState title="Course not found" />;

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!lesson) return <EmptyState title="Lesson not found" />;

  const isCompleted = justCompleted || lesson.progress.status === "COMPLETED";

  async function handleComplete() {
    await complete(lessonId);
    setJustCompleted(true);
    refetch();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={`/intern/learning/${courseId}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
        <ChevronLeft size={16} /> Back to {course.title}
      </Link>

      <h1 className="text-xl font-bold text-slate-900">{lesson.title}</h1>

      {lesson.videoUrl && <VideoPlayer src={lesson.videoUrl} />}

      {lesson.readingContent && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
            <FileText size={16} className="text-slate-400" /> Reading Material
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{lesson.readingContent}</p>
        </div>
      )}

      {lesson.attachments.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Paperclip size={16} className="text-slate-400" /> Resources
          </h3>
          <div className="space-y-2">
            {lesson.attachments.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                {res.title} ({res.type})
              </a>
            ))}
          </div>
        </div>
      )}

      {lesson.quiz && <QuizCard quiz={lesson.quiz} />}

      <div className="flex items-center gap-3">
        {isCompleted ? (
          <span className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <CheckCircle size={18} /> Lesson completed
          </span>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing === lessonId}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm"
          >
            {completing === lessonId ? "Completing..." : `Mark Complete (+${lesson.xp} XP)`}
          </button>
        )}
      </div>
    </div>
  );
}
