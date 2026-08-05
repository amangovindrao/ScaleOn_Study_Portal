"use client";

import { useFetch } from "@/app/lib/hooks";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";
import {
  Users,
  Layers3,
  TrendingUp,
  Target,
  UserPlus,
  CalendarPlus,
  BookOpen,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

interface RecentIntern {
  id: string;
  scaleonId: string;
  fullName: string;
  status: string;
  internshipRole: {
    name: string;
    code: string;
  } | null;
  createdAt: string;
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

  const stats = [
    {
      title: "Total Interns",
      value: totalInterns,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Batches",
      value: activeBatches,
      icon: Layers3,
      color: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Weekly Growth",
      value: "--",
      icon: TrendingUp,
      color: "from-orange-500 to-amber-600",
      bg: "bg-orange-50",
    },
    {
      title: "Completion",
      value: "--",
      icon: Target,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-7 max-w-7xl">
      {/* HERO */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <p className="text-blue-100 text-sm uppercase tracking-[0.25em]">
              Admin Dashboard
            </p>
            <h1 className="text-4xl font-black mt-3">
              Welcome back, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-blue-100 mt-4 max-w-2xl">
              Monitor interns, batches, learning, assignments and platform
              activity from one centralized dashboard.
            </p>
          </div>

          <div className="flex items-end">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-5">
              <p className="text-sm text-blue-100">Platform Status</p>
              <h2 className="text-3xl font-black mt-2">Healthy ✅</h2>
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">
                    {item.title}
                  </p>
                  <h2 className="text-3xl font-black mt-3 text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}
                >
                  <Icon className="text-slate-700" size={22} />
                </div>
              </div>

              <div className="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full w-2/3 transition-all duration-500`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-slate-900">Quick Actions</h2>
            <p className="text-slate-500 text-sm">
              Frequently used admin shortcuts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/admin/interns"
            title="Add Intern"
            icon={<UserPlus size={20} />}
            color="blue"
          />
          <QuickAction
            href="/admin/live-sessions"
            title="Live Session"
            icon={<CalendarPlus size={20} />}
            color="emerald"
          />
          <QuickAction
            href="/admin/batches"
            title="Batches"
            icon={<BookOpen size={20} />}
            color="purple"
          />
          <QuickAction
            href="/admin/assignments"
            title="Assignments"
            icon={<ClipboardList size={20} />}
            color="orange"
          />
        </div>
      </div>

      {/* PLATFORM OVERVIEW */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Platform Overview
              </h2>
              <p className="text-sm text-slate-500">
                Overall internship ecosystem
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <OverviewCard title="Learning" value="12" subtitle="Modules" color="blue" />
            <OverviewCard title="Assignments" value="8" subtitle="Published" color="orange" />
            <OverviewCard title="Live Sessions" value="5" subtitle="Upcoming" color="emerald" />
            <OverviewCard title="Support" value="3" subtitle="Open Tickets" color="purple" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 uppercase text-xs tracking-[0.3em]">Growth</p>
          <h2 className="text-3xl font-black mt-3">+24%</h2>
          <p className="mt-3 text-blue-100 text-sm">
            Internship engagement has increased compared to last month.
          </p>

          <div className="mt-8">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full rounded-full bg-white" />
            </div>
            <p className="text-xs mt-3 text-blue-100">75% Platform Activity</p>
          </div>
        </div>
      </div>

      {/* RECENT INTERNS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Recently Joined Interns</h2>
            <p className="text-sm text-slate-500">Latest registrations</p>
          </div>

          <Link
            href="/admin/interns"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {interns.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto text-slate-300" size={40} />
            <h3 className="font-semibold text-slate-800 mt-4">No Interns Found</h3>
            <p className="text-slate-500 text-sm mt-2">
              Add your first intern to begin.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {interns.map((intern) => (
              <Link
                key={intern.id}
                href={`/admin/interns/${intern.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                    {intern.fullName
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">{intern.fullName}</p>
                    <p className="text-sm text-slate-500">{intern.scaleonId}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {intern.internshipRole?.name ?? "No Role"}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${intern.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                    }`}
                >
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

function QuickAction({
  href,
  title,
  icon,
  color,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "purple" | "orange";
}) {
  const colors = {
    blue: "hover:border-blue-300 hover:bg-blue-50 text-blue-600",
    emerald: "hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600",
    purple: "hover:border-purple-300 hover:bg-purple-50 text-purple-600",
    orange: "hover:border-orange-300 hover:bg-orange-50 text-orange-600",
  };

  return (
    <Link
      href={href}
      className={`border border-slate-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-md bg-white ${colors[color]}`}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">Open module</p>
    </Link>
  );
}

function OverviewCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "orange" | "emerald" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    emerald: "bg-emerald-50 text-emerald-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
        {title}
      </div>

      <h2 className="text-3xl font-black text-slate-900 mt-4">{value}</h2>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}