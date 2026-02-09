import type { UsersService } from '../../contracts/services';
import type {
  UserDTO,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  Scope,
} from '../../contracts/types';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../core/rbac/mockStore';

class MockUsersService implements UsersService {
  async list(scope: Scope, tenantId?: string | null): Promise<UserDTO[]> {
    const users = listUsers(scope, tenantId);
    return users.map(this.toDTO);
  }

  async getById(id: string): Promise<UserDTO | null> {
    const allUsers = [...listUsers('BACKOFFICE'), ...listUsers('PORTAL')];
    const user = allUsers.find((u) => u.id === id);
    return user ? this.toDTO(user) : null;
  }

  async create(input: CreateUserInput): Promise<UserDTO> {
    const userData = {
      name: input.name,
      email: input.email,
      scope: input.scope,
      tenantId: input.scope === 'PORTAL' ? input.tenantId || null : null,
      roleId: input.roleId || null,
      overrides: {},
    };

    const user = createUser(userData);
    return this.toDTO(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const existingUser = await this.getById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.roleId !== undefined) updateData.roleId = input.roleId;

    const user = updateUser(id, updateData);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return this.toDTO(user);
  }

  async delete(id: string): Promise<void> {
    const result = deleteUser(id);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao excluir usuário');
    }
  }

  async assignRole(userId: string, input: AssignRoleInput): Promise<UserDTO> {
    const user = updateUser(userId, { roleId: input.roleId });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return this.toDTO(user);
  }

  private toDTO(user: any): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      scope: user.scope,
      tenantId: user.tenantId,
      roleId: user.roleId,
      status: 'ACTIVE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const usersService = new MockUsersService();
