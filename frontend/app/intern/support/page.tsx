"use client";

import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useState, useEffect } from "react";
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Mail,
  UserCheck,
  Paperclip
} from "lucide-react";

interface TicketMessage {
  id: string;
  message: string;
  senderType: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
}

const FAQS = [
  {
    question: "How do I submit my weekly assignment?",
    answer: "Navigate to the 'Assignments' section in your intern dashboard, select the active assignment, enter your submission link (GitHub/Drive), and click 'Submit Assignment'.",
    category: "Assignments"
  },
  {
    question: "What should I do if I miss a live session?",
    answer: "All live sessions are recorded. You can view past recordings under the 'Live Sessions' tab within 24 hours of completion.",
    category: "Sessions"
  },
  {
    question: "How is my daily streak and XP calculated?",
    answer: "Your streak increases every day you complete a learning module or submit an assignment. Higher streak counts grant XP bonuses on the leaderboard!",
    category: "Gamification"
  },
  {
    question: "Who should I contact for attendance or stipend queries?",
    answer: "For administrative queries regarding stipends or attendance logs, create a ticket with category 'General' or reach out to HR at support@scaleon.com.",
    category: "General"
  }
];

export default function SupportPage() {
  const { data: tickets, refetch } = useFetch<Ticket[]>("/learning/support/my-tickets");
  const [localTickets, setLocalTickets] = useState<Ticket[] | null>(null);

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<"tickets" | "faq">("tickets");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form states
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Thread & reply states
  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync fetched tickets to local state
  useEffect(() => {
    if (tickets) {
      setLocalTickets(tickets);
    }
  }, [tickets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<Ticket>("/learning/support/tickets", {
        subject,
        description: desc,
        category,
        priority
      });
      if (res.success && res.data) {
        const createdTicket = { ...res.data, messages: res.data.messages || [] };
        setLocalTickets((prev) => [createdTicket, ...(prev || [])]);
      }
      setShowNew(false);
      setSubject("");
      setDesc("");
      setCategory("general");
      setPriority("MEDIUM");
      refetch();
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(ticketId: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    // Optimistic UI update
    setLocalTickets((prev) => (prev ? prev.filter((t) => t.id !== ticketId) : []));
    setDeletingId(ticketId);
    try {
      await api.delete(`/learning/support/tickets/${ticketId}`);
      refetch();
    } catch (err) {
      console.error("Failed to delete ticket", err);
      refetch();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReply(ticketId: string, e: React.FormEvent) {
    e.preventDefault();
    const text = replyText[ticketId]?.trim();
    if (!text) return;

    setReplyingId(ticketId);
    const tempMsgId = "temp-" + Date.now();
    const newMsg: TicketMessage = {
      id: tempMsgId,
      message: text,
      senderType: "INTERN",
      createdAt: new Date().toISOString()
    };

    // Optimistically update thread and set status to OPEN if resolved
    setLocalTickets((prev) =>
      prev
        ? prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: t.status === "RESOLVED" ? "OPEN" : t.status,
                  messages: [...(t.messages || []), newMsg]
                }
              : t
          )
        : []
    );
    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));

    try {
      await api.post(`/learning/support/tickets/${ticketId}/messages`, { message: text });
      refetch();
    } catch (err) {
      console.error("Failed to reply to ticket", err);
      refetch();
    } finally {
      setReplyingId(null);
    }
  }

  async function handleToggleStatus(ticketId: string, currentStatus: string) {
    const nextStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    // Optimistically update status
    setLocalTickets((prev) =>
      prev
        ? prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
        : []
    );

    try {
      await api.patch(`/learning/support/tickets/${ticketId}/status`, { status: nextStatus });
      refetch();
    } catch (err) {
      console.error("Failed to update ticket status", err);
      refetch();
    }
  }

  const list = localTickets ?? tickets ?? [];

  // Metrics
  const totalCount = list.length;
  const openCount = list.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const resolvedCount = list.filter((t) => t.status === "RESOLVED").length;

  // Filtered List
  const filteredList = list.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "OPEN"
        ? t.status === "OPEN" || t.status === "IN_PROGRESS"
        : t.status === statusFilter;

    const matchesPriority = priorityFilter === "ALL" ? true : t.priority === priorityFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={22} className="text-blue-600" /> Help & Support Hub
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Need help? Get quick answers or raise a support ticket</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === "tickets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              My Tickets ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === "faq" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              FAQ & Knowledge Base
            </button>
          </div>
          <button
            onClick={() => {
              setActiveTab("tickets");
              setShowNew(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus size={14} /> New Ticket
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Tickets</p>
            <p className="text-lg font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active / Pending</p>
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
      </div>

      {/* New Ticket Form Modal/Card */}
      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" /> Create Support Ticket
            </h2>
            <span className="text-xs text-slate-400">Fill in details below</span>
          </div>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Issue Subject / Summary..."
            required
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="general">General Query</option>
                <option value="technical">Technical / Platform Issue</option>
                <option value="academic">Academic / Learning Module</option>
                <option value="other">Other Administrative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Blocker)</option>
              </select>
            </div>
          </div>

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe your issue in detail. You can include code snippets or steps to reproduce..."
            required
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Paperclip size={14} /> Attachments supported via link
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition shadow-xs"
              >
                <Send size={12} /> {creating ? "Sending..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Tab Content */}
      {activeTab === "tickets" ? (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets by keyword..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-medium text-slate-600">
                {["ALL", "OPEN", "RESOLVED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      statusFilter === status ? "bg-white text-slate-900 font-semibold shadow-xs" : "hover:text-slate-900"
                    }`}
                  >
                    {status === "ALL" ? "All" : status === "OPEN" ? "Open" : "Resolved"}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
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
          {filteredList.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-xs">
              <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No support tickets found</p>
              <p className="text-slate-400 text-xs mt-1">
                {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                  ? "Try clearing your filters or search query."
                  : "Click 'New Ticket' above if you need assistance."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{t.subject}</h3>
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

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(t.id, t.status)}
                        title={t.status === "RESOLVED" ? "Re-open ticket" : "Mark ticket as resolved"}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      >
                        {t.status === "RESOLVED" ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        title="Delete ticket"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {t.description}
                  </p>

                  <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleString()}</p>

                  {/* Thread Messages */}
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
                                {m.senderType === "ADMIN" ? "🛡️ Support Mentor (Admin)" : "You"}
                              </span>
                              <span className="text-[9px] opacity-60">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Live Reply Form */}
                    <form onSubmit={(e) => handleReply(t.id, e)} className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={replyText[t.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                        placeholder="Type your reply here..."
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
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* FAQ & Knowledge Base Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Accordion List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" /> Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden transition shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between font-medium text-xs text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                        {faq.category}
                      </span>
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Quick Contact Box */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck size={20} />
                <h3 className="text-sm font-semibold">Assigned Mentor Support</h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Need direct guidance on assignments or learning phases? You can contact your program lead directly.
              </p>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs space-y-1 text-xs">
                <p className="font-semibold text-white">ScaleOn Support Desk</p>
                <p className="text-blue-100 text-[11px]">Mon - Fri | 10:00 AM - 7:00 PM IST</p>
              </div>
              <a
                href="mailto:support@scaleon.com"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-blue-50 transition w-full justify-center"
              >
                <Mail size={14} /> Contact Support via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
