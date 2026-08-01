"use client";

import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useState } from "react";
import { BookOpen, CheckCircle, Lock, Play, Clock } from "lucide-react";

interface Module { id: string; title: string; description: string | null; duration: number | null; points: number; videoUrl: string | null; progress: { status: string; completedAt: string | null }[] }
interface Phase { id: string; name: string; slug: string; description: string | null; order: number; modules: Module[] }

export default function LearningPage() {
  const { data: phases, refetch } = useFetch<Phase[]>("/learning/my-learning");
  const [completing, setCompleting] = useState<string | null>(null);

  async function handleComplete(moduleId: string) {
    setCompleting(moduleId);
    await api.post(`/learning/modules/${moduleId}/complete`);
    setCompleting(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Learning</h1>
        <p className="text-slate-500 text-sm mt-0.5">Complete modules to earn XP and grow your skills</p>
      </div>

      {(phases ?? []).length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No learning content yet</p>
          <p className="text-slate-400 text-xs mt-1">Your mentor will assign modules soon.</p>
        </div>
      ) : (
        (phases ?? []).map((phase) => (
          <div key={phase.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
              <h2 className="text-base font-bold text-slate-900">{phase.name}</h2>
              {phase.description && <p className="text-slate-500 text-xs mt-0.5">{phase.description}</p>}
              <p className="text-blue-600 text-xs font-semibold mt-1">
                {phase.modules.filter(m => m.progress[0]?.status === 'COMPLETED').length}/{phase.modules.length} completed
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {phase.modules.map((mod) => {
                const status = mod.progress[0]?.status ?? 'AVAILABLE';
                const isCompleted = status === 'COMPLETED';
                return (
                  <div key={mod.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>
                        {isCompleted ? <CheckCircle size={20} /> : status === 'LOCKED' ? <Lock size={18} /> : <Play size={18} />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{mod.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {mod.duration && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock size={10} /> {mod.duration}m</span>}
                          <span className="text-[10px] text-blue-500 font-semibold">+{mod.points} XP</span>
                        </div>
                      </div>
                    </div>
                    {!isCompleted && (
                      <button onClick={() => handleComplete(mod.id)} disabled={completing === mod.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                        {completing === mod.id ? '...' : 'Complete'}
                      </button>
                    )}
                    {isCompleted && <span className="text-emerald-600 text-xs font-semibold">✓ Done</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
