"use client";

import { useAuth } from "@/app/lib/auth-context";
import { useFetch } from "@/app/lib/hooks";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Flame, TrendingUp, CalendarDays, BookOpen, Zap,
  Trophy, ClipboardList, Video, HelpCircle, Star,
  ChevronRight, Activity, Crown, Medal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreakData {
  streak: { currentStreak: number; longestStreak: number; totalXp: number; level: number };
  recentDays: { date: string; xpEarned: number }[];
}

interface LeaderEntry {
  internId: string;
  totalXp: number;
  currentStreak: number;
  level: number;
  intern: {
    fullName: string;
    scaleonId: string;
    internshipRole: { name: string; code: string } | null;
  };
}

interface LearningPhase {
  id: string;
  name: string;
  modules: {
    id: string;
    title: string;
    points: number;
    duration: number | null;
    progress: { status: string }[];
  }[];
}

interface InternOfWeek {
  internId: string;
  weekLabel: string;  // e.g. "Week of Jul 28"
  weekXp: number;
  reason: string;
  intern: { fullName: string; scaleonId: string; internshipRole: { name: string; code: string } | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function xpProgress(totalXp: number, level: number) {
  const base = (level - 1) * 100;
  const top  = level * 100;
  return Math.min(100, Math.round(((totalXp - base) / (top - base)) * 100));
}

/** XP earned in the past 7 calendar days */
function weekXp(days: { date: string; xpEarned: number }[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return days
    .filter((d) => new Date(d.date).getTime() >= cutoff)
    .reduce((s, d) => s + d.xpEarned, 0);
}

/** Simple animated counter hook */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(from + (target - from) * p));
      if (p < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

// ─── Tips modal ──────────────────────────────────────────────────────────────

const TIPS = [
  { icon: "📘", title: "Complete daily modules", desc: "Each module earns XP. Finishing one every day also builds your streak multiplier." },
  { icon: "🔥", title: "Keep your streak alive", desc: "Log in and complete at least one module daily. Longer streaks push you up the leaderboard faster." },
  { icon: "📋", title: "Submit assignments on time", desc: "Approved assignments add score to your overall progress, boosting your rank." },
  { icon: "📺", title: "Attend live sessions", desc: "Live session attendance is tracked and awards bonus XP that counts toward your weekly score." },
  { icon: "⭐", title: "Aim for top 3 weekly XP", desc: "The intern with the highest XP in a week wins Intern of the Week recognition on the dashboard." },
  { icon: "🏆", title: "Check the leaderboard often", desc: "See how close the next rank is — sometimes just one module separates you from moving up." },
];

function TipsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-sm font-bold text-slate-900">How to boost your rank 🚀</h2>
            <p className="text-xs text-slate-400 mt-0.5">Simple steps to earn more XP and climb the leaderboard</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Tips list */}
        <div className="p-4 space-y-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl">
              <span className="text-xl leading-none mt-0.5 flex-shrink-0">{tip.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4">
          <Link
            href="/intern/learning"
            onClick={onClose}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition shadow-sm shadow-blue-200"
          >
            Start earning XP now →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InternDashboardPage() {
  const { user }  = useAuth();
  const intern    = user?.intern;
  const [showTips, setShowTips] = useState(false);

  const { data: streakData,    loading: streakLoading } = useFetch<StreakData>("/learning/my-streak");
  const { data: leaderboardRaw, loading: lbLoading }     = useFetch<LeaderEntry[]>("/learning/leaderboard");
  const { data: iotw,           loading: iotwLoading }   = useFetch<InternOfWeek | null>("/learning/intern-of-week");
  const { data: learningPhases }                         = useFetch<LearningPhase[]>("/learning/my-learning");

  const progress   = intern?.overallProgress  ?? 0;
  const attendance = intern?.attendancePercent ?? 0;
  const streak     = streakData?.streak ?? { currentStreak: 0, longestStreak: 0, totalXp: 0, level: 1 };
  const days       = streakData?.recentDays ?? [];
  const leaderboard = (leaderboardRaw ?? []).slice(0, 5);
  const myRank     = (leaderboardRaw ?? []).findIndex(
    (e) => e.intern.scaleonId === intern?.scaleonId
  );
  const thisWeekXp = weekXp(days);
  const isIotw     = iotw?.intern.scaleonId === intern?.scaleonId;

  const firstName  = intern?.fullName?.split(" ")[0] ?? "Intern";
  const initials   = (intern?.fullName ?? "U").slice(0, 2).toUpperCase();
  const levelPct   = xpProgress(streak.totalXp, streak.level);
  const xpToNext   = 100 - (streak.totalXp % 100);
  const maxXp      = Math.max(...days.map((d) => d.xpEarned), 1);
  const chartDays  = [...days].reverse();

  // animated counters
  const cXp       = useCountUp(streak.totalXp);
  const cWeekXp   = useCountUp(thisWeekXp);
  const cProgress = useCountUp(Math.round(progress));
  const cRank     = useCountUp(myRank >= 0 ? myRank + 1 : 0);

  // Continue course — find first non-completed module the intern has touched
  const continueModule = (() => {
    for (const phase of (learningPhases ?? [])) {
      for (const mod of phase.modules) {
        const status = mod.progress[0]?.status ?? "AVAILABLE";
        if (status === "IN_PROGRESS") return { phase, mod, status };
      }
    }
    // fallback: first AVAILABLE module they haven't started
    for (const phase of (learningPhases ?? [])) {
      for (const mod of phase.modules) {
        const status = mod.progress[0]?.status ?? "AVAILABLE";
        if (status === "AVAILABLE" || status === "LOCKED") return { phase, mod, status };
      }
    }
    return null;
  })();
  // Only show continue panel if there is at least one published phase with modules
  const hasLearningContent = (learningPhases ?? []).some((p) => p.modules.length > 0);
  const completedModules = (learningPhases ?? []).reduce(
    (acc, p) => acc + p.modules.filter((m) => m.progress[0]?.status === "COMPLETED").length, 0
  );
  const totalModules = (learningPhases ?? []).reduce((acc, p) => acc + p.modules.length, 0);

  return (
    <div className="space-y-5">
      {showTips && <TipsModal onClose={() => setShowTips(false)} />}

      {/* ── 🏆 Intern of the Week spotlight ─────────────────────────────── */}
      {!iotwLoading && iotw && (
        <div className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm ${
          isIotw
            ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200"
            : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
        }`}>
          {/* shimmer strip */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400" />
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-md ${
                isIotw
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                  : "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600"
              }`}>
                {iotw.intern.fullName.slice(0, 2).toUpperCase()}
              </div>
              <Crown size={14} className="absolute -top-2 -right-1 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  🏆 Intern of the Week
                </span>
                <span className="text-[10px] text-slate-400">{iotw.weekLabel}</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1">
                {iotw.intern.fullName}
                {isIotw && <span className="ml-2 text-amber-600 text-sm">— That&apos;s you! 🎉</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {iotw.intern.internshipRole?.name} ·{" "}
                <span className="font-semibold text-amber-600">{iotw.weekXp} XP this week</span>
              </p>
              {iotw.reason && (
                <p className="text-xs text-slate-400 mt-1 italic">&quot;{iotw.reason}&quot;</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {initials}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none shadow">
                L{streak.level}
              </span>
              {isIotw && (
                <Crown size={13} className="absolute -top-2 -right-1 text-amber-500" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Welcome back, {firstName}! 👋</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {intern?.internshipRole?.name} ·{" "}
                <span className="font-mono text-slate-400">{intern?.scaleonId}</span>
              </p>
              {intern?.batch && (
                <span className="inline-block mt-1 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5">
                  {intern.batch.name}
                </span>
              )}
            </div>
          </div>
          {/* Streak pill */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-5 py-4 self-start sm:self-auto min-w-[200px]">
            {/* Flame + streak count */}
            <div className="flex flex-col items-center gap-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${streak.currentStreak > 0 ? "bg-orange-100" : "bg-slate-100"}`}>
                <Flame size={22} className={streak.currentStreak > 0 ? "text-orange-500" : "text-slate-400"} />
              </div>
              <p className={`text-2xl font-black leading-none ${streak.currentStreak > 0 ? "text-orange-600" : "text-slate-400"}`}>
                {streak.currentStreak}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">day streak</p>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {/* Best streak */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Best</span>
                <span className="text-xs font-bold text-orange-500">
                  {streak.longestStreak > 0 ? `${streak.longestStreak}d` : "—"}
                </span>
              </div>
              <div className="w-full h-px bg-orange-100" />
              {/* Total XP */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Total XP</span>
                <span className={`text-sm font-black ${streak.totalXp > 0 ? "text-amber-600" : "text-slate-400"}`}>
                  {cXp > 0 ? cXp : streak.totalXp > 0 ? cXp : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Level bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">
              Level {streak.level} → {streak.level + 1}
            </span>
            <span className="text-xs font-bold text-amber-600">{xpToNext} XP to next level</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 4-stat row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<TrendingUp size={16} />}  label="Overall Progress"   value={`${cProgress}%`}              sub="of internship"          color="blue" />
        <StatCard icon={<CalendarDays size={16} />} label="Attendance"         value={`${Math.round(attendance)}%`} sub="sessions attended"      color="emerald" />
        <StatCard icon={<Zap size={16} />}          label="This Week"          value={`${cWeekXp} XP`}              sub="past 7 days"            color="amber" />
        <div className="relative">
          <StatCard
            icon={<Medal size={16} />}
            label="Your Rank"
            value={myRank >= 0 ? `#${cRank}` : "—"}
            sub={`of ${(leaderboardRaw ?? []).length} interns`}
            color="rose"
          />
          <button
            onClick={() => setShowTips(true)}
            className="absolute bottom-2 right-2 text-[9px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded-full transition"
          >
            Boost ↑
          </button>
        </div>
      </div>

      {/* ── Continue Course (only if learning content exists) ──────────── */}
      {hasLearningContent && continueModule && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Module icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                continueModule.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <BookOpen size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    continueModule.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {continueModule.status === "IN_PROGRESS" ? "In Progress" : "Up Next"}
                  </span>
                  <span className="text-[10px] text-slate-400">{continueModule.phase.name}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {continueModule.mod.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                  {continueModule.mod.duration && (
                    <span>⏱ {continueModule.mod.duration}m</span>
                  )}
                  <span>+{continueModule.mod.points} XP</span>
                  {totalModules > 0 && (
                    <span>{completedModules}/{totalModules} completed</span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/intern/learning"
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              {continueModule.status === "IN_PROGRESS" ? "Continue →" : "Start →"}
            </Link>
          </div>
          {/* Mini progress bar across modules */}
          {totalModules > 0 && (
            <div className="mt-4">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max((completedModules / totalModules) * 100, completedModules > 0 ? 2 : 0)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {completedModules} of {totalModules} modules completed
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Internship progress ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Internship Progress</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {intern?.currentPhase ? `Currently in ${intern.currentPhase}` : "Phase 1 · Getting started"}
            </p>
          </div>
          <span className="text-lg font-black text-blue-600">{cProgress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
          <span>Start</span><span>50%</span><span>Complete</span>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 7-day activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <Activity size={15} className="text-blue-500" /> 7-Day Activity
          </h2>
          <p className="text-xs text-slate-400 mb-4">XP earned per day</p>
          {streakLoading ? (
            <div className="flex items-end gap-1.5 h-24">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-t animate-pulse" style={{ height: "40%" }} />
              ))}
            </div>
          ) : chartDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-slate-400">
              <BookOpen size={24} className="mb-2 opacity-40" />
              <p className="text-xs">No activity yet — complete a module!</p>
            </div>
          ) : (
            <div className="flex items-end gap-1.5" style={{ height: "88px" }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const day = chartDays[i];
                const xp  = day?.xpEarned ?? 0;
                const pct = Math.max((xp / maxXp) * 100, xp > 0 ? 8 : 3);
                const date = day ? new Date(day.date) : null;
                const label = date
                  ? date.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)
                  : ["M","T","W","T","F","S","S"][i];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
                    <div className="w-full flex items-end flex-1">
                      <div
                        title={`${xp} XP`}
                        className={`w-full rounded-t transition-all duration-500 ${xp > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-slate-100"}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* This week summary */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">This week</span>
            <span className="text-sm font-bold text-blue-600">{cWeekXp} XP</span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Trophy size={15} className="text-amber-500" /> Leaderboard
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTips(true)}
                className="text-xs text-blue-500 hover:text-blue-700 font-semibold underline underline-offset-2 transition"
              >
                How to improve?
              </button>
              <Link href="/intern/leaderboard" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                See all <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          {lbLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-slate-400">
              <Trophy size={24} className="mb-2 opacity-40" />
              <p className="text-xs">Complete modules to appear here!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((entry, i) => {
                const isMe = entry.intern.scaleonId === intern?.scaleonId;
                return (
                  <div
                    key={entry.internId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isMe ? "bg-blue-50 border border-blue-100 shadow-sm" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-slate-100 text-slate-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                    }`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {entry.intern.fullName}
                        {isMe && <span className="ml-1 text-blue-500 text-xs">(you)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {entry.intern.internshipRole?.code} · Lv {entry.level}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 flex-shrink-0">{entry.totalXp} XP</span>
                  </div>
                );
              })}
              {myRank >= 5 && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 mt-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-blue-100 text-blue-600 flex-shrink-0">#{myRank + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {intern?.fullName} <span className="text-blue-500 text-xs">(you)</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-600">{streak.totalXp} XP</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickAction href="/intern/learning"    icon={<BookOpen size={20} />}     label="Learning"    color="blue"    badge={intern?.currentModule ? "Continue" : undefined} />
          <QuickAction href="/intern/leaderboard" icon={<Trophy size={20} />}        label="Leaderboard" color="amber"   badge={myRank >= 0 ? `#${myRank + 1}` : undefined} />
          <QuickAction href="/intern/live"        icon={<Video size={20} />}         label="Live"        color="rose" />
          <QuickAction href="/intern/assignments" icon={<ClipboardList size={20} />} label="Assignments" color="emerald" />
          <QuickAction href="/intern/profile"     icon={<Star size={20} />}          label="Profile"     color="purple" />
          <QuickAction href="/intern/support"     icon={<HelpCircle size={20} />}    label="Help"        color="slate" />
        </div>
      </div>

      {/* ── Tips ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="text-blue-900 text-sm font-bold mb-3 flex items-center gap-2">
          <Zap size={14} className="text-blue-500" /> Tips to level up faster
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { e: "🔥", t: "Complete at least one module daily to keep your streak alive" },
            { e: "📺", t: "Attend live sessions — they award bonus XP" },
            { e: "📋", t: "Submit assignments on time for a higher score and faster progress" },
            { e: "🏆", t: "Top the leaderboard to become Intern of the Week!" },
          ].map(({ e, t }) => (
            <div key={t} className="flex items-start gap-2.5 bg-white/60 rounded-xl px-3.5 py-2.5">
              <span className="text-base leading-none mt-0.5">{e}</span>
              <p className="text-xs text-blue-800 leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string;
}) {
  const accent: Record<string, string> = {
    blue: "border-t-blue-500", emerald: "border-t-emerald-500",
    amber: "border-t-amber-400", rose: "border-t-rose-500",
  };
  const ic: Record<string, string> = {
    blue: "text-blue-500", emerald: "text-emerald-500",
    amber: "text-amber-500", rose: "text-rose-500",
  };
  return (
    <div className={`bg-white border border-slate-200 border-t-2 ${accent[color]} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`${ic[color]} mb-2`}>{icon}</div>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, color, badge }: {
  href: string; icon: React.ReactNode; label: string; color: string; badge?: string;
}) {
  const hover: Record<string, string> = {
    blue: "hover:border-blue-300 hover:bg-blue-50", amber: "hover:border-amber-300 hover:bg-amber-50",
    rose: "hover:border-rose-300 hover:bg-rose-50", emerald: "hover:border-emerald-300 hover:bg-emerald-50",
    purple: "hover:border-purple-300 hover:bg-purple-50", slate: "hover:border-slate-300 hover:bg-slate-50",
  };
  const ic: Record<string, string> = {
    blue: "text-blue-600", amber: "text-amber-600", rose: "text-rose-600",
    emerald: "text-emerald-600", purple: "text-purple-600", slate: "text-slate-500",
  };
  const bc: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700", amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700", emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700", slate: "bg-slate-100 text-slate-600",
  };
  return (
    <Link href={href}
      className={`relative bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md ${hover[color]}`}>
      {badge && (
        <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${bc[color]}`}>
          {badge}
        </span>
      )}
      <div className={ic[color]}>{icon}</div>
      <p className="text-[10px] font-semibold text-slate-700 text-center leading-tight">{label}</p>
    </Link>
  );
}
