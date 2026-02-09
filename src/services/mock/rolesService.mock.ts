import type { RolesService } from '../../contracts/services';
import type {
  RoleDTO,
  CreateRoleInput,
  UpdateRoleInput,
  Scope,
} from '../../contracts/types';
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
} from '../../core/rbac/mockStore';

class MockRolesService implements RolesService {
  async list(scope: Scope, tenantId?: string | null): Promise<RoleDTO[]> {
    const roles = listRoles(scope, tenantId);
    return roles.map(this.toDTO);
  }

  async getById(id: string): Promise<RoleDTO | null> {
    const allRoles = [...listRoles('BACKOFFICE'), ...listRoles('PORTAL')];
    const role = allRoles.find((r) => r.id === id);
    return role ? this.toDTO(role) : null;
  }

  async create(input: CreateRoleInput): Promise<RoleDTO> {
    const role = createRole(input);
    return this.toDTO(role);
  }

  async update(id: string, input: UpdateRoleInput): Promise<RoleDTO> {
    const role = updateRole(id, input);
    return this.toDTO(role);
  }

  async delete(id: string): Promise<void> {
    const users = listUsers('BACKOFFICE').concat(listUsers('PORTAL'));
    const usersWithRole = users.filter((u) => u.roleId === id);

    if (usersWithRole.length > 0) {
      throw new Error(
        `Não é possível excluir este perfil pois existem ${usersWithRole.length} usuário(s) vinculado(s) a ele.`
      );
    }

    deleteRole(id);
  }

  private toDTO(role: any): RoleDTO {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      scope: role.scope,
      tenantId: role.tenantId,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

export const rolesService = new MockRolesService();
