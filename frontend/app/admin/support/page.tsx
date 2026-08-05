"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  User,
  AlertTriangle,
} from "lucide-react";

interface TicketMessage {
  id: string;
  message: string;
  senderType: string;
  createdAt: string;
}

interface AdminTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
  intern?: {
    id: string;
    scaleonId: string;
    fullName: string;
  };
}

export default function AdminSupportPage() {
  const { data: tickets, loading, refetch } = useFetch<AdminTicket[]>(
    "/learning/support/all-tickets"
  );
  const [localTickets, setLocalTickets] = useState<AdminTicket[] | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (tickets) setLocalTickets(tickets);
  }, [tickets]);

  const list = localTickets ?? tickets ?? [];

  const totalCount = list.length;
  const openCount = list.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = list.filter((t) => t.status === "RESOLVED").length;
  const urgentCount = list.filter(
    (t) => t.priority === "URGENT" && t.status !== "RESOLVED"
  ).length;

  const filteredList = list.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "OPEN"
        ? t.status === "OPEN" || t.status === "IN_PROGRESS"
        : t.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" ? true : t.priority === priorityFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.intern?.fullName?.toLowerCase().includes(query) ||
      t.intern?.scaleonId?.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesQuery;
  });

  async function handleReply(ticketId: string, e: React.FormEvent) {
    e.preventDefault();
    const text = replyText[ticketId]?.trim();
    if (!text) return;

    setReplyingId(ticketId);
    const tempMsg: TicketMessage = {
      id: "temp-" + Date.now(),
      message: text,
      senderType: "ADMIN",
      createdAt: new Date().toISOString(),
    };

    setLocalTickets((prev) =>
      prev
        ? prev.map((t) =>
            t.id === ticketId
              ? { ...t, messages: [...(t.messages || []), tempMsg] }
              : t
          )
        : []
    );
    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));

    try {
      await api.post(`/learning/support/tickets/${ticketId}/admin-messages`, {
        message: text,
      });
      refetch();
    } catch (err) {
      console.error("Failed to send reply", err);
      refetch();
    } finally {
      setReplyingId(null);
    }
  }

  async function handleToggleStatus(ticketId: string, currentStatus: string) {
    const nextStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    setLocalTickets((prev) =>
      prev
        ? prev.map((t) =>
            t.id === ticketId ? { ...t, status: nextStatus } : t
          )
        : []
    );

    try {
      await api.patch(`/learning/support/tickets/${ticketId}/admin-status`, {
        status: nextStatus,
      });
      refetch();
    } catch (err) {
      console.error("Failed to update status", err);
      refetch();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={22} className="text-blue-600" /> Support Tickets
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View and respond to intern support requests
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total</p>
            <p className="text-lg font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Open</p>
            <p className="text-lg font-bold text-slate-900">{openCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Resolved</p>
            <p className="text-lg font-bold text-slate-900">{resolvedCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Urgent (Open)</p>
            <p className="text-lg font-bold text-slate-900">{urgentCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, intern name, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-medium text-slate-600">
            {["ALL", "OPEN", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === status
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                {status === "ALL" ? "All" : status === "OPEN" ? "Open" : "Resolved"}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-xs">
          <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No support tickets found</p>
          <p className="text-slate-400 text-xs mt-1">
            {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
              ? "Try clearing your filters or search query."
              : "No interns have raised a ticket yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <div
                key={t.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={13} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        {t.intern?.fullName ?? "Unknown Intern"}
                      </span>
                      {t.intern?.scaleonId && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.intern.scaleonId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {t.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          t.priority === "URGENT"
                            ? "bg-red-50 text-red-600"
                            : t.priority === "HIGH"
                            ? "bg-orange-50 text-orange-600"
                            : t.priority === "MEDIUM"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        t.status === "OPEN" || t.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                      }`}
                    >
                      {t.status}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(t.id, t.status)}
                      title={
                        t.status === "RESOLVED"
                          ? "Re-open ticket"
                          : "Mark ticket as resolved"
                      }
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      {t.status === "RESOLVED" ? (
                        <RotateCcw size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {t.description}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    {isExpanded
                      ? "Hide conversation"
                      : `View conversation (${t.messages?.length ?? 0})`}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {t.messages && t.messages.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {t.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`text-xs p-3 rounded-xl ${
                              m.senderType === "ADMIN"
                                ? "bg-blue-50/80 text-blue-900 border border-blue-100/80 ml-2"
                                : "bg-slate-100 text-slate-800 border border-slate-200/60 mr-2"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-[11px]">
                                {m.senderType === "ADMIN"
                                  ? "🛡️ You (Admin)"
                                  : t.intern?.fullName ?? "Intern"}
                              </span>
                              <span className="text-[9px] opacity-60">
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => handleReply(t.id, e)}
                      className="flex items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        value={replyText[t.id] || ""}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [t.id]: e.target.value })
                        }
                        placeholder="Type your reply as admin..."
                        className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="submit"
                        disabled={replyingId === t.id || !replyText[t.id]?.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 transition shadow-xs"
                      >
                        <Send size={12} /> Reply
                      </button>
                    </form>
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