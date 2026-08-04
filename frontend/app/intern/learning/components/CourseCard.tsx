import Link from "next/link";
import { Clock, BookOpen, Zap } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Course, computeCourseProgress } from "../types";
import { ProgressBar } from "./ProgressBar";

const difficultyVariant = { Beginner: "green", Intermediate: "yellow", Advanced: "red" } as const;

export function CourseCard({ course }: { course: Course }) {
  const progress = computeCourseProgress(course);
  const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const status = progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";

  return (
    <Link
      href={`/intern/learning/${course.id}`}
      className="block bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <div className="h-32 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="blue">{course.category}</Badge>
          <Badge variant={difficultyVariant[course.difficulty]}>{course.difficulty}</Badge>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{course.title}</h3>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2">{course.description}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} /> {course.durationMinutes}m</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {lessonCount} lessons</span>
          <span className="flex items-center gap-1 text-blue-500 font-semibold"><Zap size={11} /> {course.xpReward} XP</span>
        </div>
        <ProgressBar percent={progress} />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">{status}</span>
          <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
            {progress > 0 ? "Continue →" : "Start →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
