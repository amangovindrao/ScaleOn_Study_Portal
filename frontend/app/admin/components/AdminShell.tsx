"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { NavBar } from "@/app/components/ui/navbar";
import {
  LayoutDashboard, Users, Package, Shield, Monitor,
  BookOpen, ClipboardList, Video, HelpCircle, BarChart2, Crown, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard",     url: "/admin/dashboard",        icon: LayoutDashboard },
  { name: "Interns",       url: "/admin/interns",          icon: Users },
  { name: "Batches",       url: "/admin/batches",          icon: Package },
  { name: "Roles",         url: "/admin/roles",            icon: Shield },
  { name: "Sessions",      url: "/admin/sessions",         icon: Monitor },
  { name: "Learning",      url: "/admin/learning",         icon: BookOpen },
  { name: "Assignments",   url: "/admin/assignments",      icon: ClipboardList },
  { name: "Live",          url: "/admin/live",             icon: Video },
  { name: "Support",       url: "/admin/support",          icon: HelpCircle },
  { name: "Analytics",     url: "/admin/analytics",        icon: BarChart2 },
  { name: "Intern of Week",url: "/admin/intern-of-week",   icon: Crown },
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

  // Admin login page — render children only (no shell)
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
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const activeNav = NAV_ITEMS.find((n) => pathname.startsWith(n.url))?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Top header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/20">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-slate-900 text-sm font-bold hidden sm:block">ScaleOn Admin</span>
          </div>

          {/* Nav */}
          <NavBar items={NAV_ITEMS} activeItem={activeNav} />

          {/* Right: avatar + logout */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {initials}
            </div>
            <button
              onClick={async () => { await logout(); router.replace("/admin"); }}
              className="text-slate-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
