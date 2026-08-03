import Link from "next/link";
import { CheckCircle, Lock, Play, Clock, HelpCircle } from "lucide-react";
import { Lesson } from "../types";

export function LessonCard({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const isLocked = lesson.progress.status === "LOCKED";
  const isCompleted = lesson.progress.status === "COMPLETED";
  const minutes = lesson.videoDurationSeconds ? Math.round(lesson.videoDurationSeconds / 60) : null;

  const content = (
    <div className={`px-6 py-4 flex items-center justify-between transition-colors ${isLocked ? "" : "hover:bg-slate-50/50"}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? "bg-emerald-100 text-emerald-600" : isLocked ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-500"}`}>
          {isCompleted ? <CheckCircle size={20} /> : isLocked ? <Lock size={18} /> : <Play size={18} />}
        </div>
        <div>
          <p className={`text-sm font-semibold ${isCompleted ? "text-slate-400 line-through" : "text-slate-900"}`}>{lesson.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {minutes && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock size={10} /> {minutes}m</span>}
            {lesson.quiz && <span className="text-[10px] text-purple-500 flex items-center gap-0.5"><HelpCircle size={10} /> Quiz</span>}
            <span className="text-[10px] text-blue-500 font-semibold">+{lesson.xp} XP</span>
          </div>
        </div>
      </div>
      {isCompleted && <span className="text-emerald-600 text-xs font-semibold">✓ Done</span>}
      {!isCompleted && !isLocked && <span className="text-blue-600 text-xs font-semibold">Start →</span>}
    </div>
  );

  if (isLocked) return <div className="opacity-60 cursor-not-allowed">{content}</div>;
  return <Link href={`/intern/learning/${courseId}/${lesson.id}`}>{content}</Link>;
}
