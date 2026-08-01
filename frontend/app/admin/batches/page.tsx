"use client";

import { useState } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { statusBadge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { Input, Select, FormField } from "@/app/components/ui/input";

interface Batch {
  id: string; name: string; code: string;
  startDate: string | null; endDate: string | null;
  capacity: number | null; status: string;
  createdAt: string;
  _count: { interns: number };
}

export default function BatchesPage() {
  const { data: batches, loading, refetch } = useFetch<Batch[]>("/catalog/batches");
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", startDate: "", endDate: "", capacity: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    const res = await api.post("/catalog/batches", {
      name: form.name, code: form.code.toUpperCase(),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    });
    setCreateLoading(false);
    if (!res.success) { setCreateError(res.error?.message ?? "Failed"); return; }
    setCreateOpen(false);
    setForm({ name: "", code: "", startDate: "", endDate: "", capacity: "" });
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Batches</h1>
          <p className="text-slate-500 text-sm mt-0.5">{(batches as Batch[] | null)?.length ?? 0} batches total</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-semibold rounded-xl px-4 py-2.5 text-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Batch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(batches as Batch[] | null)?.map((batch) => (
            <div key={batch.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-900 font-semibold">{batch.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{batch.code}</p>
                </div>
                {statusBadge(batch.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Start</p>
                  <p className="text-white">{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500">End</p>
                  <p className="text-white">{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Interns</p>
                  <p className="text-white">{batch._count?.interns ?? 0}</p>
                </div>
                <div>
                  <p className="text-slate-500">Capacity</p>
                  <p className="text-white">{batch.capacity ?? "∞"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Batch">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">{createError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Batch Name *" htmlFor="b-name">
              <Input id="b-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Batch 2026 - Jul" />
            </FormField>
            <FormField label="Code *" htmlFor="b-code">
              <Input id="b-code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="B2607" />
            </FormField>
            <FormField label="Start Date" htmlFor="b-start">
              <Input id="b-start" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </FormField>
            <FormField label="End Date" htmlFor="b-end">
              <Input id="b-end" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </FormField>
            <FormField label="Capacity" htmlFor="b-cap">
              <Input id="b-cap" type="number" min="1" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="50" />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="flex-1 border border-white/15 text-slate-600 rounded-xl py-2.5 text-sm hover:bg-white/5 transition">Cancel</button>
            <button type="submit" disabled={createLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-slate-900 font-semibold rounded-xl py-2.5 text-sm transition">
              {createLoading ? "Creating…" : "Create Batch"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
