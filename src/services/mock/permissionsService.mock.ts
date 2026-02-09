import type { PermissionsService } from '../../contracts/services';
import type { Scope } from '../../contracts/types';
import type { Permission } from '../../core/rbac/types';
import {
  PERMISSIONS,
  getPermissionsByScope,
} from '../../core/rbac/permissionCatalog';

class MockPermissionsService implements PermissionsService {
  async listCatalog(scope?: Scope): Promise<Permission[]> {
    if (scope) {
      return getPermissionsByScope(scope);
    }
    return PERMISSIONS;
  }
}

export const permissionsService = new MockPermissionsService();
