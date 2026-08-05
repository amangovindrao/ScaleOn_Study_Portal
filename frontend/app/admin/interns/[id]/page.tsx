"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { statusBadge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { ArrowLeft, KeyRound, ShieldAlert, ShieldCheck, Briefcase, User, Calendar, BookOpen, Trophy, GraduationCap } from "lucide-react";

interface InternDetail {
  id: string;
  scaleonId: string;
  fullName: string;
  status: string;
  currentPhase: string | null;
  currentModule: string | null;
  overallProgress: number;
  attendancePercent: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  internshipRole: { id: string; name: string; code: string } | null;
  batch: { id: string; name: string } | null;
  mentor: { fullName: string; userAccount: { email: string } } | null;
  profile: {
    photo: string | null; bio: string | null; linkedin: string | null; github: string | null;
    portfolio: string | null; resumeUrl: string | null; skills: string[];
    college: string | null; university: string | null; branch: string | null;
    semester: string | null; expectedGraduation: string | null;
  } | null;
  userAccount: {
    id: string; username: string | null; email: string; phone: string | null;
    status: string; isFirstLogin: boolean; mustChangePassword: boolean;
    lastLoginAt: string | null; createdAt: string;
  };
  enrollments: { id: string; status: string; startDate: string | null; endDate: string | null; enrolledAt: string; internshipRole?: { name: string } }[];
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-xs font-medium">{label}</span>
      <span className="text-slate-900 text-sm font-semibold text-right max-w-[65%] break-all font-mono">{value ?? "—"}</span>
    </div>
  );
}

