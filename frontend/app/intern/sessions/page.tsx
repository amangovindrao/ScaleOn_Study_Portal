"use client";

import { useFetch } from "@/app/lib/hooks";

interface Session { id: string; ipAddress: string | null; browser: string | null; os: string | null; device: string | null; isActive: boolean; lastActivityAt: string; createdAt: string }
interface LoginEntry { id: string; success: boolean; failureReason: string | null; ipAddress: string | null; browser: string | null; os: string | null; createdAt: string }

export default function InternSessionsPage() {
  const { data: sessions } = useFetch<Session[]>("/sessions/me");
  const { data: history } = useFetch<LoginEntry[]>("/sessions/me/login-history");

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-lg font-semibold text-slate-900">Login Activity</h1>

      {/* Active sessions */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-medium text-slate-900">Active Sessions</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {(sessions ?? []).filter(s => s.isActive).map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900">{s.browser ?? "Unknown browser"} · {s.os ?? ""}</p>
                <p className="text-xs text-slate-400">{s.ipAddress ?? "—"} · {s.device ?? "desktop"}</p>
              </div>
              <p className="text-xs text-slate-400">{new Date(s.lastActivityAt).toLocaleString()}</p>
            </div>
          ))}
          {(sessions ?? []).filter(s => s.isActive).length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-400 text-center">No active sessions</p>
          )}
        </div>
      </div>

      {/* Login history */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-medium text-slate-900">Login History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {(history ?? []).slice(0, 10).map((h) => (
            <div key={h.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${h.success ? "bg-emerald-500" : "bg-red-500"}`} />
                <div>
                  <p className="text-sm text-slate-900">{h.success ? "Successful login" : `Failed: ${h.failureReason ?? "—"}`}</p>
                  <p className="text-xs text-slate-400">{h.browser ?? ""} · {h.ipAddress ?? ""}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {(history ?? []).length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-400 text-center">No login history</p>
          )}
        </div>
      </div>
    </div>
  );
}
