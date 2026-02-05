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