export default function InternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: intern, loading, error, refetch } = useFetch<InternDetail>(`/interns/${id}`);
  const [tab, setTab] = useState<"overview" | "profile" | "enrollments">("overview");
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;
  if (error || !intern) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-lg mx-auto">
      <p className="text-red-600 font-semibold text-base">{error ?? "Intern not found"}</p>
      <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition">
        <ArrowLeft size={16} /> Back to Interns List
      </button>
    </div>
  );

  async function handleSuspend() {
    if (!intern) return;
    setActionLoading(true);
    await api.post(`/interns/${intern.id}/suspend`, {});
    setActionLoading(false);
    refetch();
  }

  async function handleActivate() {
    if (!intern) return;
    setActionLoading(true);
    await api.post(`/interns/${intern.id}/activate`, {});
    setActionLoading(false);
    refetch();
  }

  async function handleResetPassword() {
    if (!intern) return;
    setResetLoading(true);
    setResetResult(null);
    const res = await api.post<{ temporaryPassword: string }>(`/interns/${intern.id}/reset-password`, { forceChange: true });
    setResetLoading(false);
    if (res.success && res.data) {
      setResetResult((res.data as { temporaryPassword: string }).temporaryPassword);
    }
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "profile", label: "Profile" },
    { key: "enrollments", label: "Enrollments" },
  ] as const;

  const initials = intern.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <div>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Interns List
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-black shadow-md flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{intern.fullName}</h1>
                {statusBadge(intern.status)}
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span className="font-mono text-slate-600 font-semibold">{intern.scaleonId}</span>
                <span>·</span>
                <span>{intern.userAccount.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {intern.status === "SUSPENDED" ? (
              <button onClick={handleActivate} disabled={actionLoading}
                className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50 shadow-sm">
                <ShieldCheck size={14} /> Activate Account
              </button>
            ) : intern.status === "ACTIVE" ? (
              <button onClick={handleSuspend} disabled={actionLoading}
                className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 font-bold px-3.5 py-2 rounded-xl hover:bg-amber-100 transition disabled:opacity-50 shadow-sm">
                <ShieldAlert size={14} /> Suspend Account
              </button>
            ) : null}
            <button onClick={() => setResetPwdOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
              <KeyRound size={14} /> Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Overall Progress" value={`${intern.overallProgress}%`} color="bg-blue-500" icon={<BookOpen size={16} className="text-blue-500" />} />
        <StatCard label="Attendance" value={`${Math.round(intern.attendancePercent)}%`} color="bg-emerald-500" icon={<Calendar size={16} className="text-emerald-500" />} />
        <StatCard label="Role" value={intern.internshipRole?.name ?? "Unassigned"} color="bg-purple-500" icon={<Briefcase size={16} className="text-purple-500" />} />
        <StatCard label="Batch" value={intern.batch?.name ?? "Unassigned"} color="bg-amber-500" icon={<Trophy size={16} className="text-amber-500" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-2xl p-1.5 shadow-inner">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm rounded-xl transition-all duration-200 font-semibold ${
              tab === t.key
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User size={14} className="text-slate-400" /> Account Identity
              </h3>
              <InfoRow label="Email Address" value={intern.userAccount.email} />
              <InfoRow label="Username" value={intern.userAccount.username} />
              <InfoRow label="Phone" value={intern.userAccount.phone} />
              <InfoRow label="Account Status" value={intern.userAccount.status} />
              <InfoRow label="Last Login" value={intern.userAccount.lastLoginAt ? new Date(intern.userAccount.lastLoginAt).toLocaleString() : "Never"} />
              <InfoRow label="First Login" value={intern.userAccount.isFirstLogin ? "Pending" : "Completed"} />
            </div>
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Briefcase size={14} className="text-slate-400" /> Internship Domain
              </h3>
              <InfoRow label="ScaleOn ID" value={intern.scaleonId} />
              <InfoRow label="Internship Role" value={intern.internshipRole?.name} />
              <InfoRow label="Assigned Batch" value={intern.batch?.name} />
              <InfoRow label="Mentor" value={intern.mentor?.fullName} />
              <InfoRow label="Start Date" value={intern.startDate ? new Date(intern.startDate).toLocaleDateString() : undefined} />
              <InfoRow label="End Date" value={intern.endDate ? new Date(intern.endDate).toLocaleDateString() : undefined} />
              <InfoRow label="Current Phase" value={intern.currentPhase} />
              <InfoRow label="Current Module" value={intern.currentModule} />
            </div>
          </div>
        )}

        {tab === "profile" && (
          intern.profile ? (
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <User size={14} className="text-slate-400" /> Personal Profile
                </h3>
                <InfoRow label="Bio" value={intern.profile.bio} />
                <InfoRow label="LinkedIn" value={intern.profile.linkedin} />
                <InfoRow label="GitHub" value={intern.profile.github} />
                <InfoRow label="Portfolio" value={intern.profile.portfolio} />
                <InfoRow label="Resume URL" value={intern.profile.resumeUrl} />
                {intern.profile.skills.length > 0 && (
                  <div className="py-3 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {intern.profile.skills.map((s) => (
                        <span key={s} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <GraduationCap size={14} className="text-slate-400" /> Academic & Education
                </h3>
                <InfoRow label="College" value={intern.profile.college} />
                <InfoRow label="University" value={intern.profile.university} />
                <InfoRow label="Branch / Major" value={intern.profile.branch} />
                <InfoRow label="Semester" value={intern.profile.semester} />
                <InfoRow label="Expected Graduation" value={intern.profile.expectedGraduation ? new Date(intern.profile.expectedGraduation).toLocaleDateString() : undefined} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <User size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">Intern profile has not been filled out yet.</p>
            </div>
          )
        )}

        {tab === "enrollments" && (
          <div className="space-y-3">
            {intern.enrollments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Briefcase size={32} className="mx-auto opacity-30 mb-2" />
                <p className="text-sm font-medium">No enrollment records found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {intern.enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition">
                    <div>
                      <p className="text-slate-900 text-sm font-bold">{(e as { internshipRole?: { name: string } }).internshipRole?.name ?? "—"}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Enrolled on {new Date(e.enrolledAt).toLocaleDateString()} ·{" "}
                        {e.startDate ? new Date(e.startDate).toLocaleDateString() : "—"} →{" "}
                        {e.endDate ? new Date(e.endDate).toLocaleDateString() : "Ongoing"}
                      </p>
                    </div>
                    {statusBadge(e.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset password modal */}
      <Modal open={resetPwdOpen} onClose={() => { setResetPwdOpen(false); setResetResult(null); }} title="Reset Intern Password">
        {resetResult ? (
          <div className="space-y-4">
            <p className="text-emerald-700 font-semibold text-sm bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              ✅ Password reset successfully. Share this temporary password with the intern:
            </p>
            <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-900 text-center text-xl font-bold tracking-widest">
              {resetResult}
            </div>
            <p className="text-slate-500 text-xs text-center">The intern will be required to change this password on their next login.</p>
            <button onClick={() => { setResetPwdOpen(false); setResetResult(null); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-sm transition shadow-sm">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              This will generate a new random password and revoke all active login sessions for <strong className="text-slate-900 font-bold">{intern.fullName}</strong>.
              The intern will be required to update their password upon sign-in.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setResetPwdOpen(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold rounded-xl py-2.5 text-sm hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleResetPassword} disabled={resetLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl py-2.5 text-sm transition shadow-sm">
                {resetLoading ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className="text-slate-900 font-black text-xl mt-2 truncate">{value}</p>
    </div>
  );
}
