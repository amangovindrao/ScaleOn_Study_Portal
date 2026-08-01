"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { NavBar } from "@/app/components/ui/navbar";
import { LayoutDashboard, BookOpen, Trophy, Video, ClipboardList, HelpCircle, User, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", url: "/intern/dashboard", icon: LayoutDashboard },
  { name: "Learning", url: "/intern/learning", icon: BookOpen },
  { name: "Leaderboard", url: "/intern/leaderboard", icon: Trophy },
  { name: "Live Sessions", url: "/intern/live", icon: Video },
  { name: "Assignments", url: "/intern/assignments", icon: ClipboardList },
  { name: "Support", url: "/intern/support", icon: HelpCircle },
];

export default function InternShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.userType !== "INTERN") { router.replace("/admin/dashboard"); }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading your portal...</p>
      </div>
    </div>
  );

  if (!user || user.userType !== "INTERN") return null;

  const displayName = user.intern?.fullName ?? user.email;
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const activeNav = NAV_ITEMS.find(n => pathname.startsWith(n.url))?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/20">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-slate-900 text-sm font-bold hidden sm:block">ScaleOn</span>
          </div>

          <NavBar items={NAV_ITEMS} activeItem={activeNav} />

          <div className="flex items-center gap-2">
            <a href="/intern/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Profile">
              {initials}
            </a>
            <button onClick={async () => { await logout(); router.replace("/login"); }}
              className="text-slate-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
