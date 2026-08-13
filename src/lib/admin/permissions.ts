export type AdminRole = 'ADMIN_GERAL' | 'EDITOR' | 'CURADOR_VEREDAS' | 'OPERADOR';

export type AdminPermission =
  | 'admin:access'
  | 'modules:manage'
  | 'series:edit'
  | 'series:publish'
  | 'series:delete'
  | 'email:manage'
  | 'veredas:manage'
  | 'prayer:manage'
  | 'prayer:personal-requests'
  | 'ebf:manage'
  | 'users:manage';

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  ADMIN_GERAL: ['admin:access', 'modules:manage', 'series:edit', 'series:publish', 'series:delete', 'email:manage', 'veredas:manage', 'prayer:manage', 'prayer:personal-requests', 'ebf:manage', 'users:manage'],
  EDITOR: ['admin:access', 'series:edit'],
  CURADOR_VEREDAS: ['admin:access', 'veredas:manage'],
  OPERADOR: ['admin:access', 'prayer:manage', 'ebf:manage'],
};

export function hasAdminPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function mapLegacyCuradoriaRole(role: 'ADMIN' | 'CURADOR' | 'EDITOR' | 'OPERADOR'): AdminRole {
  if (role === 'ADMIN') return 'ADMIN_GERAL';
  if (role === 'CURADOR') return 'CURADOR_VEREDAS';
  return role;
}

export function toPersistedAdminRole(role: AdminRole): 'ADMIN' | 'CURADOR' | 'EDITOR' | 'OPERADOR' {
  if (role === 'ADMIN_GERAL') return 'ADMIN';
  if (role === 'CURADOR_VEREDAS') return 'CURADOR';
  return role;
}
