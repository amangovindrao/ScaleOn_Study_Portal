"use client";

import { useState, useEffect, useMemo } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import {
  Trophy, Medal, Award, Calendar, Sparkles, CheckCircle2,
  AlertCircle, Search, Trash2, UserCheck, Flame, Star, X
} from "lucide-react";

interface InternOption {
  id: string;
  scaleonId: string;
  fullName: string;
  internshipRole?: { name: string; code: string } | null;
}

interface LeaderboardItem {
  id: string;
  internId: string;
  totalXp: number;
  intern: {
    id: string;
    fullName: string;
    scaleonId: string;
    internshipRole?: { name: string; code: string } | null;
  };
}

interface InternOfWeekRecord {
  id: string;
  internId: string;
  weekStart: string;
  weekLabel: string;
  weekXp: number;
  reason: string;
  createdAt: string;
  intern: {
    id: string;
    fullName: string;
    scaleonId: string;
    internshipRole?: { name: string; code: string } | null;
  };
}

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default function AdminInternOfWeekPage() {
  const { data: currentWinner, refetch: refetchCurrent } = useFetch<InternOfWeekRecord | null>("/learning/intern-of-week");
  const { data: historyData, refetch: refetchHistory } = useFetch<InternOfWeekRecord[]>("/learning/intern-of-week/history");
  const { data: leaderboard } = useFetch<LeaderboardItem[]>("/learning/leaderboard");
  const { data: internsData } = useFetch<InternOption[]>("/interns?pageSize=100");

  // Form State
  const [selectedInternId, setSelectedInternId] = useState("");
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [weekXp, setWeekXp] = useState<number | "">(350);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter state for history table
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Combined Intern List for dropdown
  const internOptions = useMemo(() => {
    const list: InternOption[] = [];
    const seen = new Set<string>();

    if (Array.isArray(internsData)) {
      internsData.forEach((i) => {
        if (!seen.has(i.id)) {
          seen.add(i.id);
          list.push(i);
        }
      });
    }
    if (Array.isArray(leaderboard)) {
      leaderboard.forEach((lb) => {
        if (lb.intern && !seen.has(lb.intern.id)) {
          seen.add(lb.intern.id);
          list.push({
            id: lb.intern.id,
            scaleonId: lb.intern.scaleonId,
            fullName: lb.intern.fullName,
            internshipRole: lb.intern.internshipRole,
          });
        }
      });
    }
    return list;
  }, [internsData, leaderboard]);

  // Pre-fill XP if leader is selected
  useEffect(() => {
    if (selectedInternId && Array.isArray(leaderboard)) {
      const found = leaderboard.find((l) => l.intern?.id === selectedInternId || l.internId === selectedInternId);
      if (found) {
        setWeekXp(found.totalXp > 0 ? Math.min(found.totalXp, 500) : 350);
      }
    }
  }, [selectedInternId, leaderboard]);

  const history = historyData ?? [];
  const totalAwarded = history.length;
  const highestXp = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.max(...history.map((h) => h.weekXp));
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.intern?.fullName.toLowerCase().includes(q) ||
        item.intern?.scaleonId.toLowerCase().includes(q) ||
        item.weekLabel.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  async function handleSetInternOfWeek(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInternId) {
      setToast({ message: "Please select an intern", type: "error" });
      return;
    }
    if (!weekStart) {
      setToast({ message: "Please select a week start date", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/learning/intern-of-week", {
        internId: selectedInternId,
        weekStart,
        weekXp: Number(weekXp || 0),
        reason: reason.trim(),
      });

      if (res.success) {
        setToast({ message: "Intern of the Week updated successfully!", type: "success" });
        setReason("");
        refetchCurrent();
        refetchHistory();
      } else {
        setToast({ message: res.error?.message ?? "Failed to set Intern of the Week", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this Intern of the Week record?")) return;
    setDeletingId(id);
    try {
      const res = await api.delete(`/learning/intern-of-week/${id}`);
      if (res.success) {
        setToast({ message: "Record deleted", type: "success" });
        refetchCurrent();
        refetchHistory();
      } else {
        setToast({ message: res.error?.message ?? "Failed to delete", type: "error" });
      }
    } catch {
      setToast({ message: "Error deleting record", type: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              🏆
            </div>
            <h1 className="text-xl font-bold text-slate-900">Intern of the Week Management</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Award weekly top performers, write recognition notes, and track historical winners.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Winner</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {currentWinner?.intern?.fullName ?? "No Winner Set"}
            </p>
            {currentWinner?.intern?.scaleonId && (
              <p className="text-[11px] text-amber-600 font-medium">{currentWinner.intern.scaleonId}</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
            <Medal size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Awarded</p>
            <p className="text-lg font-bold text-slate-900">{totalAwarded} Winners</p>
            <p className="text-[11px] text-slate-400">All-time count</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Weekly XP</p>
            <p className="text-lg font-bold text-slate-900">{highestXp} XP</p>
            <p className="text-[11px] text-emerald-600 font-medium">Record recognition</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Active Winner Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crown New Winner Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Crown Weekly Winner</h2>
          </div>

          <form onSubmit={handleSetInternOfWeek} className="space-y-4">
            {/* Intern Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Select Winner Intern *
              </label>
              <select
                value={selectedInternId}
                onChange={(e) => setSelectedInternId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/15"
              >
                <option value="">-- Select an intern from portal --</option>
                {internOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.fullName} ({opt.scaleonId}) {opt.internshipRole?.code ? `· ${opt.internshipRole.code}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Week Start Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Week Start Date (Monday) *
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/15"
                  />
                </div>
              </div>

              {/* Weekly XP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Weekly XP Earned *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={weekXp}
                  onChange={(e) => setWeekXp(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 350"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/15"
                />
              </div>
            </div>

            {/* Quick XP Presets */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick Presets:</span>
              {[250, 350, 500, 750].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setWeekXp(preset)}
                  className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                    weekXp === preset
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  +{preset} XP
                </button>
              ))}
            </div>

            {/* Reason / Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Recognition Note / Reason
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Topped the weekly leaderboard with 100% module completion and outstanding assignment submissions."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/15"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Winner...
                </>
              ) : (
                <>
                  <Trophy size={16} /> Set Intern of the Week
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Winner Showcase */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-lg text-white">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Star size={12} className="fill-amber-400 text-amber-400" /> Active Winner
              </span>
              <span className="text-xs font-mono text-slate-400">{currentWinner?.weekLabel ?? "No record"}</span>
            </div>

            {currentWinner ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentWinner.intern?.fullName}</h3>
                    <p className="text-xs text-amber-300 font-mono mt-0.5">{currentWinner.intern?.scaleonId}</p>
                    {currentWinner.intern?.internshipRole?.name && (
                      <span className="inline-block mt-1 text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                        {currentWinner.intern.internshipRole.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Weekly XP Earned:</span>
                    <span className="font-bold text-amber-400">+{currentWinner.weekXp} XP</span>
                  </div>
                  {currentWinner.reason && (
                    <p className="text-xs text-slate-300 italic border-t border-slate-700/40 pt-2">
                      &quot;{currentWinner.reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Trophy size={36} className="mx-auto text-slate-600 opacity-60" />
                <p className="text-sm font-medium text-slate-300">No active winner selected yet</p>
                <p className="text-xs">Use the form on the left to set this week&apos;s winner.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ScaleOn Recognition System</span>
            <UserCheck size={14} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Winners History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Winners History
            </h2>
            <p className="text-xs text-slate-500">Historical log of all crowned Intern of the Week winners.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <Award size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No winner records found</p>
            {searchQuery && <p className="text-xs text-slate-400">Try adjusting your search query.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Week</th>
                  <th className="py-3 px-4 font-semibold">Winner Intern</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold text-right">Weekly XP</th>
                  <th className="py-3 px-4 font-semibold">Recognition Note</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {rec.weekLabel}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{rec.intern?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.intern?.scaleonId}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium text-[11px]">
                        {rec.intern?.internshipRole?.name ?? "Intern"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 whitespace-nowrap">
                      +{rec.weekXp} XP
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={rec.reason}>
                      {rec.reason ? `"${rec.reason}"` : "—"}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        className="text-slate-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
