"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { NavBar } from "@/app/components/ui/navbar";
import { LayoutDashboard, Users, Package, Shield, Monitor, Trophy, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Interns", url: "/admin/interns", icon: Users },
  { name: "Intern of Week", url: "/admin/intern-of-week", icon: Trophy },
  { name: "Batches", url: "/admin/batches", icon: Package },
  { name: "Roles", url: "/admin/roles", icon: Shield },
  { name: "Sessions", url: "/admin/sessions", icon: Monitor },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/admin"); return; }
    if (user.userType !== "ADMIN") { router.replace("/login"); }
  }, [user, loading, router]);

  if (pathname === "/admin") return <>{children}</>;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!user || user.userType !== "ADMIN") return null;

  const displayName = user.admin?.fullName ?? user.email;
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const activeNav = NAV_ITEMS.find(n => pathname.startsWith(n.url))?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Header with dock */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-slate-900 text-sm font-bold hidden sm:block">ScaleOn Admin</span>
          </div>

          {/* Dock Navigation */}
          <NavBar items={NAV_ITEMS} activeItem={activeNav} />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-bold">{initials}</div>
              <span className="text-slate-600 text-xs font-medium">{displayName.split(" ")[0]}</span>
            </div>
            <button onClick={async () => { await logout(); router.replace("/admin"); }}
              className="text-slate-400 hover:text-slate-700 transition p-1.5 rounded-lg hover:bg-slate-100" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
