"use client";

import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useState } from "react";
import { HelpCircle, MessageCircle, Plus, Send } from "lucide-react";

interface Ticket { id: string; subject: string; description: string; category: string; priority: string; status: string; createdAt: string; messages: { id: string; message: string; senderType: string; createdAt: string }[] }

export default function SupportPage() {
  const { data: tickets, refetch } = useFetch<Ticket[]>("/learning/support/my-tickets");
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;
    setCreating(true);
    await api.post("/learning/support/tickets", { subject, description: desc });
    setCreating(false);
    setShowNew(false);
    setSubject(""); setDesc("");
    refetch();
  }

  const list = tickets ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><HelpCircle size={22} className="text-slate-500" /> Help & Support</h1>
          <p className="text-slate-500 text-sm mt-0.5">Need help? Create a support ticket</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm">
          <Plus size={14} /> New Ticket
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Create Support Ticket</h2>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe your issue..." required rows={3}
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition">
              <Send size={12} /> {creating ? 'Sending...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      )}

      {list.length === 0 && !showNew ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <MessageCircle size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No tickets yet</p>
          <p className="text-slate-400 text-xs mt-1">Click &quot;New Ticket&quot; if you need help.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">{t.subject}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{t.status}</span>
              </div>
              <p className="text-xs text-slate-500">{t.description}</p>
              <p className="text-[10px] text-slate-400 mt-2">{new Date(t.createdAt).toLocaleString()}</p>
              {t.messages.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {t.messages.map((m) => (
                    <div key={m.id} className={`text-xs p-2 rounded-lg ${m.senderType === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700'}`}>
                      <span className="font-semibold">{m.senderType === 'ADMIN' ? 'Admin' : 'You'}:</span> {m.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
