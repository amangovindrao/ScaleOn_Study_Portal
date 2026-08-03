import Link from "next/link";
import { PlayCircle } from "lucide-react";

export function ContinueLearningCard({
  courseId,
  lessonId,
  courseTitle,
  lessonTitle,
}: {
  courseId: string;
  lessonId: string;
  courseTitle: string;
  lessonTitle: string;
}) {
  return (
    <Link
      href={`/intern/learning/${courseId}/${lessonId}`}
      className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-4">
        <PlayCircle size={32} className="text-white/90" />
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Continue Learning</p>
          <p className="text-white text-base font-bold mt-0.5">{lessonTitle}</p>
          <p className="text-white/60 text-xs">{courseTitle}</p>
        </div>
      </div>
      <span className="text-white text-sm font-semibold bg-white/10 px-4 py-2 rounded-lg">Resume →</span>
    </Link>
  );
}
