import { Flame } from "lucide-react";
import { LearningStreak } from "../types";

export function LearningHeader({ firstName, streak }: { firstName: string; streak: LearningStreak }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Continue learning, {firstName}!</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pick up where you left off or explore a new course.</p>
        </div>
        <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl px-5 py-3">
          <Flame size={26} className="text-orange-500" />
          <div>
            <p className="text-2xl font-black text-orange-600">{streak.currentStreak}</p>
            <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider">Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
