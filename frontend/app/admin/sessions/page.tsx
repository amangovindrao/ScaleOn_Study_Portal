"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge } from "@/app/components/ui/badge";
import { Monitor, Layers, RefreshCw } from "lucide-react";

interface Session {
  id: string;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  isActive: boolean;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
  userAccount: { id: string; username: string | null; email: string; userType: string };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [terminating, setTerminating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const activeOnlyParam = activeTab === "active" ? "true" : "false";
    const params = new URLSearchParams({ page: String(page), pageSize: "20", activeOnly: activeOnlyParam });
    const res = await api.get<Session[]>(`/sessions?${params}`);
    if (res.success) {
      setSessions((res.data as Session[]) ?? []);
      setPagination(res.pagination ?? { page, pageSize: 20, total: 0, totalPages: 0 });
    }
    setLoading(false);
  }, [page, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (tab: "active" | "all") => {
    setActiveTab(tab);
    setPage(1);
  };

  async function terminate(id: string) {
    setTerminating(id);
    await api.delete(`/sessions/${id}`);
    setTerminating(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor and manage active user login sessions and historical session logs
          </p>
        </div>

        <button
          onClick={() => load()}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
          title="Refresh list"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs: 1. Active Sessions | 2. All Sessions */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange("active")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition select-none ${
            activeTab === "active"
              ? "border-purple-600 text-purple-600 bg-purple-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Monitor size={18} />
          <span>Active Sessions</span>
          {activeTab === "active" && (
            <span className="ml-1.5 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-bold">
              {pagination.total}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("all")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition select-none ${
            activeTab === "all"
              ? "border-purple-600 text-purple-600 bg-purple-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Layers size={18} />
          <span>All Sessions</span>
          {activeTab === "all" && (
            <span className="ml-1.5 px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full font-bold">
              {pagination.total}
            </span>
          )}
        </button>
      </div>

      {/* Sessions Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Monitor className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-700 font-medium text-sm">
              {activeTab === "active" ? "No active sessions found" : "No session records found"}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {activeTab === "active"
                ? "There are currently no active user sessions on the platform."
                : "No session history is available."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="text-left px-5 py-3.5">User</th>
                    <th className="text-left px-4 py-3.5 hidden md:table-cell">IP Address</th>
                    <th className="text-left px-4 py-3.5 hidden lg:table-cell">Browser / OS</th>
                    <th className="text-left px-4 py-3.5 hidden xl:table-cell">Country</th>
                    <th className="text-left px-4 py-3.5">Status</th>
                    <th className="text-left px-4 py-3.5 hidden md:table-cell">Last Active</th>
                    <th className="text-right px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <p className="text-slate-900 font-semibold text-sm">
                          {s.userAccount.username ?? s.userAccount.email}
                        </p>
                        <p className="text-slate-400 text-xs font-mono">{s.userAccount.userType}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-600 text-xs font-mono">
                        {s.ipAddress ?? "—"}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <p className="text-slate-700 text-xs font-medium">{s.browser ?? "Unknown Browser"}</p>
                        <p className="text-slate-400 text-xs">{s.os ?? "Unknown OS"}</p>
                      </td>
                      <td className="px-4 py-4 hidden xl:table-cell text-slate-600 text-xs">
                        {s.country ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={s.isActive ? "green" : "gray"}>
                          {s.isActive ? "Active" : "Expired"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-500 text-xs">
                        {new Date(s.lastActivityAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {s.isActive ? (
                          <button
                            onClick={() => terminate(s.id)}
                            disabled={terminating === s.id}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            {terminating === s.id ? "Terminating..." : "Terminate"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Ended</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-slate-500 text-xs">
                  Page {page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 transition shadow-xs font-medium"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 transition shadow-xs font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
