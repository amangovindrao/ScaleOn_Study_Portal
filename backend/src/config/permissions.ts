/**
 * Canonical permission catalog and default role -> permission mapping.
 *
 * Permissions are STORED IN THE DATABASE (see Permission / RolePermission
 * models). This file is the seed source of truth: the seeder reads it to
 * populate the tables. Runtime authorization always reads from the database,
 * never from this file, so admins can change role permissions live.
 */

export interface PermissionDef {
  key: string;
  name: string;
  group: string;
  description?: string;
}

export const PERMISSIONS: PermissionDef[] = [
  // Auth / sessions
  { key: 'session.view', name: 'View sessions', group: 'session' },
  { key: 'session.terminate', name: 'Terminate sessions', group: 'session' },
  { key: 'login_history.view', name: 'View login history', group: 'session' },

  // Interns
  { key: 'intern.view', name: 'View interns', group: 'intern' },
  { key: 'intern.create', name: 'Create interns', group: 'intern' },
  { key: 'intern.update', name: 'Update interns', group: 'intern' },
  { key: 'intern.delete', name: 'Delete interns', group: 'intern' },
  { key: 'intern.suspend', name: 'Suspend / activate interns', group: 'intern' },
  { key: 'intern.transfer', name: 'Transfer role / batch', group: 'intern' },
  { key: 'intern.extend', name: 'Extend internship', group: 'intern' },
  { key: 'intern.reset_password', name: 'Reset / regenerate intern password', group: 'intern' },

  // Admins
  { key: 'admin.view', name: 'View admins', group: 'admin' },
  { key: 'admin.create', name: 'Create admins', group: 'admin' },
  { key: 'admin.update', name: 'Update admins', group: 'admin' },
  { key: 'admin.delete', name: 'Delete admins', group: 'admin' },

  // Roles & permissions
  { key: 'role.view', name: 'View roles', group: 'role' },
  { key: 'role.manage', name: 'Create / update roles', group: 'role' },
  { key: 'role.assign_permissions', name: 'Assign permissions to roles', group: 'role' },

  // Internship roles & batches
  { key: 'internship_role.view', name: 'View internship roles', group: 'catalog' },
  { key: 'internship_role.manage', name: 'Manage internship roles', group: 'catalog' },
  { key: 'batch.view', name: 'View batches', group: 'catalog' },
  { key: 'batch.manage', name: 'Manage batches', group: 'catalog' },

  // Profiles
  { key: 'profile.view_any', name: 'View any profile', group: 'profile' },
  { key: 'profile.edit_any', name: 'Edit any profile', group: 'profile' },

  // System
  { key: 'settings.view', name: 'View settings', group: 'system' },
  { key: 'settings.manage', name: 'Manage settings', group: 'system' },
  { key: 'audit_log.view', name: 'View audit logs', group: 'system' },
  { key: 'activity_log.view', name: 'View activity logs', group: 'system' },
];

export const ROLE_DEFS = [
  { name: 'Super Admin', slug: 'super_admin', level: 100, isSystem: true, description: 'Full unrestricted access' },
  { name: 'Admin', slug: 'admin', level: 80, isSystem: true, description: 'Operational administration' },
  { name: 'Mentor', slug: 'mentor', level: 50, isSystem: true, description: 'Future mentor role (reserved)' },
  { name: 'Intern', slug: 'intern', level: 10, isSystem: true, description: 'Standard intern access' },
] as const;

/** Default permission keys per role slug. Super Admin implicitly gets all. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[] | '*'> = {
  super_admin: '*',
  admin: [
    'session.view',
    'session.terminate',
    'login_history.view',
    'intern.view',
    'intern.create',
    'intern.update',
    'intern.suspend',
    'intern.transfer',
    'intern.extend',
    'intern.reset_password',
    'internship_role.view',
    'internship_role.manage',
    'batch.view',
    'batch.manage',
    'profile.view_any',
    'profile.edit_any',
    'role.view',
    'role.manage',
    'role.assign_permissions',
    'activity_log.view',
  ],
  mentor: ['intern.view', 'profile.view_any', 'login_history.view'],
  intern: [],
};
