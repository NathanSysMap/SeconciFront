import type {
  RoleDTO,
  UserDTO,
  UserOverrideDTO,
  CreateRoleInput,
  UpdateRoleInput,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  BatchOverridesInput,
  Scope,
  PermissionKey,
} from './types';
import type { Permission } from '../core/rbac/types';

export interface RolesService {
  list(scope: Scope, tenantId?: string | null): Promise<RoleDTO[]>;
  getById(id: string): Promise<RoleDTO | null>;
  create(input: CreateRoleInput): Promise<RoleDTO>;
  update(id: string, input: UpdateRoleInput): Promise<RoleDTO>;
  delete(id: string): Promise<void>;
}

export interface UsersService {
  list(scope: Scope, tenantId?: string | null): Promise<UserDTO[]>;
  getById(id: string): Promise<UserDTO | null>;
  create(input: CreateUserInput): Promise<UserDTO>;
  update(id: string, input: UpdateUserInput): Promise<UserDTO>;
  delete(id: string): Promise<void>;
  assignRole(userId: string, input: AssignRoleInput): Promise<UserDTO>;
}

export interface OverridesService {
  getUserOverrides(userId: string): Promise<UserOverrideDTO[]>;
  upsertBatch(input: BatchOverridesInput): Promise<UserOverrideDTO[]>;
}

export interface PermissionsService {
  listCatalog(scope?: Scope): Promise<Permission[]>;
}
