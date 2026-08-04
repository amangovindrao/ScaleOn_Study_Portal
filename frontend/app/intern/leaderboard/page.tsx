"use client";

import { useMemo } from "react";
import { useFetch } from "@/app/lib/hooks";
import { useAuth } from "@/app/lib/auth-context";
import {
  Trophy,
  Flame,
  Medal,
  Crown,
  TrendingUp,
  Star,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

interface LeaderEntry {
  internId: string;
  totalXp: number;
  currentStreak: number;
  level: number;
  intern: {
    fullName: string;
    scaleonId: string;
    internshipRole: {
      name: string;
      code: string;
    } | null;
  };
}

export default function LeaderboardPage() {
  const { user } = useAuth();

  const { data: leaderboard } =
    useFetch<LeaderEntry[]>("/learning/leaderboard");

  const entries = leaderboard ?? [];

  const myIndex = useMemo(
    () =>
      entries.findIndex(
        (e) =>
          e.intern.scaleonId === user?.intern?.scaleonId
      ),
    [entries, user]
  );

  const myEntry =
    myIndex >= 0 ? entries[myIndex] : null;

  const myRank =
    myIndex >= 0 ? myIndex + 1 : "--";

  const nextRankXP =
    myIndex > 0
      ? entries[myIndex - 1].totalXp -
        (myEntry?.totalXp ?? 0)
      : 0;

  return (
    <div className="space-y-7">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">

              <Trophy
                size={24}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">

                Leaderboard

              </h1>

              <p className="text-slate-500 text-sm mt-1">

                Top performers ranked by XP earned

              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-3 flex-wrap">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50">

            This Month

            <ChevronDown size={15} />

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50">

            All Modules

            <ChevronDown size={15} />

          </button>

          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm hover:bg-slate-50">

            <RefreshCw size={16} />

          </button>

        </div>

      </div>

      {/* KPI CARDS */}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Rank */}

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">

                My Rank

              </p>

              <h2 className="text-4xl font-black mt-2">

                #{myRank}

              </h2>

              <p className="text-xs text-blue-500 mt-2">

                out of {entries.length} interns

              </p>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">

              <Crown
                size={28}
                className="text-blue-600"
              />

            </div>

          </div>

        </div>

        {/* XP */}

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">

                My XP

              </p>

              <h2 className="text-4xl font-black mt-2 text-amber-600">

                {myEntry?.totalXp ?? 0}

              </h2>

              <p className="text-xs text-slate-400 mt-2">

                Experience Points

              </p>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">

              <Star
                size={28}
                className="text-amber-500"
              />

            </div>

          </div>

        </div>

        {/* Next Rank */}

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500 text-sm">

                XP To Next Rank

              </p>

              <h2 className="text-4xl font-black mt-2 text-emerald-600">

                {nextRankXP > 0 ? nextRankXP : 0}

              </h2>

              <p className="text-xs text-slate-400 mt-2">

                Keep learning 🚀

              </p>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">

              <TrendingUp
                size={28}
                className="text-emerald-600"
              />

            </div>

          </div>

        </div>

      </div>

      {/* LEADERBOARD TABLE STARTS HERE */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">

          <div>

            <h2 className="font-bold text-lg">

              Top Performers

            </h2>

            <p className="text-sm text-slate-500">

              Updated in real-time

            </p>

          </div>

          <div className="text-xs text-slate-400">

            {entries.length} Interns

          </div>

        </div>

        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 text-xs uppercase font-semibold tracking-wider text-slate-500">

          <div className="col-span-1">Rank</div>

          <div className="col-span-5">Intern</div>

          <div className="col-span-2 text-center">Level</div>

          <div className="col-span-2 text-center">XP</div>

          <div className="col-span-2 text-center">

            Streak

          </div>

        </div>
                {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Trophy className="text-amber-500" size={34} />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              No leaderboard data yet
            </h3>

            <p className="text-slate-500 mt-2 text-center max-w-md">
              Complete learning modules, attend live sessions and finish
              assignments to earn XP and climb the leaderboard.
            </p>
          </div>
        ) : (
          <>
            {entries.map((entry, i) => {
              const rank = i + 1;

              const isMe =
                entry.intern.scaleonId === user?.intern?.scaleonId;

              const medal =
                rank === 1
                  ? "🥇"
                  : rank === 2
                  ? "🥈"
                  : rank === 3
                  ? "🥉"
                  : null;

              return (
                <div
                  key={entry.internId}
                  className={`grid grid-cols-12 items-center px-6 py-5 border-b border-slate-100 transition-all duration-300 hover:bg-slate-50 ${
                    isMe
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  {/* Rank */}

                  <div className="col-span-1">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="font-bold text-slate-500">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* User */}

                  <div className="col-span-5 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm
                      ${
                        rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : rank === 2
                          ? "bg-gradient-to-br from-slate-400 to-slate-600"
                          : rank === 3
                          ? "bg-gradient-to-br from-orange-400 to-orange-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}
                    >
                      {entry.intern.fullName
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">
                          {entry.intern.fullName}
                        </p>

                        {isMe && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500">
                        {entry.intern.internshipRole?.name}
                      </p>
                    </div>
                  </div>

                  {/* Level */}

                  <div className="col-span-2 flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                      Lv. {entry.level}
                    </span>
                  </div>

                  {/* XP */}

                  <div className="col-span-2 flex justify-center">
                    <div className="text-center">
                      <p className="font-bold text-slate-900">
                        {entry.totalXp.toLocaleString()}
                      </p>

                      <p className="text-xs text-slate-400">
                        XP
                      </p>
                    </div>
                  </div>

                  {/* Streak */}

                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-full border border-orange-100">
                      <Flame
                        className="text-orange-500"
                        size={15}
                      />

                      <span className="font-semibold text-orange-600">
                        {entry.currentStreak}d
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer */}

            <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold">
                  {entries.length}
                </span>{" "}
                interns
              </p>

              <div className="flex items-center gap-2">

                <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-100 transition">
                  Previous
                </button>

                <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                  1
                </button>

                <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-100 transition">
                  Next
                </button>

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}