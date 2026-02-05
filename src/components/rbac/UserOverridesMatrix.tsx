import { useState, useMemo } from 'react';
import { Search, Check, X, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Scope, ManagedUser, Role } from '../../core/rbac/types';
import { getPermissionsByScope } from '../../core/rbac/permissionCatalog';

interface UserOverridesMatrixProps {
  scope: Scope;
  user: ManagedUser;
  role: Role | null;
  onOverrideChange: (permissionKey: string, allowed: boolean) => void;
  onOverrideRemove: (permissionKey: string) => void;
}

export function UserOverridesMatrix({
  scope,
  user,
  role,
  onOverrideChange,
  onOverrideRemove,
}: UserOverridesMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'overrides-only'>('all');

  const allPermissions = useMemo(() => getPermissionsByScope(scope), [scope]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof allPermissions> = {};
    allPermissions.forEach((perm) => {
      if (!groups[perm.module]) {
        groups[perm.module] = [];
      }
      groups[perm.module].push(perm);
    });
    return groups;
  }, [allPermissions]);

  const modules = Object.keys(groupedPermissions).sort();

  const getPermissionState = (permKey: string) => {
    const hasOverride = permKey in user.overrides;
    const overrideValue = user.overrides[permKey];
    const roleHas = role?.permissions.includes(permKey) || false;

    if (hasOverride) {
      return {
        effective: overrideValue,
        source: overrideValue ? 'override-grant' : 'override-deny',
        inherited: roleHas,
        hasOverride: true,
      };
    }

    return {
      effective: roleHas,
      source: 'role',
      inherited: roleHas,
      hasOverride: false,
    };
  };

  const filteredPermissions = useMemo(() => {
    let perms = allPermissions;

    if (selectedModule !== 'all') {
      perms = perms.filter((p) => p.module === selectedModule);
    }

    if (filterMode === 'overrides-only') {
      perms = perms.filter((p) => p.key in user.overrides);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      perms = perms.filter(
        (p) =>
          p.description.toLowerCase().includes(term) ||
          p.action.toLowerCase().includes(term) ||
          p.key.toLowerCase().includes(term)
      );
    }

    return perms;
  }, [allPermissions, selectedModule, filterMode, searchTerm, user.overrides]);

  const overrideCount = Object.keys(user.overrides).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar permissão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Módulos</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as 'all' | 'overrides-only')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas</option>
          <option value="overrides-only">Apenas Exceções</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {user.name} {role && `(Perfil: ${role.name})`}
          </p>
          <p className="text-sm text-gray-600">{overrideCount} exceções ativas</p>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
            <span className="text-gray-600">Herdado do perfil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-500 rounded" />
            <span className="text-gray-600">Exceção concedida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 rounded" />
            <span className="text-gray-600">Exceção negada</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border border-gray-200 rounded-lg">
        {filteredPermissions.map((perm) => {
          const state = getPermissionState(perm.key);

          return (
            <div
              key={perm.key}
              className={`p-4 border-b last:border-b-0 ${
                state.source === 'override-grant'
                  ? 'bg-green-50'
                  : state.source === 'override-deny'
                  ? 'bg-red-50'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{perm.action}</div>
                  <div className="text-sm text-gray-600">{perm.description}</div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">{perm.key}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 text-right min-w-[120px]">
                    {state.hasOverride ? (
                      <span
                        className={
                          state.source === 'override-grant' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'
                        }
                      >
                        {state.effective ? 'Concedida' : 'Negada'}
                        <br />
                        <span className="text-xs">(Exceção)</span>
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {state.inherited ? 'Concedida' : 'Não concedida'}
                        <br />
                        <span className="text-xs">(Herdado)</span>
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {state.hasOverride ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOverrideRemove(perm.key)}
                        title="Remover exceção e voltar a herdar do perfil"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={state.effective ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => onOverrideChange(perm.key, true)}
                          title="Conceder permissão (exceção)"
                          className={!state.effective ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={!state.effective ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => onOverrideChange(perm.key, false)}
                          title="Negar permissão (exceção)"
                          className={state.effective ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPermissions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma permissão encontrada
          </div>
        )}
      </div>
    </div>
  );
}
