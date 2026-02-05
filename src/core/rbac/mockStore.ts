import { UserSession } from './types';
import { getAllBackofficePermissions, getAllPortalPermissions } from './permissionCatalog';

const SESSION_KEY = 'seconci_auth_session';
const REMEMBER_KEY = 'seconci_remember_me';
const SESSION_EXPIRY_DAYS = 30;

export const SEED_USERS = {
  adminMaster: {
    id: 'admin-master-001',
    name: 'Admin Master SECONCI',
    email: 'admin@seconci.com.br',
    scope: 'BACKOFFICE' as const,
    tenantId: null,
    isAdminMaster: true,
    isClientAdmin: false,
    permissions: getAllBackofficePermissions(),
  },
  clientAdmin: {
    id: 'client-admin-001',
    name: 'Admin Cliente Demo',
    email: 'admin@empresa.com.br',
    scope: 'PORTAL' as const,
    tenantId: 'tenant_demo_001',
    isAdminMaster: false,
    isClientAdmin: true,
    permissions: getAllPortalPermissions(),
  },
} as const;

interface StoredSession {
  session: UserSession;
  expiresAt?: number;
}

function getStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function saveSession(session: UserSession | null, rememberMe = false): void {
  if (session) {
    const storedSession: StoredSession = {
      session,
      expiresAt: rememberMe
        ? Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        : undefined,
    };

    const storage = getStorage(rememberMe);
    storage.setItem(SESSION_KEY, JSON.stringify(storedSession));
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(rememberMe));

    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function loadSession(): UserSession | null {
  let stored: string | null = null;
  let rememberMe = false;

  try {
    const rememberMeStored = localStorage.getItem(REMEMBER_KEY);
    rememberMe = rememberMeStored ? JSON.parse(rememberMeStored) : false;
  } catch {
    rememberMe = false;
  }

  stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    stored = sessionStorage.getItem(SESSION_KEY);
  }

  if (!stored) return null;

  try {
    const storedSession: StoredSession = JSON.parse(stored);

    if (storedSession.expiresAt && Date.now() > storedSession.expiresAt) {
      clearSession();
      return null;
    }

    return storedSession.session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function isRememberMeEnabled(): boolean {
  try {
    const rememberMeStored = localStorage.getItem(REMEMBER_KEY);
    return rememberMeStored ? JSON.parse(rememberMeStored) : false;
  } catch {
    return false;
  }
}

export function mockSignIn(email: string, password: string): UserSession | null {
  if (email === SEED_USERS.adminMaster.email) {
    return SEED_USERS.adminMaster;
  }

  if (email === SEED_USERS.clientAdmin.email) {
    return SEED_USERS.clientAdmin;
  }

  return null;
}

export function mockSignUp(
  name: string,
  email: string,
  password: string,
  scope: 'BACKOFFICE' | 'PORTAL'
): UserSession {
  const newUser: UserSession = {
    id: `user-${Date.now()}`,
    name,
    email,
    scope,
    tenantId: scope === 'PORTAL' ? 'tenant_demo_001' : null,
    isAdminMaster: false,
    isClientAdmin: false,
    permissions: scope === 'PORTAL' ? getAllPortalPermissions() : [],
  };

  return newUser;
}

export function mockGoogleSignIn(): UserSession {
  return SEED_USERS.clientAdmin;
}

// ==================== RBAC ADMIN CRUD ====================

import type { Role, ManagedUser, Scope } from './types';

const ROLES_KEY = 'seconci_roles';
const MANAGED_USERS_KEY = 'seconci_managed_users';

// Seed initial data
function initializeRolesIfNeeded(): void {
  const existing = localStorage.getItem(ROLES_KEY);
  if (existing) return;

  const seedRoles: Role[] = [
    {
      id: 'role-backoffice-001',
      name: 'Backoffice – Operacional (Demo)',
      description: 'Perfil operacional com permissões básicas de consulta e gestão de contratos',
      scope: 'BACKOFFICE',
      tenantId: null,
      permissions: [
        'BACKOFFICE.CONTRATOS.VIEW_COMPANIES',
        'BACKOFFICE.CONTRATOS.VIEW_EMPLOYEES',
        'BACKOFFICE.CONTRATOS.EDIT_EMPLOYEES',
        'BACKOFFICE.CONTRATOS.VIEW_BILLING_RULES',
        'BACKOFFICE.FATURAMENTO.VIEW_BATCHES',
        'BACKOFFICE.FATURAMENTO.VIEW_BILLING',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'role-portal-001',
      name: 'Cliente – Consulta (Demo)',
      description: 'Perfil de consulta para clientes portal',
      scope: 'PORTAL',
      tenantId: 'tenant_demo_001',
      permissions: [
        'PORTAL.CADASTROS.VIEW_EMPLOYEES',
        'PORTAL.RELATORIOS.VIEW_DASHBOARD',
        'PORTAL.RELATORIOS.VIEW_REPORTS',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(ROLES_KEY, JSON.stringify(seedRoles));
}

function initializeManagedUsersIfNeeded(): void {
  const existing = localStorage.getItem(MANAGED_USERS_KEY);
  if (existing) return;

  const seedUsers: ManagedUser[] = [
    {
      id: 'muser-backoffice-001',
      name: 'João Silva',
      email: 'joao.silva@seconci.com.br',
      scope: 'BACKOFFICE',
      tenantId: null,
      roleId: 'role-backoffice-001',
      overrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'muser-portal-001',
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com.br',
      scope: 'PORTAL',
      tenantId: 'tenant_demo_001',
      roleId: 'role-portal-001',
      overrides: {
        'PORTAL.CADASTROS.EDIT_EMPLOYEES': true, // Override: concede permissão extra
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(seedUsers));
}

// Initialize on module load
initializeRolesIfNeeded();
initializeManagedUsersIfNeeded();

// ==================== ROLE CRUD ====================

export function listRoles(scope?: Scope, tenantId?: string | null): Role[] {
  const stored = localStorage.getItem(ROLES_KEY);
  if (!stored) return [];

  const roles: Role[] = JSON.parse(stored);

  return roles.filter((role) => {
    if (scope && role.scope !== scope) return false;
    if (tenantId !== undefined && role.tenantId !== tenantId) return false;
    return true;
  });
}

export function getRoleById(roleId: string): Role | null {
  const stored = localStorage.getItem(ROLES_KEY);
  if (!stored) return null;

  const roles: Role[] = JSON.parse(stored);
  return roles.find((r) => r.id === roleId) || null;
}

export function createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
  const stored = localStorage.getItem(ROLES_KEY);
  const roles: Role[] = stored ? JSON.parse(stored) : [];

  const newRole: Role = {
    ...role,
    id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  roles.push(newRole);
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));

  return newRole;
}

export function updateRole(roleId: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>): Role | null {
  const stored = localStorage.getItem(ROLES_KEY);
  if (!stored) return null;

  const roles: Role[] = JSON.parse(stored);
  const index = roles.findIndex((r) => r.id === roleId);

  if (index === -1) return null;

  roles[index] = {
    ...roles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  return roles[index];
}

export function deleteRole(roleId: string): { success: boolean; error?: string } {
  // Check if any users are using this role
  const users = listUsers();
  const usersWithRole = users.filter((u) => u.roleId === roleId);

  if (usersWithRole.length > 0) {
    return {
      success: false,
      error: `Não é possível excluir este perfil pois ${usersWithRole.length} usuário(s) estão vinculados a ele.`,
    };
  }

  const stored = localStorage.getItem(ROLES_KEY);
  if (!stored) return { success: false, error: 'Perfil não encontrado' };

  const roles: Role[] = JSON.parse(stored);
  const filtered = roles.filter((r) => r.id !== roleId);

  if (filtered.length === roles.length) {
    return { success: false, error: 'Perfil não encontrado' };
  }

  localStorage.setItem(ROLES_KEY, JSON.stringify(filtered));
  return { success: true };
}

// ==================== MANAGED USER CRUD ====================

export function listUsers(scope?: Scope, tenantId?: string | null): ManagedUser[] {
  const stored = localStorage.getItem(MANAGED_USERS_KEY);
  if (!stored) return [];

  const users: ManagedUser[] = JSON.parse(stored);

  return users.filter((user) => {
    if (scope && user.scope !== scope) return false;
    if (tenantId !== undefined && user.tenantId !== tenantId) return false;
    return true;
  });
}

export function getUserById(userId: string): ManagedUser | null {
  const stored = localStorage.getItem(MANAGED_USERS_KEY);
  if (!stored) return null;

  const users: ManagedUser[] = JSON.parse(stored);
  return users.find((u) => u.id === userId) || null;
}

export function createUser(user: Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'>): ManagedUser {
  const stored = localStorage.getItem(MANAGED_USERS_KEY);
  const users: ManagedUser[] = stored ? JSON.parse(stored) : [];

  const newUser: ManagedUser = {
    ...user,
    id: `muser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));

  return newUser;
}

export function updateUser(userId: string, updates: Partial<Omit<ManagedUser, 'id' | 'createdAt'>>): ManagedUser | null {
  const stored = localStorage.getItem(MANAGED_USERS_KEY);
  if (!stored) return null;

  const users: ManagedUser[] = JSON.parse(stored);
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));
  return users[index];
}

export function deleteUser(userId: string): { success: boolean; error?: string } {
  const stored = localStorage.getItem(MANAGED_USERS_KEY);
  if (!stored) return { success: false, error: 'Usuário não encontrado' };

  const users: ManagedUser[] = JSON.parse(stored);
  const filtered = users.filter((u) => u.id !== userId);

  if (filtered.length === users.length) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(filtered));
  return { success: true };
}

// ==================== USER ROLE & OVERRIDES ====================

export function setUserRole(userId: string, roleId: string | null): ManagedUser | null {
  return updateUser(userId, { roleId });
}

export function setUserOverride(userId: string, permissionKey: string, allowed: boolean): ManagedUser | null {
  const user = getUserById(userId);
  if (!user) return null;

  const newOverrides = {
    ...user.overrides,
    [permissionKey]: allowed,
  };

  return updateUser(userId, { overrides: newOverrides });
}

export function removeUserOverride(userId: string, permissionKey: string): ManagedUser | null {
  const user = getUserById(userId);
  if (!user) return null;

  const newOverrides = { ...user.overrides };
  delete newOverrides[permissionKey];

  return updateUser(userId, { overrides: newOverrides });
}
