"use client";

import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useState } from "react";
import { ClipboardList, CheckCircle, Clock, Send } from "lucide-react";

interface Submission { status: string; score: number | null; feedback: string | null; submittedAt: string | null }
interface Assignment { id: string; title: string; description: string | null; dueDate: string | null; maxScore: number; module: { title: string } | null; submissions: Submission[] }

export default function AssignmentsPage() {
  const { data: assignments, refetch } = useFetch<Assignment[]>("/learning/assignments");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function handleSubmit(id: string) {
    if (!text.trim()) return;
    setSubmitting(id);
    await api.post(`/learning/assignments/${id}/submit`, { submissionText: text });
    setText("");
    setSubmitting(null);
    refetch();
  }

  const list = assignments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList size={22} className="text-emerald-500" /> Assignments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Submit your work and get reviewed by mentors</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No assignments yet</p>
          <p className="text-slate-400 text-xs mt-1">Assignments will appear when created by your admin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((a) => {
            const sub = a.submissions[0];
            const isSubmitted = !!sub;
            return (
              <div key={a.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                      {isSubmitted && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sub.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : sub.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{sub.status}</span>}
                    </div>
                    {a.description && <p className="text-slate-500 text-xs mt-1">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {a.dueDate && <span className="flex items-center gap-1"><Clock size={11} /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                      <span>Max: {a.maxScore} pts</span>
                      {a.module && <span>Module: {a.module.title}</span>}
                    </div>
                    {sub?.feedback && <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">Feedback: {sub.feedback}</p>}
                    {sub?.score != null && <p className="text-xs text-blue-600 font-semibold mt-1">Score: {sub.score}/{a.maxScore}</p>}
                  </div>
                  {isSubmitted ? (
                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-1" />
                  ) : null}
                </div>
                {!isSubmitted && (
                  <div className="mt-4 flex gap-2">
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your submission (link or text)..."
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    <button onClick={() => handleSubmit(a.id)} disabled={submitting === a.id || !text.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition">
                      <Send size={12} /> Submit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
