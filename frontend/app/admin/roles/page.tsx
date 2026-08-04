"use client";

import { useState } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { Spinner } from "@/app/components/ui/spinner";
import { Badge } from "@/app/components/ui/badge";

interface Permission { id: string; key: string; name: string; group: string }
interface Role {
  id: string; name: string; slug: string; level: number;
  isSystem: boolean; status: string; description: string | null;
  permissions: { permission: Permission }[];
  _count: { userAccounts: number };
}

export default function RolesPage() {
  const { data: roles, loading, refetch } = useFetch<Role[]>("/roles");
  const { data: allPerms } = useFetch<Permission[]>("/roles/permissions/all");
  const [selected, setSelected] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkedPerms, setCheckedPerms] = useState<Set<string>>(new Set());

  function openRole(role: Role) {
    setSelected(role);
    setCheckedPerms(new Set(role.permissions.map((p) => p.permission.id)));
  }

  async function handleSavePermissions() {
    if (!selected) return;
    setSaving(true);
    await api.put(`/roles/${selected.id}/permissions`, { permissionIds: [...checkedPerms] });
    setSaving(false);
    refetch();
  }

  const groupedPerms = (allPerms as Permission[] | null)?.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Database-driven RBAC — click a role to edit its permissions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Role list */}
          <div className="space-y-3">
            {(roles as Role[] | null)?.map((role) => (
              <div key={role.id}
                onClick={() => openRole(role)}
                className={`bg-white border rounded-2xl p-5 cursor-pointer transition shadow-sm
                  ${selected?.id === role.id ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 font-semibold">{role.name}</p>
                    {role.isSystem && <Badge variant="purple">System</Badge>}
                  </div>
                  <span className="text-slate-500 text-xs">Level {role.level}</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">{role.description ?? "No description"}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{role._count?.userAccounts ?? 0} users</span>
                  <span>·</span>
                  <span>{role.permissions.length} permissions</span>
                </div>
              </div>
            ))}
          </div>

          {/* Permission editor */}
          {selected ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit sticky top-20 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 font-semibold">{selected.name} — Permissions</h2>
                <button onClick={handleSavePermissions} disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2 transition">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(groupedPerms).map(([group, perms]) => (
                  <div key={group}>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{group}</p>
                    <div className="space-y-1">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checkedPerms.has(perm.id)}
                            onChange={(e) => {
                              const next = new Set(checkedPerms);
                              e.target.checked ? next.add(perm.id) : next.delete(perm.id);
                              setCheckedPerms(next);
                            }}
                            className="accent-purple-500 w-4 h-4"
                          />
                          <div>
                            <p className="text-slate-900 text-sm">{perm.name}</p>
                            <p className="text-slate-400 text-xs font-mono">{perm.key}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-center py-16">
              <p className="text-slate-400 text-sm">Select a role to edit permissions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
