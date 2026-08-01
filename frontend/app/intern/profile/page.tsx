"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";

interface Profile { bio: string | null; linkedin: string | null; github: string | null; portfolio: string | null; skills: string[]; college: string | null; branch: string | null; semester: string | null }

export default function InternProfilePage() {
  const { user, refetch } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ phone: "", bio: "", linkedin: "", github: "", portfolio: "", skills: "", college: "", branch: "", semester: "" });
  const [changePw, setChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ phone?: string; intern?: { profile?: Profile } }>("/profiles/me").then((res) => {
      if (res.success && res.data) {
        const d = res.data as { phone?: string; intern?: { profile?: Profile } };
        const p = d.intern?.profile;
        setForm({ phone: d.phone ?? "", bio: p?.bio ?? "", linkedin: p?.linkedin ?? "", github: p?.github ?? "", portfolio: p?.portfolio ?? "", skills: p?.skills?.join(", ") ?? "", college: p?.college ?? "", branch: p?.branch ?? "", semester: p?.semester ?? "" });
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(false);
    const res = await api.patch("/profiles/me", {
      phone: form.phone || undefined, bio: form.bio || undefined, linkedin: form.linkedin || undefined, github: form.github || undefined, portfolio: form.portfolio || undefined,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [], college: form.college || undefined, branch: form.branch || undefined, semester: form.semester || undefined,
    });
    setSaving(false);
    if (res.success) { setSuccess(true); refetch(); setTimeout(() => setSuccess(false), 3000); }
    else { setError(res.error?.message ?? "Failed"); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault(); setPwLoading(true); setPwMsg(null);
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg("Passwords don't match"); setPwLoading(false); return; }
    const res = await api.post("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.newPw });
    setPwLoading(false);
    if (res.success) { setPwMsg("Password changed!"); setPwForm({ current: "", newPw: "", confirm: "" }); }
    else { setPwMsg(res.error?.message ?? "Failed"); }
  }

  const intern = user?.intern;
  const initials = (intern?.fullName ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">{initials}</div>
        <div>
          <p className="text-slate-900 font-semibold text-lg">{intern?.fullName}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-slate-400 text-xs mt-0.5">{intern?.scaleonId} · {intern?.internshipRole?.name}</p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Profile Information</h2>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-emerald-700 text-sm">Saved!</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="+91 9876543210" />
          <Field label="College" value={form.college} onChange={(v) => setForm(f => ({ ...f, college: v }))} placeholder="Your college" />
          <Field label="Branch" value={form.branch} onChange={(v) => setForm(f => ({ ...f, branch: v }))} placeholder="Computer Science" />
          <Field label="Semester" value={form.semester} onChange={(v) => setForm(f => ({ ...f, semester: v }))} placeholder="5th" />
          <Field label="LinkedIn" value={form.linkedin} onChange={(v) => setForm(f => ({ ...f, linkedin: v }))} placeholder="https://linkedin.com/in/..." />
          <Field label="GitHub" value={form.github} onChange={(v) => setForm(f => ({ ...f, github: v }))} placeholder="https://github.com/..." />
          <Field label="Portfolio" value={form.portfolio} onChange={(v) => setForm(f => ({ ...f, portfolio: v }))} placeholder="https://..." />
          <Field label="Skills (comma separated)" value={form.skills} onChange={(v) => setForm(f => ({ ...f, skills: v }))} placeholder="Python, React, ML" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself…" rows={3}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>

      {/* Change password */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Security</h2>
          <button onClick={() => setChangePw(!changePw)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            {changePw ? "Cancel" : "Change Password"}
          </button>
        </div>
        {changePw && (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-100">
            {pwMsg && <p className={`text-sm ${pwMsg.includes("changed") ? "text-emerald-600" : "text-red-600"}`}>{pwMsg}</p>}
            <Field label="Current Password" value={pwForm.current} onChange={(v) => setPwForm(f => ({ ...f, current: v }))} placeholder="" type="password" />
            <Field label="New Password" value={pwForm.newPw} onChange={(v) => setPwForm(f => ({ ...f, newPw: v }))} placeholder="" type="password" />
            <Field label="Confirm New Password" value={pwForm.confirm} onChange={(v) => setPwForm(f => ({ ...f, confirm: v }))} placeholder="" type="password" />
            <button type="submit" disabled={pwLoading} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition">
              {pwLoading ? "Changing…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
    </div>
  );
}
