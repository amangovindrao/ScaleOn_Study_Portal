"use client";

import { useState } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Video, Calendar, Clock, ExternalLink, CheckCircle2, Sparkles } from "lucide-react";

interface Attendance { joinedAt: string | null; leftAt: string | null; attended: boolean }
interface LiveSession {
  id: string; title: string; description: string | null; hostName: string; meetingUrl: string | null;
  scheduledAt: string; duration: number | null; status: string; xpReward: number;
  _count: { attendees: number }; myAttendance: Attendance | null;
}

export default function LiveSessionsPage() {
  const { data: sessions, refetch } = useFetch<LiveSession[]>("/learning/live-sessions");
  const list = sessions ?? [];
  const [joining, setJoining] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ sessionId: string; message: string; xp: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(session: LiveSession) {
    setError(null);
    setJoining(session.id);
    const res = await api.post<{ alreadyJoined: boolean; awardedXp: number; message: string; meetingUrl: string | null }>(
      `/learning/live-sessions/${session.id}/join`
    );
    setJoining(null);

    if (!res.success || !res.data) {
      setError(res.error?.message ?? "Couldn't mark attendance. Please try again.");
      return;
    }

    setFeedback({ sessionId: session.id, message: res.data.message, xp: res.data.awardedXp });
    refetch();

    if (res.data.meetingUrl) {
      window.open(res.data.meetingUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Video size={22} className="text-rose-500" /> Live Sessions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Upcoming and ongoing sessions with mentors — join to mark attendance and earn XP</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <Video size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No upcoming sessions</p>
          <p className="text-slate-400 text-xs mt-1">Sessions will appear here when scheduled by admins.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((s) => {
            const attended = !!s.myAttendance?.attended;
            const isJoining = joining === s.id;
            const justAwarded = feedback?.sessionId === s.id;
            return (
              <div key={s.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {s.status === 'LIVE' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.status === 'LIVE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {s.status === 'LIVE' ? '● LIVE NOW' : 'UPCOMING'}
                      </span>
                      {attended && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Attended
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                    {s.description && <p className="text-slate-500 text-sm mt-1">{s.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(s.scheduledAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {s.duration && <span>{s.duration} min</span>}
                      <span>Host: {s.hostName}</span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1"><Sparkles size={11} /> +{s.xpReward} XP</span>
                    </div>
                    {justAwarded && (
                      <p className="mt-2 text-xs font-semibold text-emerald-600">{feedback.message}</p>
                    )}
                  </div>

                  {attended ? (
                    s.meetingUrl && (
                      <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition">
                        Open link <ExternalLink size={12} />
                      </a>
                    )
                  ) : (
                    <button onClick={() => handleJoin(s)} disabled={isJoining}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm">
                      {isJoining ? '...' : 'Join'} {!isJoining && <ExternalLink size={12} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}