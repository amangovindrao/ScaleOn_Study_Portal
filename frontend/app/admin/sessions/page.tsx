"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge } from "@/app/components/ui/badge";

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
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20", activeOnly: String(activeOnly) });
    const res = await api.get<Session[]>(`/sessions?${params}`);
    if (res.success) {
      setSessions((res.data as Session[]) ?? []);
      setPagination(res.pagination ?? { page, pageSize: 20, total: 0, totalPages: 0 });
    }
    setLoading(false);
  }, [page, activeOnly]);

  useEffect(() => { load(); }, [load]);

  async function terminate(id: string) {
    setTerminating(id);
    await api.delete(`/sessions/${id}`);
    setTerminating(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} sessions</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={activeOnly} onChange={(e) => { setActiveOnly(e.target.checked); setPage(1); }}
            className="accent-purple-500 w-4 h-4" />
          <span className="text-sm text-slate-600">Active only</span>
        </label>
      </div>

      <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No sessions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">IP</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Browser / OS</th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">Country</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Last Active</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/2 transition">
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
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/8">
                <p className="text-slate-500 text-xs">Page {page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition">← Prev</button>
                  <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
