"use client";

import { useState } from "react";
import { useFetch } from "@/app/lib/hooks";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
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
  const { user } = useAuth();
  const { data: roles, loading, refetch } = useFetch<Role[]>("/roles");
  const { data: allPerms } = useFetch<Permission[]>("/roles/permissions/all");
  const [selected, setSelected] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkedPerms, setCheckedPerms] = useState<Set<string>>(new Set());

  const isSuperAdmin = user?.role?.slug === "super_admin";

  /**
   * Access Rules:
   * - System administrator roles ('super_admin' and 'admin') have fixed system permissions and are Read-only.
   * - Admins cannot edit, create, update, or delete other admins.
   * - Only Super Admin users (role.slug === "super_admin") can edit permissions for custom/operational roles (Mentor, Intern, etc.).
   * - Regular Admins can view role permissions, but cannot edit any role's permissions.
   */
  function canEdit(role: Role): boolean {
    if (role.slug === "super_admin" || role.slug === "admin") return false;
    return isSuperAdmin;
  }

  function openRole(role: Role) {
    setSelected(role);
    setCheckedPerms(new Set(role.permissions.map((p) => p.permission.id)));
  }

  async function handleSavePermissions() {
    if (!selected || !canEdit(selected)) return;
    setSaving(true);
    try {
      await api.put(`/roles/${selected.id}/permissions`, { permissionIds: [...checkedPerms] });
      refetch();
    } finally {
      setSaving(false);
    }
  }

  const groupedPerms = (allPerms as Permission[] | null)?.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles &amp; Permissions</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Database-driven RBAC — click a role to view its permissions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Role list */}
          <div className="space-y-3">
            {(roles as Role[] | null)?.map((role) => {
              const editable = canEdit(role);
              const isActive = selected?.id === role.id;
              return (
                <div key={role.id}
                  onClick={() => openRole(role)}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer transition shadow-sm select-none
                    ${isActive
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30"
                      : "border-slate-200 hover:border-slate-300"
                    }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-semibold">{role.name}</p>
                      {role.isSystem && <Badge variant="purple">System</Badge>}
                      {!editable && (
                        <span
                          className="text-slate-400 text-xs flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Read-only
                        </span>
                      )}
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
              );
            })}
          </div>

          {/* Permission editor */}
          {selected ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit sticky top-20 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 font-semibold">{selected.name} — Permissions</h2>
                {canEdit(selected) ? (
                  <button onClick={handleSavePermissions} disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2 transition">
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    View only
                  </span>
                )}
              </div>

              {!canEdit(selected) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-xs leading-relaxed">
                  {selected.slug === "super_admin" ? (
                    <>
                      <strong>Super Admin Role:</strong> Super Admin permissions are system default constants with full unrestricted access and cannot be modified.
                    </>
                  ) : selected.slug === "admin" ? (
                    <>
                      <strong>Admin System Role (Read-only):</strong> Admin permissions are system-defined. Admin accounts cannot create, update, or delete other admins; managing admin accounts is strictly reserved for Super Admin.
                    </>
                  ) : (
                    <>
                      <strong>Read-only Mode:</strong> Only a <strong>Super Admin</strong> can modify permissions for the <strong>{selected.name}</strong> role.
                    </>
                  )}
                </div>
              )}

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(groupedPerms).map(([group, perms]) => (
                  <div key={group}>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-semibold">{group}</p>
                    <div className="space-y-1">
                      {perms.map((perm) => (
                        <label key={perm.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
                          ${canEdit(selected) ? "hover:bg-slate-50 cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                          <input
                            type="checkbox"
                            checked={checkedPerms.has(perm.id)}
                            disabled={!canEdit(selected)}
                            onChange={(e) => {
                              if (!canEdit(selected)) return;
                              const next = new Set(checkedPerms);
                              e.target.checked ? next.add(perm.id) : next.delete(perm.id);
                              setCheckedPerms(next);
                            }}
                            className="accent-purple-500 w-4 h-4 disabled:cursor-not-allowed"
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center py-16">
              <p className="text-slate-500 text-sm">Select a role to view or edit permissions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
