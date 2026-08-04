import { ModuleSummary, computeModuleProgress } from "../types";
import { ProgressBar } from "./ProgressBar";
import { LessonCard } from "./LessonCard";

export function ModuleCard({ courseId, module }: { courseId: string; module: ModuleSummary }) {
  const progress = computeModuleProgress(module);
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{module.title}</h2>
            <p className="text-slate-500 text-xs mt-0.5">{module.description}</p>
          </div>
          <span className="text-blue-600 text-xs font-semibold shrink-0">{progress}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={progress} />
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {module.lessons.map((lesson) => (
          <LessonCard key={lesson.id} courseId={courseId} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
