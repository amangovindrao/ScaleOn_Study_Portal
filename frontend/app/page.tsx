import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  ClipboardList,
  Video,
  Trophy,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                ScaleOn
              </span>
              <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase block mt-0.5">
                Study Portal
              </span>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#portals" className="hover:text-blue-600 transition-colors">
              Portals
            </a>
            <a href="#about" className="hover:text-blue-600 transition-colors">
              About Platform
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all"
            >
              Intern Sign In
            </Link>
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-3xl -z-10 pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
              <span>ScaleOn Internship Learning Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Empowering Next-Gen Talent & Streamlining Internship Success
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Your centralized gateway for structured learning roadmaps, assignments, live sessions, attendance tracking, and performance analytics.
            </p>

            {/* PORTAL SELECTOR CARDS */}
            <div id="portals" className="mt-14 max-w-4xl mx-auto grid md:grid-cols-2 gap-6 text-left">
              {/* Intern Portal Card */}
              <div className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                    <GraduationCap size={28} />
                  </div>

                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                    For Interns
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Intern Portal
                  </h2>

                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Access your assigned learning tracks, submit weekly assignments, check live webinar links, and view your profile status.
                  </p>

                  <ul className="mt-6 space-y-2 text-xs font-medium text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Interactive Learning Roadmaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Assignment Submissions & Feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Live Webinars & Intern of the Week</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl py-3.5 px-5 shadow-md shadow-blue-600/20 hover:shadow-lg transition-all group-hover:gap-3"
                  >
                    <span>Login as Intern</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* Admin Portal Card */}
              <div className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                  </div>

                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                    For Administrators
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Admin Portal
                  </h2>

                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Manage intern cohorts, curate learning modules, create assignments, host live sessions, and review analytics.
                  </p>

                  <ul className="mt-6 space-y-2 text-xs font-medium text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                      <span>Cohort & Role Management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                      <span>Curriculum & Assignment Control</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                      <span>Real-time Growth & Analytics</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href="/admin"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl py-3.5 px-5 shadow-md shadow-slate-900/20 hover:shadow-lg transition-all group-hover:gap-3"
                  >
                    <span>Login as Admin</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-blue-600 mb-2">
                Platform Capabilities
              </h2>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                Everything You Need for a Modern Internship Experience
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "Structured Learning Tracks",
                  desc: "Clear step-by-step learning paths curated specifically for your domain and role requirements.",
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  icon: ClipboardList,
                  title: "Assignments & Assessments",
                  desc: "Hands-on projects and tasks designed to test real-world problem-solving and skills.",
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  icon: Video,
                  title: "Live Sessions & Webinars",
                  desc: "Direct access to expert mentorship, live Q&A sessions, and interactive workshops.",
                  color: "bg-purple-50 text-purple-600",
                },
                {
                  icon: Trophy,
                  title: "Intern of the Week",
                  desc: "Celebrating excellence and top effort with weekly highlights and peer recognition.",
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  icon: BarChart3,
                  title: "Progress Analytics",
                  desc: "Visual dashboard metrics to track completion rates, attendance, and milestone achievements.",
                  color: "bg-rose-50 text-rose-600",
                },
                {
                  icon: HelpCircle,
                  title: "Help & Support Desk",
                  desc: "Responsive support channel to assist with technical queries, onboarding, and feedback.",
                  color: "bg-indigo-50 text-indigo-600",
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ABOUT / SUMMARY SECTION */}
        <section id="about" className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                <Layers size={26} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Built for Growth, Driven by ScaleOn
              </h2>
              <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                ScaleOn Study Portal bridges the gap between learning and execution. Empowering interns with real skills while equipping administrators with structured management tools.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all shadow-lg shadow-blue-600/30"
                >
                  Go to Intern Portal
                </Link>
                <Link
                  href="/admin"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl px-6 py-3 text-sm backdrop-blur-md transition-all"
                >
                  Go to Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-slate-700">
              ScaleOn Study Portal
            </span>
          </div>

          <p>© {new Date().getFullYear()} ScaleOn Inc. All rights reserved.</p>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Intern Login
            </Link>
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
