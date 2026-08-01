"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge, statusBadge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, FormField } from "@/app/components/ui/input";

interface Intern {
  id: string; scaleonId: string; fullName: string; status: string;
  overallProgress: number; createdAt: string;
  internshipRole: { name: string; code: string } | null;
  batch: { name: string; code: string } | null;
  mentor: { fullName: string } | null;
  userAccount: { email: string; username: string | null; status: string; lastLoginAt: string | null };
}
interface InternshipRole { id: string; name: string; code: string }
interface Batch { id: string; name: string; code: string }
interface Pagination { page: number; pageSize: number; total: number; totalPages: number }

interface BulkRow { fullName: string; email: string; internId: string; phone: string; internshipRoleId: string; batchId: string }

export default function InternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState<InternshipRole[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdResults, setCreatedResults] = useState<{internId: string; password: string; fullName: string}[]>([]);

  // Single form
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", internId: "", internshipRoleId: "", batchId: "", startDate: "", endDate: "" });

  // Bulk form
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" },
    { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" },
    { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" },
  ]);

  useEffect(() => {
    api.get<InternshipRole[]>("/catalog/internship-roles").then((r) => { if (r.success) setRoles((r.data as InternshipRole[]) ?? []); });
    api.get<Batch[]>("/catalog/batches").then((r) => { if (r.success) setBatches((r.data as Batch[]) ?? []); });
  }, []);

  const loadInterns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20", sortBy: "createdAt", sortOrder: "desc",
      ...(search ? { search } : {}), ...(roleFilter ? { internshipRoleId: roleFilter } : {}), ...(statusFilter ? { status: statusFilter } : {}),
    });
    const res = await api.get<Intern[]>(`/interns?${params}`);
    if (res.success) { setInterns((res.data as Intern[]) ?? []); setPagination(res.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 }); }
    setLoading(false);
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { loadInterns(); }, [loadInterns]);

  async function handleSingleCreate(e: React.FormEvent) {
    e.preventDefault(); setCreateError(null); setCreateLoading(true);
    const res = await api.post<{intern:{scaleonId:string};internId:string;temporaryPassword:string}>("/interns", {
      ...form, internId: form.internId.trim(),
      batchId: form.batchId || undefined, startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined, phone: form.phone || undefined,
    });
    setCreateLoading(false);
    if (!res.success) { setCreateError(res.error?.message ?? "Failed"); return; }
    const d = res.data as {intern:{scaleonId:string};internId:string;temporaryPassword:string};
    setCreatedResults([{ internId: d.internId, password: d.temporaryPassword, fullName: form.fullName }]);
    loadInterns();
  }

  async function handleBulkCreate(e: React.FormEvent) {
    e.preventDefault(); setCreateError(null);
    const valid = bulkRows.filter((r) => r.fullName.trim() && r.email.trim() && r.internId.trim() && r.internshipRoleId);
    if (valid.length === 0) { setCreateError("Add at least one intern with name, email, intern ID, and role."); return; }
    setCreateLoading(true);
    const results: {internId:string;password:string;fullName:string}[] = [];
    const errors: string[] = [];
    for (const row of valid) {
      const res = await api.post<{intern:{scaleonId:string};internId:string;temporaryPassword:string}>("/interns", {
        fullName: row.fullName, email: row.email, internId: row.internId.trim(),
        phone: row.phone || undefined, internshipRoleId: row.internshipRoleId, batchId: row.batchId || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as {intern:{scaleonId:string};internId:string;temporaryPassword:string};
        results.push({ internId: d.internId, password: d.temporaryPassword, fullName: row.fullName });
      } else { errors.push(`${row.fullName}: ${res.error?.message ?? "Failed"}`); }
    }
    setCreateLoading(false);
    if (results.length > 0) setCreatedResults(results);
    if (errors.length > 0) setCreateError(errors.join("\n"));
    loadInterns();
  }

  function addBulkRow() { setBulkRows([...bulkRows, { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" }]); }
  function removeBulkRow(i: number) { setBulkRows(bulkRows.filter((_, idx) => idx !== i)); }
  function updateBulkRow(i: number, field: keyof BulkRow, value: string) {
    setBulkRows(bulkRows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function closeModal() {
    setCreateOpen(false); setCreatedResults([]); setCreateError(null); setMode("single");
    setForm({ fullName: "", email: "", phone: "", internId: "", internshipRoleId: "", batchId: "", startDate: "", endDate: "" });
    setBulkRows([{ fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" }, { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" }, { fullName: "", email: "", internId: "", phone: "", internshipRoleId: "", batchId: "" }]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Intern Management</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total} registered interns</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Interns
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 flex-1">
            <input type="text" placeholder="Search name, email, ID…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-xl px-4 py-2.5 text-sm transition-all font-medium">Search</button>
          </form>
          <div className="flex gap-2 flex-wrap">
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              <option value="">All Roles</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              <option value="">All Status</option>
              {["ACTIVE","ON_HOLD","COMPLETED","DROPPED","SUSPENDED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (<div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : interns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m5.66-4.13A4 4 0 1112 4a4 4 0 014.66 7.87M9 11a4 4 0 110-8 4 4 0 010 8z" /></svg>
            <p className="text-sm font-medium">No interns found</p>
            <p className="text-xs mt-1">Click &quot;Add Interns&quot; to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium">Intern</th>
                  <th className="text-left px-4 py-3.5 font-medium hidden md:table-cell">ScaleOn ID</th>
                  <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">Role</th>
                  <th className="text-left px-4 py-3.5 font-medium">Status</th>
                  <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">Progress</th>
                  <th className="text-right px-5 py-3.5 font-medium">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {interns.map((intern) => (
                    <tr key={intern.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4"><div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                          {intern.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div><p className="text-slate-900 font-medium text-sm">{intern.fullName}</p><p className="text-slate-400 text-xs">{intern.userAccount.email}</p></div>
                      </div></td>
                      <td className="px-4 py-4 hidden md:table-cell"><span className="text-slate-500 font-mono text-xs bg-slate-50 px-2 py-1 rounded-lg">{intern.scaleonId}</span></td>
                      <td className="px-4 py-4 hidden lg:table-cell"><Badge variant="purple">{intern.internshipRole?.code ?? "—"}</Badge></td>
                      <td className="px-4 py-4">{statusBadge(intern.status)}</td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px] overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{width:`${intern.overallProgress}%`}} /></div><span className="text-slate-400 text-xs w-8">{intern.overallProgress}%</span></div>
                      </td>
                      <td className="px-5 py-4 text-right"><Link href={`/admin/interns/${intern.id}`} className="text-xs text-blue-600 hover:text-blue-700 transition font-medium">View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200">
                <p className="text-slate-400 text-xs">{(page-1)*pagination.pageSize+1}–{Math.min(page*pagination.pageSize,pagination.total)} of {pagination.total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-30 transition">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(pagination.totalPages, p+1))} disabled={page===pagination.totalPages} className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-30 transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={closeModal} title="Add Interns" maxWidth="max-w-3xl">
        {createdResults.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-400 font-semibold text-sm mb-1">✅ {createdResults.length} intern(s) created!</p>
              <p className="text-slate-400 text-xs">Credentials shown once only. Copy or share them now.</p>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {createdResults.map((r, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-3 text-xs">
                  <div><p className="text-slate-400">Name</p><p className="text-slate-900 font-medium">{r.fullName}</p></div>
                  <div><p className="text-slate-400">Intern ID (Login)</p><p className="text-slate-900 font-mono">{r.internId}</p></div>
                  <div><p className="text-slate-400">Password</p><p className="text-blue-300 font-mono">{r.password}</p></div>
                </div>
              ))}
            </div>
            {createError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs whitespace-pre-wrap">{createError}</div>}
            <button onClick={closeModal} className="w-full bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold rounded-xl py-3 text-sm transition-all">Done</button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Mode switch */}
            <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button onClick={() => setMode("single")} className={`flex-1 py-2 text-sm rounded-lg transition-all font-medium ${mode==="single" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-900"}`}>Single</button>
              <button onClick={() => setMode("bulk")} className={`flex-1 py-2 text-sm rounded-lg transition-all font-medium ${mode==="bulk" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-900"}`}>Bulk (Multiple)</button>
            </div>
            {createError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-600 text-sm">{createError}</div>}

            {mode === "single" ? (
              <form onSubmit={handleSingleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name *"><Input required value={form.fullName} onChange={(e) => setForm(f=>({...f, fullName:e.target.value}))} placeholder="Arjun Sharma" /></FormField>
                  <FormField label="Intern ID *"><Input required value={form.internId} onChange={(e) => setForm(f=>({...f, internId:e.target.value}))} placeholder="SOINT260003" /></FormField>
                  <FormField label="Email *"><Input type="email" required value={form.email} onChange={(e) => setForm(f=>({...f, email:e.target.value}))} placeholder="arjun@email.com" /></FormField>
                  <FormField label="Role *"><Select required value={form.internshipRoleId} onChange={(e) => setForm(f=>({...f, internshipRoleId:e.target.value}))}><option value="">Select…</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</Select></FormField>
                  <FormField label="Batch"><Select value={form.batchId} onChange={(e) => setForm(f=>({...f, batchId:e.target.value}))}><option value="">Select…</option>{batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormField>
                  <FormField label="Phone"><Input value={form.phone} onChange={(e) => setForm(f=>({...f, phone:e.target.value}))} placeholder="+91 9876543210" /></FormField>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-500 rounded-xl py-3 text-sm hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={createLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-900 font-semibold rounded-xl py-3 text-sm transition-all">{createLoading?"Creating…":"Create Intern"}</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkCreate} className="space-y-4">
                <p className="text-slate-400 text-xs">Add multiple interns at once. Fill in the rows below — empty rows are skipped.</p>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {bulkRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
                      <Input placeholder="Full Name *" value={row.fullName} onChange={(e) => updateBulkRow(i, "fullName", e.target.value)} />
                      <Input placeholder="Intern ID *" value={row.internId} onChange={(e) => updateBulkRow(i, "internId", e.target.value)} />
                      <Input placeholder="Email *" type="email" value={row.email} onChange={(e) => updateBulkRow(i, "email", e.target.value)} />
                      <Select value={row.internshipRoleId} onChange={(e) => updateBulkRow(i, "internshipRoleId", e.target.value)}><option value="">Role *</option>{roles.map(r=><option key={r.id} value={r.id}>{r.code}</option>)}</Select>
                      <button type="button" onClick={() => removeBulkRow(i)} className="text-slate-300 hover:text-red-400 transition p-2" aria-label="Remove row">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBulkRow} className="text-xs text-blue-600 hover:text-blue-700 transition font-medium">+ Add another row</button>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-500 rounded-xl py-3 text-sm hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={createLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-900 font-semibold rounded-xl py-3 text-sm transition-all">{createLoading?"Creating…":`Create ${bulkRows.filter(r=>r.fullName&&r.email&&r.internId&&r.internshipRoleId).length} Intern(s)`}</button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
