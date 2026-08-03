"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import {
  User, GraduationCap, Briefcase, Camera,
  Phone, Mail, CheckCircle2, X, AlertCircle, Eye, EyeOff, Lock,
  Award, Download, ExternalLink, Share2, Sparkles, ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileResponse {
  phone?: string;
  intern?: {
    scaleonId: string;
    fullName: string;
    currentPhase: string | null;
    internshipRole: { name: string; code: string } | null;
    batch: { name: string } | null;
    profile?: {
      bio: string | null;
      linkedin: string | null;
      github: string | null;
      skills: string[];
      college: string | null;
      branch: string | null;
      expectedGraduation: string | null;
      photo: string | null;
    } | null;
  } | null;
}

interface CertificateItem {
  id: string;
  certificateCode: string;
  phaseName: string;
  issuedAt: string;
  phase?: {
    name: string;
    description: string | null;
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePhone(v: string) {
  if (!v) return null;
  return /^[+]?[\d\s\-().]{7,15}$/.test(v) ? null : "Enter a valid phone number";
}
function validateLinkedIn(v: string) {
  if (!v) return null;
  return /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(v) ? null : "Must be linkedin.com/in/...";
}
function validateGitHub(v: string) {
  if (!v) return null;
  return /^https?:\/\/(www\.)?github\.com\/.+/i.test(v) ? null : "Must be github.com/...";
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium transition-all animate-in slide-in-from-bottom-4 duration-300 ${type === "success"
      ? "bg-emerald-600 text-white"
      : "bg-red-600 text-white"
      }`}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition"><X size={14} /></button>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Card({ icon: Icon, title, accent, action, children }: {
  icon: React.ElementType; title: string; accent: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
            <Icon size={17} />
          </div>
          <h2 className="font-semibold text-slate-800 text-sm tracking-wide">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

const inputBase = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15";
const inputError = "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/15";
const inputReadonly = "opacity-55 cursor-not-allowed bg-slate-100 border-slate-200";

// ─── Skill Chips ──────────────────────────────────────────────────────────────

function SkillChips({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add(raw: string) {
    const val = raw.trim();
    if (val && !skills.includes(val)) onChange([...skills, val]);
    setInput("");
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
    else if (e.key === "Backspace" && !input && skills.length) onChange(skills.slice(0, -1));
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/15"
    >
      {skills.map(skill => (
        <span key={skill} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg px-2.5 py-1 select-none">
          {skill}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(skills.filter(s => s !== skill)); }}
            className="hover:text-blue-900 transition ml-0.5"
            aria-label={`Remove ${skill}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) add(input); }}
        placeholder={skills.length === 0 ? "Add skills (press Enter or comma)…" : "Add more…"}
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 py-0.5"
      />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials, photoUrl }: { initials: string; photoUrl?: string | null }) {
  return (
    <div className="relative group w-20 h-20 flex-shrink-0 cursor-pointer" title="Profile photo upload coming soon">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25 overflow-hidden">
        {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : initials}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Camera size={20} className="text-white" />
      </div>
    </div>
  );
}

// ─── Certificate Card ────────────────────────────────────────────────────────

