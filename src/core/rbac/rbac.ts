import { UserSession, Scope } from './types';
import { isBackofficePermission, isPortalPermission } from './permissionCatalog';

export function hasPermission(session: UserSession | null, permission: string): boolean {
  if (!session) return false;

  if (session.isAdminMaster && isBackofficePermission(permission)) {
    return true;
  }

  if (session.isClientAdmin && isPortalPermission(permission)) {
    return true;
  }

  return session.permissions.includes(permission);
}

export function hasAnyPermission(session: UserSession | null, permissions: string[]): boolean {
  if (!session) return false;
  return permissions.some((perm) => hasPermission(session, perm));
}

export function hasAllPermissions(session: UserSession | null, permissions: string[]): boolean {
  if (!session) return false;
  return permissions.every((perm) => hasPermission(session, perm));
}

export function canAccessScope(session: UserSession | null, scope: Scope): boolean {
  if (!session) return false;
  return session.scope === scope;
}

export function assertTenant(session: UserSession | null, tenantId: string): boolean {
  if (!session) return false;

  if (session.scope === 'BACKOFFICE') {
    if (session.isAdminMaster) return true;
    return false;
  }

  if (session.scope === 'PORTAL') {
    return session.tenantId === tenantId;
  }

  return false;
}

export function canAccessRoute(session: UserSession | null, routeScope: Scope, routePermissions: string[]): boolean {
  if (!session) return false;

  if (!canAccessScope(session, routeScope)) {
    return false;
  }

  if (routePermissions.length === 0) {
    return true;
  }

  return hasAnyPermission(session, routePermissions);
}
