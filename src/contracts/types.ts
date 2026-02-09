export type Scope = 'BACKOFFICE' | 'PORTAL';
export type PermissionKey = string;
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface RoleDTO {
  id: string;
  name: string;
  description?: string;
  scope: Scope;
  tenantId: string | null;
  permissions: PermissionKey[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  scope: Scope;
  tenantId: string | null;
  roleId: string | null;
  status: UserStatus;
  phone?: string;
  jobTitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserOverrideDTO {
  userId: string;
  permissionKey: PermissionKey;
  allowed: boolean;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  scope: Scope;
  tenantId?: string | null;
  permissions: PermissionKey[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: PermissionKey[];
}

export interface CreateUserInput {
  name: string;
  email: string;
  scope: Scope;
  tenantId?: string | null;
  roleId?: string | null;
  status?: UserStatus;
  phone?: string;
  jobTitle?: string;
}

export interface UpdateUserInput {
  name?: string;
  roleId?: string | null;
  status?: UserStatus;
  phone?: string;
  jobTitle?: string;
}

export interface AssignRoleInput {
  roleId: string | null;
}

export interface BatchOverridesInput {
  userId: string;
  changes: Array<{
    permissionKey: PermissionKey;
    allowed: boolean | null;
  }>;
}