function CertificateCard({ cert, internName }: { cert: CertificateItem; internName: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ScaleOn Certificate - ${cert.phaseName}`,
        text: `I completed ${cert.phaseName} at ScaleOn Study Portal! Certificate ID: ${cert.certificateCode}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`ScaleOn Certificate (${cert.phaseName}) - Code: ${cert.certificateCode}`);
      alert("Certificate details copied to clipboard!");
    }
  };

  const handleDownload = () => {
    alert(`Downloading PDF for Certificate ID: ${cert.certificateCode}`);
  };

  return (
    <>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Top branding & status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-[10px]">
                S
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">ScaleOn Academy</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> Completed
            </span>
          </div>

          {/* Title & Info */}
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug">{cert.phaseName} Certificate</h3>
            <p className="text-xs text-slate-500 mt-0.5">Course: {cert.phase?.name || cert.phaseName}</p>
          </div>

          {/* Details */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Date Issued:</span>
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Certificate ID:</span>
              <span className="font-mono font-medium text-slate-700 text-[11px] truncate max-w-[140px]" title={cert.certificateCode}>
                {cert.certificateCode}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <ExternalLink size={13} /> View
          </button>
          <button
            onClick={handleDownload}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium p-2 rounded-xl transition"
            title="Download PDF"
          >
            <Download size={13} />
          </button>
          <button
            onClick={handleShare}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium p-2 rounded-xl transition"
            title="Share Certificate"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Modal Preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            {/* Certificate Graphic Mockup */}
            <div className="border-8 border-slate-900/5 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 p-8 rounded-2xl text-center space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <span className="font-extrabold text-slate-900 text-lg tracking-wide">ScaleOn</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Certificate of Completion</p>
              <p className="text-xs text-slate-500">This is to certify that</p>
              <h2 className="text-2xl font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 inline-block px-4">{internName}</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has successfully completed all requirements and assessments for <span className="font-semibold text-slate-800">{cert.phaseName}</span> on ScaleOn Study Portal.
              </p>
              <div className="pt-4 flex items-center justify-between text-left text-[11px] text-slate-400 border-t border-slate-200/60">
                <div>
                  <p className="font-medium text-slate-600">Issued On: {formattedDate}</p>
                  <p className="font-mono text-[10px]">ID: {cert.certificateCode}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block border-b border-slate-400 pb-0.5 font-serif italic text-slate-700 text-sm">ScaleOn Academic Board</span>
                  <p className="text-[10px] text-slate-400">Verified Issuer</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
              >
                <Download size={14} /> Download Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InternProfilePage() {
  const { user, refetch } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    phone: "",
    college: "",
    branch: "",
    graduationYear: "",
    skills: [] as string[],
    linkedin: "",
    github: "",
    bio: "",
  });

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [showAllCerts, setShowAllCerts] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Password section
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    api.get<ProfileResponse>("/profiles/me").then(res => {
      if (!res.success || !res.data) return;
      const d = res.data as ProfileResponse;
      const p = d.intern?.profile;
      const gradYear = p?.expectedGraduation
        ? new Date(p.expectedGraduation).getFullYear().toString()
        : "";
      setForm({
        phone: d.phone ?? "",
        college: p?.college ?? "",
        branch: p?.branch ?? "",
        graduationYear: gradYear,
        skills: p?.skills ?? [],
        linkedin: p?.linkedin ?? "",
        github: p?.github ?? "",
        bio: p?.bio ?? "",
      });
    });

    api.get<CertificateItem[]>("/certificates").then(res => {
      if (res.success && Array.isArray(res.data)) {
        setCertificates(res.data);
      }
    });
  }, []);

  function validate() {
    const e: Record<string, string | null> = {
      phone: validatePhone(form.phone),
      linkedin: validateLinkedIn(form.linkedin),
      github: validateGitHub(form.github),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleSave(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const expectedGraduation = form.graduationYear
      ? new Date(`${form.graduationYear}-06-01`).toISOString()
      : undefined;

    const res = await api.patch("/profiles/me", {
      phone: form.phone || undefined,
      college: form.college || undefined,
      branch: form.branch || undefined,
      expectedGraduation,
      skills: form.skills,
      linkedin: form.linkedin || undefined,
      github: form.github || undefined,
      bio: form.bio || undefined,
    });

    setSaving(false);
    if (res.success) {
      setToast({ message: "Profile saved successfully!", type: "success" });
      refetch();
    } else {
      setToast({ message: res.error?.message ?? "Failed to save profile.", type: "error" });
    }
  }

  async function handleChangePassword(ev: React.FormEvent) {
    ev.preventDefault();
    setPwLoading(true); setPwMsg(null);
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: "Passwords don't match", ok: false }); setPwLoading(false); return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMsg({ text: "New password must be at least 8 characters", ok: false }); setPwLoading(false); return;
    }
    const res = await api.post("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.newPw });
    setPwLoading(false);
    if (res.success) {
      setPwMsg({ text: "Password updated successfully!", ok: true });
      setPwForm({ current: "", newPw: "", confirm: "" });
    } else {
      setPwMsg({ text: res.error?.message ?? "Failed to update password", ok: false });
    }
  }

  const intern = user?.intern;
  const fullName = intern?.fullName ?? "";
  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "IN";
  const photoUrl = (intern?.profile as { photo?: string | null })?.photo ?? null;

  const displayedCerts = showAllCerts ? certificates : certificates.slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Profile Header ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
        <div className="px-6 pb-5 -mt-10 flex items-start gap-4">
          <Avatar initials={initials} photoUrl={photoUrl} />
          <div className="pt-11 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">{fullName}</h1>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {intern?.internshipRole?.name && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium">
                  {intern.internshipRole.name}
                </span>
              )}
              {intern?.batch?.name && (
                <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 font-medium">
                  {intern.batch.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-5">

        {/* 1. Personal Information */}
        <Card icon={User} title="Personal Information" accent="bg-blue-50 text-blue-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input value={fullName} readOnly className={`${inputBase} ${inputReadonly}`} />
            </Field>
            <Field label="Email Address">
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={user?.email ?? ""} readOnly className={`${inputBase} ${inputReadonly} pl-9`} />
              </div>
            </Field>
            <Field label="Phone Number" error={errors.phone}>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: null })); }}
                  placeholder="+91 98765 43210"
                  className={`${inputBase} pl-9 ${errors.phone ? inputError : ""}`}
                />
              </div>
            </Field>
          </div>
        </Card>

        {/* 2. Academic Information */}
        <Card icon={GraduationCap} title="Academic Information" accent="bg-violet-50 text-violet-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="College / Institute">
                <input
                  id="profile-college"
                  value={form.college}
                  onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                  placeholder="e.g. IIIT Hyderabad"
                  className={inputBase}
                />
              </Field>
            </div>
            <Field label="Degree / Branch">
              <input
                id="profile-branch"
                value={form.branch}
                onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                placeholder="e.g. B.Tech Computer Science"
                className={inputBase}
              />
            </Field>
            <Field label="Graduation Year">
              <input
                id="profile-graduation"
                type="number"
                min="2024"
                max="2035"
                value={form.graduationYear}
                onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))}
                placeholder="e.g. 2027"
                className={inputBase}
              />
            </Field>
          </div>
        </Card>

        {/* 3. Internship Information */}
        <Card icon={Briefcase} title="Internship Information" accent="bg-emerald-50 text-emerald-600">
          <div className="space-y-5">
            {/* Read-only internship details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Intern ID">
                <input value={intern?.scaleonId ?? ""} readOnly className={`${inputBase} ${inputReadonly}`} />
              </Field>
              <Field label="Role">
                <input value={intern?.internshipRole?.name ?? ""} readOnly className={`${inputBase} ${inputReadonly}`} />
              </Field>
              <Field label="Batch">
                <input value={intern?.batch?.name ?? ""} readOnly className={`${inputBase} ${inputReadonly}`} />
              </Field>
            </div>

            {/* Skills */}
            <Field label="Skills">
              <SkillChips skills={form.skills} onChange={v => setForm(f => ({ ...f, skills: v }))} />
              <p className="text-xs text-slate-400 mt-1.5">
                Press <kbd className="bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> or{" "}
                <kbd className="bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 text-[10px] font-mono">,</kbd> to add ·{" "}
                <kbd className="bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 text-[10px] font-mono">⌫</kbd> to remove last
              </p>
            </Field>

            {/* LinkedIn & GitHub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LinkedIn Profile" error={errors.linkedin}>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  <input
                    id="profile-linkedin"
                    type="url"
                    value={form.linkedin}
                    onChange={e => { setForm(f => ({ ...f, linkedin: e.target.value })); setErrors(er => ({ ...er, linkedin: null })); }}
                    placeholder="https://linkedin.com/in/yourname"
                    className={`${inputBase} pl-9 ${errors.linkedin ? inputError : ""}`}
                  />
                </div>
              </Field>
              <Field label="GitHub Profile" error={errors.github}>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="#1f2328"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  <input
                    id="profile-github"
                    type="url"
                    value={form.github}
                    onChange={e => { setForm(f => ({ ...f, github: e.target.value })); setErrors(er => ({ ...er, github: null })); }}
                    placeholder="https://github.com/yourusername"
                    className={`${inputBase} pl-9 ${errors.github ? inputError : ""}`}
                  />
                </div>
              </Field>
            </div>

            {/* About Me */}
            <Field label="About Me">
              <textarea
                id="profile-bio"
                value={form.bio}
                onChange={e => { if (e.target.value.length <= 250) setForm(f => ({ ...f, bio: e.target.value })); }}
                placeholder="Write a short bio about yourself, your interests, and your goals as an intern…"
                rows={4}
                maxLength={250}
                className={`${inputBase} resize-none`}
              />
              <div className="flex justify-end">
                <span className={`text-xs mt-1 tabular-nums ${form.bio.length >= 230 ? "text-amber-500" : "text-slate-400"}`}>
                  {form.bio.length} / 250
                </span>
              </div>
            </Field>
          </div>
        </Card>

        {/* ── Save Button ─────────────────────────────────────── */}
        {/* Mobile: sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-[40] bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 sm:hidden">
          <button
            type="submit"
            id="profile-save-mobile"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : "Save Changes"}
          </button>
        </div>

        {/* Desktop: inline button */}
        <div className="hidden sm:flex justify-end">
          <button
            type="submit"
            id="profile-save"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl px-8 py-2.5 text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── 4. My Certifications Section ──────────────────── */}
      <Card
        icon={Award}
        title="My Certifications"
        accent="bg-amber-50 text-amber-600"
        action={
          certificates.length > 2 ? (
            <button
              onClick={() => setShowAllCerts(!showAllCerts)}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition flex items-center gap-1"
            >
              {showAllCerts ? "Show Less" : `View All (${certificates.length})`}
              <ChevronRight size={13} className={showAllCerts ? "rotate-90" : ""} />
            </button>
          ) : undefined
        }
      >
        {certificates.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
            <div className="w-12 h-12 bg-amber-100/60 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">No certificates earned yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Complete your first course module on ScaleOn Study Portal to automatically earn your verified ScaleOn certificate!
              </p>
            </div>
            <a
              href="/intern/learning"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-1"
            >
              Go to Learning Courses <ChevronRight size={13} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedCerts.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} internName={fullName} />
            ))}
          </div>
        )}
      </Card>

      {/* ── Security ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Lock size={17} />
            </div>
            <h2 className="font-semibold text-slate-800 text-sm tracking-wide">Security</h2>
          </div>
          <button
            type="button"
            onClick={() => { setShowPw(!showPw); setPwMsg(null); }}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition"
          >
            {showPw ? "Cancel" : "Change Password"}
          </button>
        </div>

        {!showPw && (
          <div className="px-6 py-4">
            <p className="text-sm text-slate-500">Use a strong, unique password to keep your account secure.</p>
          </div>
        )}

        {showPw && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {pwMsg && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border ${pwMsg.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"}`}>
                {pwMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {pwMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["current", "newPw", "confirm"] as const).map(field => {
                const labels = { current: "Current Password", newPw: "New Password", confirm: "Confirm Password" };
                return (
                  <div key={field} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{labels[field]}</label>
                    <div className="relative">
                      <input
                        type={pwShow[field] ? "text" : "password"}
                        value={pwForm[field]}
                        onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder="••••••••"
                        className={`${inputBase} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setPwShow(s => ({ ...s, [field]: !s[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {pwShow[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
