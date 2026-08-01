"use client";

import { useFetch } from "@/app/lib/hooks";
import { Video, Calendar, Clock, ExternalLink } from "lucide-react";

interface LiveSession { id: string; title: string; description: string | null; hostName: string; meetingUrl: string | null; scheduledAt: string; duration: number | null; status: string; _count: { attendees: number } }

export default function LiveSessionsPage() {
  const { data: sessions } = useFetch<LiveSession[]>("/learning/live-sessions");
  const list = sessions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Video size={22} className="text-rose-500" /> Live Sessions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Upcoming and ongoing sessions with mentors</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
          <Video size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No upcoming sessions</p>
          <p className="text-slate-400 text-xs mt-1">Sessions will appear here when scheduled by admins.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {s.status === 'LIVE' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.status === 'LIVE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {s.status === 'LIVE' ? '● LIVE NOW' : 'UPCOMING'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                  {s.description && <p className="text-slate-500 text-sm mt-1">{s.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(s.scheduledAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {s.duration && <span>{s.duration} min</span>}
                    <span>Host: {s.hostName}</span>
                  </div>
                </div>
                {s.meetingUrl && (
                  <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm">
                    Join <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
