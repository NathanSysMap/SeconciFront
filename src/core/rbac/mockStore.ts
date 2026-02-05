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
