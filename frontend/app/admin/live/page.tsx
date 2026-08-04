"use client";

import { useState } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { Input, Textarea, FormField } from "@/app/components/ui/input";
import { Video, Users, Pencil, Trash2, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

interface LiveSession {
  id: string; title: string; description: string | null; hostName: string; meetingUrl: string | null;
  scheduledAt: string; duration: number | null; status: string; xpReward: number; recordingUrl: string | null;
  _count: { attendees: number };
}

interface Attendee {
  id: string; joinedAt: string | null; leftAt: string | null; attended: boolean;
  intern: { fullName: string; scaleonId: string; internshipRole: { name: string; code: string } | null };
}

const STATUS_BADGE: Record<string, "blue" | "red" | "green" | "gray"> = {
  SCHEDULED: "blue", LIVE: "red", COMPLETED: "green", CANCELLED: "gray",
};

const emptyForm = { title: "", description: "", hostName: "", meetingUrl: "", scheduledAt: "", duration: "", xpReward: "15" };

export default function AdminLiveSessionsPage() {
  const { data: sessions, loading, refetch } = useFetch<LiveSession[]>("/learning/live-sessions/admin");
  const list = sessions ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LiveSession | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [attendeesFor, setAttendeesFor] = useState<LiveSession | null>(null);
  const [attendees, setAttendees] = useState<Attendee[] | null>(null);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(session: LiveSession) {
    setEditing(session);
    setForm({
      title: session.title,
      description: session.description ?? "",
      hostName: session.hostName,
      meetingUrl: session.meetingUrl ?? "",
      scheduledAt: session.scheduledAt.slice(0, 16),
      duration: session.duration != null ? String(session.duration) : "",
      xpReward: String(session.xpReward),
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || undefined,
      hostName: form.hostName,
      meetingUrl: form.meetingUrl || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      duration: form.duration ? parseInt(form.duration) : undefined,
      xpReward: form.xpReward ? parseInt(form.xpReward) : undefined,
    };
    const res = editing
      ? await api.patch(`/learning/live-sessions/${editing.id}`, payload)
      : await api.post("/learning/live-sessions/create", payload);
    setSaving(false);
    if (!res.success) { setFormError(res.error?.message ?? "Failed to save session"); return; }
    setFormOpen(false);
    refetch();
  }

  async function handleStatusChange(session: LiveSession, status: string) {
    await api.patch(`/learning/live-sessions/${session.id}`, { status });
    refetch();
  }

  async function handleDelete(session: LiveSession) {
    if (!confirm(`Delete "${session.title}"? This also removes its attendance records.`)) return;
    await api.delete(`/learning/live-sessions/${session.id}`);
    refetch();
  }

  async function openAttendees(session: LiveSession) {
    setAttendeesFor(session);
    setAttendees(null);
    setAttendeesLoading(true);
    const res = await api.get<{ attendees: Attendee[] }>(`/learning/live-sessions/${session.id}/attendees`);
    setAttendeesLoading(false);
    if (res.success && res.data) setAttendees((res.data as { attendees: Attendee[] }).attendees);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Video size={22} className="text-rose-500" /> Live Sessions
          </h1>
          <p className="text-slate-500 text-sm mt-1">Schedule sessions, track attendance, and set XP rewards</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Video size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No live sessions yet</p>
          <p className="text-slate-400 text-xs mt-1">Schedule one so interns can join and earn XP.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {list.map((s) => (
            <div key={s.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-slate-900 font-semibold text-sm">{s.title}</p>
                  <Badge variant={STATUS_BADGE[s.status] ?? "gray"}>{s.status}</Badge>
                  <span className="text-amber-600 text-xs font-semibold">+{s.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                  <span>{new Date(s.scheduledAt).toLocaleString()}</span>
                  {s.duration && <span>{s.duration} min</span>}
                  <span>Host: {s.hostName}</span>
                  <button onClick={() => openAttendees(s)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                    <Users size={12} /> {s._count.attendees} attended
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {s.status === "SCHEDULED" && (
                  <button onClick={() => handleStatusChange(s, "LIVE")} title="Start session"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"><PlayCircle size={16} /></button>
                )}
                {(s.status === "SCHEDULED" || s.status === "LIVE") && (
                  <button onClick={() => handleStatusChange(s, "COMPLETED")} title="Mark completed"
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"><CheckCircle2 size={16} /></button>
                )}
                {(s.status === "SCHEDULED" || s.status === "LIVE") && (
                  <button onClick={() => handleStatusChange(s, "CANCELLED")} title="Cancel session"
                    className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"><XCircle size={16} /></button>
                )}
                <button onClick={() => openEdit(s)} title="Edit"
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(s)} title="Delete"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Live Session" : "Schedule Live Session"}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{formError}</div>}
          <FormField label="Title *">
            <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Welcome & Orientation — Live Q&A" />
          </FormField>
          <FormField label="Description">
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What this session covers" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Host Name *">
              <Input required value={form.hostName} onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))} placeholder="Mentor name" />
            </FormField>
            <FormField label="Meeting URL">
              <Input type="url" value={form.meetingUrl} onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))} placeholder="https://meet.google.com/..." />
            </FormField>
            <FormField label="Scheduled At *">
              <Input type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
            </FormField>
            <FormField label="Duration (min)">
              <Input type="number" min="1" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="60" />
            </FormField>
            <FormField label="XP Reward">
              <Input type="number" min="0" max="500" value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))} placeholder="15" />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              {saving ? "Saving…" : editing ? "Save Changes" : "Schedule Session"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!attendeesFor} onClose={() => setAttendeesFor(null)} title={`Attendance — ${attendeesFor?.title ?? ""}`}>
        {attendeesLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !attendees || attendees.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No interns have joined this session yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {attendees.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-900 font-medium">{a.intern.fullName}</p>
                  <p className="text-slate-400 text-xs">{a.intern.scaleonId} · {a.intern.internshipRole?.name ?? "—"}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {a.joinedAt ? new Date(a.joinedAt).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
