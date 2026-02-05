import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Scope } from '../../core/rbac/types';
import { getPermissionsByScope } from '../../core/rbac/permissionCatalog';

interface PermissionMatrixProps {
  scope: Scope;
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export function PermissionMatrix({ scope, selectedPermissions, onChange }: PermissionMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

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

  const filteredPermissions = useMemo(() => {
    let perms = allPermissions;

    if (selectedModule !== 'all') {
      perms = perms.filter((p) => p.module === selectedModule);
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
  }, [allPermissions, selectedModule, searchTerm]);

  const togglePermission = (permKey: string) => {
    if (selectedPermissions.includes(permKey)) {
      onChange(selectedPermissions.filter((p) => p !== permKey));
    } else {
      onChange([...selectedPermissions, permKey]);
    }
  };

  const toggleModule = (module: string) => {
    const modulePerms = groupedPermissions[module].map((p) => p.key);
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !modulePerms.includes(p)));
    } else {
      const newPerms = [...selectedPermissions];
      modulePerms.forEach((p) => {
        if (!newPerms.includes(p)) {
          newPerms.push(p);
        }
      });
      onChange(newPerms);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
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
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          {selectedPermissions.length} de {allPermissions.length} permissões selecionadas
        </p>
      </div>

      {selectedModule === 'all' ? (
        <div className="space-y-4">
          {modules.map((module) => {
            const modulePerms = groupedPermissions[module];
            const selectedCount = modulePerms.filter((p) =>
              selectedPermissions.includes(p.key)
            ).length;
            const allSelected = selectedCount === modulePerms.length;

            return (
              <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="bg-gray-100 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleModule(module)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        allSelected
                          ? 'bg-blue-500 border-blue-500'
                          : selectedCount > 0
                          ? 'bg-blue-200 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {allSelected && <Check className="w-4 h-4 text-white" />}
                      {selectedCount > 0 && !allSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{module}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedCount} / {modulePerms.length}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  {modulePerms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{perm.action}</div>
                        <div className="text-sm text-gray-600">{perm.description}</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">{perm.key}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 border border-gray-200 rounded-lg p-4">
          {filteredPermissions.map((perm) => (
            <label
              key={perm.key}
              className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm.key)}
                onChange={() => togglePermission(perm.key)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{perm.action}</div>
                <div className="text-sm text-gray-600">{perm.description}</div>
                <div className="text-xs text-gray-400 mt-1 font-mono">{perm.key}</div>
              </div>
            </label>
          ))}

          {filteredPermissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma permissão encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
