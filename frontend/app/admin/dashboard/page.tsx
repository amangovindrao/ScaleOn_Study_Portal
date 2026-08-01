"use client";

import { useFetch } from "@/app/lib/hooks";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";

interface RecentIntern {
  id: string; scaleonId: string; fullName: string; status: string;
  internshipRole: { name: string; code: string } | null; createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: recentInterns, pagination } = useFetch<RecentIntern[]>(
    "/interns?page=1&pageSize=5&sortBy=createdAt&sortOrder=desc"
  );
  const { data: batches } = useFetch<{ status: string }[]>("/catalog/batches");

  const totalInterns = pagination?.total ?? 0;
  const interns = recentInterns ?? [];
  const activeBatches = batches?.filter((b) => b.status === "ACTIVE").length ?? 0;
  const displayName = user?.admin?.fullName ?? "Admin";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome back, {displayName.split(" ")[0]}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Interns", value: totalInterns, color: "text-blue-600" },
          { label: "Active Batches", value: activeBatches, color: "text-emerald-600" },
          { label: "This Week", value: "—", color: "text-amber-600" },
          { label: "Completion", value: "—", color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent interns */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-slate-900 font-medium text-sm">Recent Interns</h2>
          <Link href="/admin/interns" className="text-blue-600 hover:text-blue-700 text-xs font-medium">View all →</Link>
        </div>
        {interns.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">No interns yet</p>
            <Link href="/admin/interns" className="text-blue-600 text-xs mt-1 inline-block font-medium">Add your first intern →</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {interns.map((intern) => (
              <Link key={intern.id} href={`/admin/interns/${intern.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 text-xs font-bold">
                    {intern.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-medium">{intern.fullName}</p>
                    <p className="text-slate-400 text-xs">{intern.scaleonId} · {intern.internshipRole?.name ?? "—"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${intern.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {intern.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
