"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { statusBadge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, FormField } from "@/app/components/ui/input";

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
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm text-right max-w-[60%] break-all">{value ?? "—"}</span>
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

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (error || !intern) return (
    <div className="text-center py-20">
      <p className="text-red-400 text-sm">{error ?? "Intern not found"}</p>
      <button onClick={() => router.back()} className="mt-3 text-purple-400 text-sm hover:text-purple-300 transition">← Back</button>
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

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-white/40 hover:text-white text-sm transition mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">{intern.fullName}</h1>
          <p className="text-white/40 text-sm mt-0.5">{intern.scaleonId} · {intern.userAccount.username ?? intern.userAccount.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusBadge(intern.status)}
          {intern.status === "SUSPENDED" ? (
            <button onClick={handleActivate} disabled={actionLoading}
              className="text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-600/30 transition disabled:opacity-50">
              Activate
            </button>
          ) : intern.status === "ACTIVE" ? (
            <button onClick={handleSuspend} disabled={actionLoading}
              className="text-xs bg-amber-600/20 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-600/30 transition disabled:opacity-50">
              Suspend
            </button>
          ) : null}
          <button onClick={() => setResetPwdOpen(true)}
            className="text-xs bg-white/5 border border-white/15 text-white/60 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition">
            Reset Password
          </button>
        </div>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Progress", value: `${intern.overallProgress}%`, color: "bg-purple-500" },
          { label: "Attendance", value: `${intern.attendancePercent}%`, color: "bg-blue-500" },
          { label: "Role", value: intern.internshipRole?.name ?? "—", color: "bg-emerald-500" },
          { label: "Batch", value: intern.batch?.name ?? "—", color: "bg-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/60 border border-white/8 rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-0.5 w-full ${s.color}`} />
            <p className="text-white/40 text-xs">{s.label}</p>
            <p className="text-white font-semibold mt-1 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-white/8 rounded-2xl p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm rounded-xl transition ${tab === t.key ? "bg-purple-600 text-white font-semibold" : "text-white/50 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Account</h3>
              <InfoRow label="Email" value={intern.userAccount.email} />
              <InfoRow label="Username" value={intern.userAccount.username} />
              <InfoRow label="Phone" value={intern.userAccount.phone} />
              <InfoRow label="Account Status" value={intern.userAccount.status} />
              <InfoRow label="Last Login" value={intern.userAccount.lastLoginAt ? new Date(intern.userAccount.lastLoginAt).toLocaleString() : "Never"} />
              <InfoRow label="First Login" value={intern.userAccount.isFirstLogin ? "Pending" : "Completed"} />
            </div>
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Internship</h3>
              <InfoRow label="ScaleOn ID" value={intern.scaleonId} />
              <InfoRow label="Role" value={intern.internshipRole?.name} />
              <InfoRow label="Batch" value={intern.batch?.name} />
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
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Personal</h3>
                <InfoRow label="Bio" value={intern.profile.bio} />
                <InfoRow label="LinkedIn" value={intern.profile.linkedin} />
                <InfoRow label="GitHub" value={intern.profile.github} />
                <InfoRow label="Portfolio" value={intern.profile.portfolio} />
                <InfoRow label="Resume" value={intern.profile.resumeUrl} />
                {intern.profile.skills.length > 0 && (
                  <div className="py-2.5 border-b border-white/5">
                    <p className="text-white/40 text-sm mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {intern.profile.skills.map((s) => (
                        <span key={s} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Education</h3>
                <InfoRow label="College" value={intern.profile.college} />
                <InfoRow label="University" value={intern.profile.university} />
                <InfoRow label="Branch" value={intern.profile.branch} />
                <InfoRow label="Semester" value={intern.profile.semester} />
                <InfoRow label="Graduation" value={intern.profile.expectedGraduation ? new Date(intern.profile.expectedGraduation).toLocaleDateString() : undefined} />
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">Profile not completed yet.</p>
          )
        )}

        {tab === "enrollments" && (
          <div className="space-y-2">
            {intern.enrollments.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No enrollment history.</p>
            ) : intern.enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{(e as { internshipRole?: { name: string } }).internshipRole?.name ?? "—"}</p>
                  <p className="text-white/40 text-xs">
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

      {/* Reset password modal */}
      <Modal open={resetPwdOpen} onClose={() => { setResetPwdOpen(false); setResetResult(null); }} title="Reset Intern Password">
        {resetResult ? (
          <div className="space-y-4">
            <p className="text-emerald-300 text-sm">Password reset successfully. Share this temporary password with the intern:</p>
            <div className="bg-white/5 rounded-xl px-4 py-3 font-mono text-white text-center text-lg tracking-wider">
              {resetResult}
            </div>
            <p className="text-white/40 text-xs">The intern will be required to change this password on next login.</p>
            <button onClick={() => { setResetPwdOpen(false); setResetResult(null); }}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              This will generate a new random password and revoke all existing sessions for <strong className="text-white">{intern.fullName}</strong>.
              The intern will be required to change it on next login.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetPwdOpen(false)}
                className="flex-1 border border-white/15 text-white/60 rounded-xl py-2.5 text-sm hover:bg-white/5 transition">
                Cancel
              </button>
              <button onClick={handleResetPassword} disabled={resetLoading}
                className="flex-1 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition">
                {resetLoading ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
