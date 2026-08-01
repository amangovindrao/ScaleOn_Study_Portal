"use client";

import { useAuth } from "@/app/lib/auth-context";
import { useFetch } from "@/app/lib/hooks";
import Link from "next/link";
import { Flame, TrendingUp, Calendar, BookOpen, Award, Zap, Trophy, ClipboardList, Video, HelpCircle } from "lucide-react";

interface StreakData { streak: { currentStreak: number; longestStreak: number; totalXp: number; level: number }; recentDays: { date: string; xpEarned: number }[] }

export default function InternDashboardPage() {
  const { user } = useAuth();
  const intern = user?.intern;
  const { data: streakData } = useFetch<StreakData>("/learning/my-streak");

  const progress = intern?.overallProgress ?? 0;
  const attendance = intern?.attendancePercent ?? 0;
  const streak = streakData?.streak ?? { currentStreak: 0, longestStreak: 0, totalXp: 0, level: 1 };

  return (
    <div className="space-y-6">
      {/* Welcome + Streak banner */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/25">
              {(intern?.fullName ?? "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Welcome back, {intern?.fullName?.split(" ")[0]}!</h1>
              <p className="text-slate-500 text-sm">{intern?.internshipRole?.name} · {intern?.scaleonId}</p>
            </div>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl px-5 py-3">
            <Flame size={28} className="text-orange-500" />
            <div>
              <p className="text-2xl font-black text-orange-600">{streak.currentStreak}</p>
              <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="w-px h-8 bg-orange-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{streak.totalXp}</p>
              <p className="text-[10px] text-amber-500 font-semibold uppercase">XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<TrendingUp size={18} />} label="Progress" value={`${progress}%`} color="blue" />
        <StatCard icon={<Calendar size={18} />} label="Attendance" value={`${attendance}%`} color="emerald" />
        <StatCard icon={<Zap size={18} />} label="Level" value={String(streak.level)} color="amber" />
        <StatCard icon={<Award size={18} />} label="Best Streak" value={`${streak.longestStreak}d`} color="orange" />
        <StatCard icon={<BookOpen size={18} />} label="Phase" value={intern?.currentPhase ?? "1"} color="purple" />
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Internship Progress</h2>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-700 shadow-inner" style={{ width: `${Math.max(progress, 2)}%` }} />
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickAction href="/intern/learning" icon={<BookOpen size={20} />} label="My Learning" color="blue" />
        <QuickAction href="/intern/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" color="amber" />
        <QuickAction href="/intern/live" icon={<Video size={20} />} label="Live Sessions" color="rose" />
        <QuickAction href="/intern/assignments" icon={<ClipboardList size={20} />} label="Assignments" color="emerald" />
        <QuickAction href="/intern/profile" icon={<Award size={20} />} label="Profile" color="purple" />
        <QuickAction href="/intern/support" icon={<HelpCircle size={20} />} label="Help" color="slate" />
      </div>

      {/* Tips */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
        <h3 className="text-blue-900 text-sm font-semibold mb-2">💡 Tips to boost your streak</h3>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>Complete at least one module daily to keep your streak alive</li>
          <li>Attend live sessions for bonus XP</li>
          <li>Submit assignments on time for higher scores</li>
          <li>Top the leaderboard to earn recognition</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-t-blue-500 bg-blue-50/50", emerald: "border-t-emerald-500 bg-emerald-50/50",
    amber: "border-t-amber-500 bg-amber-50/50", orange: "border-t-orange-500 bg-orange-50/50",
    purple: "border-t-purple-500 bg-purple-50/50",
  };
  return (
    <div className={`bg-white border border-slate-200/60 border-t-2 ${colors[color]} rounded-xl p-3 shadow-sm`}>
      <div className="text-slate-400 mb-1">{icon}</div>
      <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-slate-900 text-lg font-bold">{value}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "hover:border-blue-300 hover:bg-blue-50/50 text-blue-600",
    amber: "hover:border-amber-300 hover:bg-amber-50/50 text-amber-600",
    rose: "hover:border-rose-300 hover:bg-rose-50/50 text-rose-600",
    emerald: "hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-600",
    purple: "hover:border-purple-300 hover:bg-purple-50/50 text-purple-600",
    slate: "hover:border-slate-300 hover:bg-slate-50/50 text-slate-600",
  };
  return (
    <Link href={href} className={`bg-white border border-slate-200/60 rounded-xl p-4 text-center transition-all duration-200 shadow-sm hover:shadow-md ${colors[color]}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xs font-semibold text-slate-700">{label}</p>
    </Link>
  );
}
