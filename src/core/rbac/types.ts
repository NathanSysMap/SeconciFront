export type Scope = 'BACKOFFICE' | 'PORTAL';

export interface Permission {
  key: string;
  scope: Scope;
  module: string;
  action: string;
  description: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  scope: Scope;
  tenantId: string | null;
  isAdminMaster: boolean;
  isClientAdmin: boolean;
  permissions: string[];
}

export interface RoleTemplate {
  name: string;
  scope: Scope;
  permissions: string[];
  isAdminMaster?: boolean;
  isClientAdmin?: boolean;
}

export interface LegacyUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operational' | 'company';
  company_id?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: Scope;
  tenantId: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  scope: Scope;
  tenantId: string | null;
  roleId: string | null;
  overrides: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface EffectivePermission {
  key: string;
  granted: boolean;
  source: 'role' | 'override-grant' | 'override-deny';
}
