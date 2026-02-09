import type { OverridesService } from '../../contracts/services';
import type { UserOverrideDTO, BatchOverridesInput } from '../../contracts/types';
import {
  listUsers,
  updateUser,
} from '../../core/rbac/mockStore';

class MockOverridesService implements OverridesService {
  async getUserOverrides(userId: string): Promise<UserOverrideDTO[]> {
    const allUsers = [...listUsers('BACKOFFICE'), ...listUsers('PORTAL')];
    const user = allUsers.find((u) => u.id === userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const overrides: UserOverrideDTO[] = [];
    for (const [permissionKey, allowed] of Object.entries(user.overrides)) {
      overrides.push({
        userId,
        permissionKey,
        allowed: allowed as boolean,
      });
    }

    return overrides;
  }

  async upsertBatch(input: BatchOverridesInput): Promise<UserOverrideDTO[]> {
    const allUsers = [...listUsers('BACKOFFICE'), ...listUsers('PORTAL')];
    const user = allUsers.find((u) => u.id === input.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const currentOverrides = { ...user.overrides };

    for (const change of input.changes) {
      if (change.allowed === null) {
        delete currentOverrides[change.permissionKey];
      } else {
        currentOverrides[change.permissionKey] = change.allowed;
      }
    }

    updateUser(input.userId, { overrides: currentOverrides });

    return this.getUserOverrides(input.userId);
  }
}

export const overridesService = new MockOverridesService();
