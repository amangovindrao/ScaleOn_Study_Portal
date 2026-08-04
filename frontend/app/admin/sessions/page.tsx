"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge } from "@/app/components/ui/badge";
import { Activity, ShieldCheck, RefreshCw } from "lucide-react";

interface Session {
  id: string; ipAddress: string | null; browser: string | null;
  os: string | null; device: string | null; country: string | null;
  isActive: boolean; lastActivityAt: string; expiresAt: string; createdAt: string;
  userAccount: { id: string; username: string | null; email: string; userType: string };
}

interface Pagination { page: number; pageSize: number; total: number; totalPages: number }

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);

  const load = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20", activeOnly: String(activeOnly) });
      const res = await api.get<Session[]>(`/sessions?${params}`);
      if (res.success) {
        setSessions((res.data as Session[]) ?? []);
        setPagination(res.pagination ?? { page, pageSize: 20, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, activeOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function terminate(id: string) {
    setTerminating(id);
    await api.delete(`/sessions/${id}`);
    setTerminating(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {pagination.total} {activeOnly ? "active" : "total"} {pagination.total === 1 ? "session" : "sessions"} fetched from database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing || loading}
            title="Refresh Live Data"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-purple-600" : ""} />
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-xl w-fit">
            <button
              onClick={() => { setActiveOnly(true); setPage(1); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeOnly
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Activity size={14} />
              <span>Active Sessions</span>
              {activeOnly && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
                  {pagination.total}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveOnly(false); setPage(1); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                !activeOnly
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <ShieldCheck size={14} />
              <span>All Sessions</span>
              {!activeOnly && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
                  {pagination.total}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            {activeOnly ? "No active sessions found in database." : "No sessions found in database."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">IP</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Browser / OS</th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">Country</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Last Active</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <p className="text-slate-900 text-sm">{s.userAccount.username ?? s.userAccount.email}</p>
                        <p className="text-slate-500 text-xs">{s.userAccount.userType}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-500 text-xs font-mono">{s.ipAddress ?? "—"}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-slate-600 text-xs">{s.browser ?? "—"}</p>
                        <p className="text-slate-400 text-xs">{s.os ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell text-slate-500 text-xs">{s.country ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={s.isActive ? "green" : "gray"}>{s.isActive ? "Active" : "Expired"}</Badge>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-500 text-xs">
                        {new Date(s.lastActivityAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {s.isActive && (
                          <button onClick={() => terminate(s.id)} disabled={terminating === s.id}
                            className="text-xs text-red-400 hover:text-red-300 transition disabled:opacity-50">
                            {terminating === s.id ? "…" : "Terminate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-slate-500 text-xs">Page {page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition">← Prev</button>
                  <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
