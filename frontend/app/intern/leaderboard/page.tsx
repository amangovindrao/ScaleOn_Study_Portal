"use client";

import { useFetch } from "@/app/lib/hooks";
import { useAuth } from "@/app/lib/auth-context";
import { Trophy, Flame, Medal } from "lucide-react";

interface LeaderEntry { internId: string; totalXp: number; currentStreak: number; level: number; intern: { fullName: string; scaleonId: string; internshipRole: { name: string; code: string } | null } }

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data: leaderboard } = useFetch<LeaderEntry[]>("/learning/leaderboard");
  const entries = leaderboard ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Trophy size={22} className="text-amber-500" /> Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Top performers ranked by XP earned</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <Trophy size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No leaderboard data yet</p>
          <p className="text-slate-400 text-xs mt-1">Complete modules to appear here!</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {entries.map((entry, i) => {
              const isMe = entry.intern.scaleonId === user?.intern?.scaleonId;
              const rank = i + 1;
              return (
                <div key={entry.internId} className={`px-6 py-4 flex items-center justify-between ${isMe ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-slate-100 text-slate-600' : rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                      {rank <= 3 ? <Medal size={18} /> : `#${rank}`}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.intern.fullName} {isMe && <span className="text-blue-500 text-xs">(You)</span>}</p>
                      <p className="text-xs text-slate-400">{entry.intern.internshipRole?.name ?? ''} · Lvl {entry.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{entry.totalXp} XP</p>
                      <p className="text-[10px] text-orange-500 flex items-center gap-0.5 justify-end"><Flame size={10} />{entry.currentStreak}d</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
