"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { NavBar } from "@/app/components/ui/navbar";
import {
  LayoutDashboard,
  Users,
  Layers,
  Shield,
  Clock,
  Video,
  FileText,
  LogOut,
} from "lucide-react";

export const NAV_ITEMS = [
  { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Interns", url: "/admin/interns", icon: Users },
  { name: "Batches", url: "/admin/batches", icon: Layers },
  { name: "Roles", url: "/admin/roles", icon: Shield },
  { name: "Sessions", url: "/admin/sessions", icon: Clock },
  { name: "Live Sessions", url: "/admin/live-sessions", icon: Video },
  { name: "Assignments", url: "/admin/assignments", icon: FileText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If on admin login page (/admin), don't wrap with shell navigation
  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user) {
      router.replace("/admin");
      return;
    }
    if (user.userType !== "ADMIN") {
      router.replace("/intern/dashboard");
    }
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-700 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== "ADMIN") return null;

  const displayName = user.admin?.fullName ?? user.email;
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const activeNav = NAV_ITEMS.find((n) => pathname.startsWith(n.url))?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Light-themed Admin Header bar per established project convention */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm shadow-purple-600/30">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <span className="text-slate-900 text-sm font-bold block leading-none">ScaleOn</span>
              <span className="text-purple-600 text-[10px] font-semibold tracking-wider uppercase">Admin</span>
            </div>
          </div>

          {/* Navigation Bar */}
          <NavBar items={NAV_ITEMS} activeItem={activeNav} />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-slate-900 text-xs font-semibold">{displayName}</span>
              <span className="text-slate-500 text-[10px]">Administrator</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}